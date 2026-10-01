import 'server-only';
import { slugify } from '@/lib/utils';
import { normalizeEmail } from '@/lib/auth/permissions';
import {
  findAccountByEmail,
  generateOtpCode,
  generateToken,
  hashSecret,
  INVITE_TTL_MS,
  MAX_OTP_ATTEMPTS,
  OTP_TTL_MS,
  readAuthStore,
  REGISTER_TOKEN_TTL_MS,
  secretsEqual,
  writeAuthStore,
  type InviteRecord,
} from '@/lib/auth/server-store';
import { sendInviteEmail, sendOtpEmail } from '@/lib/email/send';
import {
  serverCreate,
  serverGetFullDatabase,
  serverUpdate,
} from '@/lib/cms/server-repository';
import { getSiteUrl } from '@/lib/seo/site-url';
import {
  hashPasswordSecure,
  verifyPasswordSecure,
} from '@/lib/auth/password';
import { allowDevOtpExposure } from '@/lib/security/runtime';
import { RESERVED_PEOPLE_CATEGORY_SLUGS } from '@/lib/content/people-slugs';
import type { Person, PersonCategory } from '@/types/content';
import type { AuthSession } from '@/types/auth';

function nowIso() {
  return new Date().toISOString();
}

function siteOrigin(): string {
  return getSiteUrl();
}

export async function nextPersonOrder(): Promise<number> {
  const db = await serverGetFullDatabase();
  const max = db.people.reduce(
    (acc, person) => Math.max(acc, person.order ?? 0),
    0,
  );
  return max + 1;
}

export async function findPersonByEmail(
  email: string,
): Promise<Person | undefined> {
  const normalized = normalizeEmail(email);
  const db = await serverGetFullDatabase();
  return db.people.find(
    (p) => p.email && normalizeEmail(p.email) === normalized,
  );
}

type InviteResult =
  | {
      ok: true;
      person: Person;
      inviteUrl: string | null;
      emailSent: boolean;
      inviteToken: string | null;
    }
  | { ok: false; error: string };

function uniquePersonSlug(
  taken: Set<string>,
  name: string,
): string {
  const base = slugify(name) || `member-${Date.now()}`;
  let slug = base;
  let n = 2;
  while (taken.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

async function issueInvite(
  person: Person,
  email: string,
): Promise<{ inviteUrl: string; emailSent: boolean; inviteToken: string }> {
  const store = await readAuthStore();
  store.invites = store.invites.filter(
    (inv) => inv.personId !== person.id || inv.consumedAt,
  );
  const token = generateToken();
  const invite: InviteRecord = {
    token,
    personId: person.id,
    email,
    createdAt: nowIso(),
    expiresAt: Date.now() + INVITE_TTL_MS,
    consumedAt: null,
  };
  store.invites.push(invite);
  await writeAuthStore(store);

  const inviteUrl = `${siteOrigin()}/register?invite=${token}`;
  const emailResult = await sendInviteEmail({
    to: email,
    name: person.name,
    role: person.role,
    inviteUrl,
  });
  return { inviteUrl, emailSent: emailResult.sent, inviteToken: token };
}

export async function adminInvitePerson(input: {
  name: string;
  email?: string;
  role: string;
  category: PersonCategory;
  sectionSlug?: string | null;
  /** Defaults to true so older callers still email. Pass false to add only. */
  sendInvite?: boolean;
}): Promise<InviteResult> {
  const name = input.name.trim();
  const role = input.role.trim();
  const emailRaw = input.email?.trim() ?? '';
  const email = emailRaw ? normalizeEmail(emailRaw) : '';
  const sendInvite = input.sendInvite !== false;
  if (!name || !role) {
    return { ok: false, error: 'Name and position are required.' };
  }
  if (email && !email.includes('@')) {
    return { ok: false, error: 'Enter a valid email, or leave it blank.' };
  }
  if (sendInvite && !email.includes('@')) {
    return {
      ok: false,
      error: 'Add an email to send the invite, or add them without sending.',
    };
  }

  const db = await serverGetFullDatabase();
  const sectionSlug = input.sectionSlug?.trim() || null;
  let category = input.category;
  if (sectionSlug) {
    const known = (db.siteSettings.teamSections ?? []).some(
      (section) => section.slug === sectionSlug,
    );
    if (!known) {
      return { ok: false, error: 'Choose a team section that exists.' };
    }
    category = 'other';
  }

  const existing = email ? await findPersonByEmail(email) : undefined;
  if (existing?.accountId) {
    return { ok: false, error: 'This email already has an account.' };
  }

  let person = existing;
  if (!person) {
    const taken = new Set([
      ...db.people.map((row) => row.slug),
      ...Object.keys(RESERVED_PEOPLE_CATEGORY_SLUGS),
      ...(db.siteSettings.teamSections ?? []).map((section) => section.slug),
    ]);
    const order =
      db.people.reduce((acc, row) => Math.max(acc, row.order ?? 0), 0) + 1;
    person = await serverCreate('people', {
      name,
      slug: uniquePersonSlug(taken, name),
      status: 'published',
      role,
      category,
      bio: '',
      shortBio: '',
      email: email || undefined,
      researchInterests: [],
      socialLinks: [],
      photoUrl: null,
      accountId: null,
      claimStatus: email ? 'unclaimed' : undefined,
      verificationCode: null,
      appointmentYear: null,
      sectionSlug,
      order,
    });
  } else {
    const updated = await serverUpdate('people', person.id, {
      name,
      role,
      category,
      email: email || undefined,
      sectionSlug,
      claimStatus: 'unclaimed',
    });
    if (!updated) {
      return { ok: false, error: 'Could not update the person record.' };
    }
    person = updated;
  }

  if (!sendInvite || !email) {
    return {
      ok: true,
      person,
      inviteUrl: null,
      emailSent: false,
      inviteToken: null,
    };
  }

  const issued = await issueInvite(person, email);
  return { ok: true, person, ...issued };
}

/** Send (or resend) the account invite for someone already on the roster. */
export async function sendPersonInvite(personId: string): Promise<InviteResult> {
  const db = await serverGetFullDatabase();
  const person = db.people.find((row) => row.id === personId);
  if (!person) return { ok: false, error: 'That person was not found.' };
  if (person.accountId) {
    return { ok: false, error: 'This person already has an account.' };
  }
  const email = person.email ? normalizeEmail(person.email) : '';
  if (!email.includes('@')) {
    return {
      ok: false,
      error: 'Add an email on the profile before sending an invite.',
    };
  }
  const issued = await issueInvite(person, email);
  return { ok: true, person, ...issued };
}

export async function resolveInvite(
  token: string,
): Promise<
  | { ok: true; email: string; person: Person }
  | { ok: false; error: string }
> {
  const store = await readAuthStore();
  const invite = store.invites.find((i) => i.token === token);
  if (!invite || invite.consumedAt) {
    return { ok: false, error: 'This invite link is invalid or already used.' };
  }
  if (invite.expiresAt < Date.now()) {
    return { ok: false, error: 'This invite link has expired.' };
  }
  const db = await serverGetFullDatabase();
  const person = db.people.find((p) => p.id === invite.personId);
  if (!person) {
    return { ok: false, error: 'The invited profile was not found.' };
  }
  return { ok: true, email: invite.email, person };
}

export async function requestOtp(input: {
  email: string;
  inviteToken?: string | null;
}): Promise<
  | {
      ok: true;
      personPreview: { name: string; email: string; role: string };
      /** Only when email provider is not configured */
      devOtp?: string;
    }
  | { ok: false; error: string }
> {
  const email = normalizeEmail(input.email);
  if (input.inviteToken) {
    const invite = await resolveInvite(input.inviteToken);
    if (!invite.ok) return invite;
    if (normalizeEmail(invite.email) !== email) {
      return { ok: false, error: 'Use the email address from your invitation.' };
    }
  }

  const person = await findPersonByEmail(email);
  if (!person?.email) {
    return {
      ok: false,
      error:
        'This email is not on the BKSR team list yet. Ask an administrator to invite you, or apply via Join.',
    };
  }
  if (person.accountId) {
    return {
      ok: false,
      error: 'An account already exists for this email. Please sign in.',
    };
  }

  const store = await readAuthStore();
  if (findAccountByEmail(store, email)) {
    return {
      ok: false,
      error: 'An account already exists for this email. Please sign in.',
    };
  }

  const otp = generateOtpCode();
  store.otps[email] = {
    codeHash: hashSecret(otp, 'bksr-otp-v1'),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    personId: person.id,
    email,
  };
  await writeAuthStore(store);

  const mail = await sendOtpEmail({ to: email, name: person.name, otp });

  return {
    ok: true,
    personPreview: {
      name: person.name,
      email,
      role: person.role,
    },
    ...(allowDevOtpExposure() && !mail.sent ? { devOtp: otp } : {}),
  };
}

export async function verifyOtp(input: {
  email: string;
  otp: string;
}): Promise<
  | {
      ok: true;
      registerToken: string;
      personPreview: { name: string; email: string; role: string };
    }
  | { ok: false; error: string }
> {
  const email = normalizeEmail(input.email);
  const store = await readAuthStore();
  const record = store.otps[email];
  if (!record) {
    return { ok: false, error: 'No verification code found. Request a new one.' };
  }
  if (record.expiresAt < Date.now()) {
    delete store.otps[email];
    await writeAuthStore(store);
    return { ok: false, error: 'That code expired. Request a new one.' };
  }
  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    return { ok: false, error: 'Too many attempts. Request a new code.' };
  }
  record.attempts += 1;
  const ok = secretsEqual(
    record.codeHash,
    hashSecret(input.otp.trim(), 'bksr-otp-v1'),
  );
  if (!ok) {
    await writeAuthStore(store);
    return { ok: false, error: 'Incorrect verification code.' };
  }

  const db = await serverGetFullDatabase();
  const person = db.people.find((p) => p.id === record.personId);
  if (!person) {
    return { ok: false, error: 'Profile not found.' };
  }

  delete store.otps[email];
  const token = generateToken();
  store.registerTokens = store.registerTokens.filter(
    (t) => t.email !== email && t.expiresAt > Date.now(),
  );
  store.registerTokens.push({
    token,
    email,
    personId: person.id,
    expiresAt: Date.now() + REGISTER_TOKEN_TTL_MS,
  });
  await writeAuthStore(store);

  return {
    ok: true,
    registerToken: token,
    personPreview: {
      name: person.name,
      email,
      role: person.role,
    },
  };
}

export async function findRegisterToken(
  registerToken: string,
): Promise<{ email: string; personId: string } | null> {
  const store = await readAuthStore();
  const row = store.registerTokens.find(
    (t) => t.token === registerToken && t.expiresAt > Date.now(),
  );
  if (!row) return null;
  return { email: row.email, personId: row.personId };
}

export async function completeRegistration(input: {
  registerToken: string;
  password: string;
  profile: {
    name: string;
    shortBio: string;
    bio: string;
    photoUrl?: string;
    affiliation?: string;
  };
  inviteToken?: string | null;
}): Promise<
  | { ok: true; session: AuthSession; personSlug: string; sessionToken: string }
  | { ok: false; error: string }
> {
  if (input.password.trim().length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }
  const name = input.profile.name.trim();
  const shortBio = input.profile.shortBio.trim();
  const bio = input.profile.bio.trim() || shortBio;
  if (!name || !shortBio) {
    return {
      ok: false,
      error: 'Name and a short bio are required to create your profile.',
    };
  }

  const store = await readAuthStore();
  const tokenRow = store.registerTokens.find(
    (t) => t.token === input.registerToken,
  );
  if (!tokenRow || tokenRow.expiresAt < Date.now()) {
    return {
      ok: false,
      error: 'Registration session expired. Start again from your email.',
    };
  }

  if (findAccountByEmail(store, tokenRow.email)) {
    return { ok: false, error: 'An account already exists for this email.' };
  }

  const stamp = nowIso();
  const passwordHash = await hashPasswordSecure(input.password);
  const accountId = generateToken();
  const account = {
    id: accountId,
    email: tokenRow.email,
    passwordHash,
    role: 'member' as const,
    personId: tokenRow.personId,
    emailVerifiedAt: stamp,
    createdAt: stamp,
    updatedAt: stamp,
  };
  store.accounts.push(account);

  const person = await serverUpdate('people', tokenRow.personId, {
    name,
    shortBio,
    bio,
    photoUrl: input.profile.photoUrl?.trim() || null,
    affiliation: input.profile.affiliation?.trim() || undefined,
    accountId,
    claimStatus: 'claimed',
    status: 'published',
    publishedAt: stamp,
  });
  if (!person) {
    return { ok: false, error: 'Could not update the profile.' };
  }

  if (input.inviteToken) {
    const invite = store.invites.find((i) => i.token === input.inviteToken);
    if (invite) invite.consumedAt = stamp;
  }

  store.registerTokens = store.registerTokens.filter(
    (t) => t.token !== input.registerToken,
  );

  const sessionToken = generateToken();
  const session: AuthSession = {
    accountId,
    email: tokenRow.email,
    role: 'member',
    personId: tokenRow.personId,
    personSlug: person.slug,
    createdAt: stamp,
  };
  store.sessions[sessionToken] = {
    ...session,
    token: sessionToken,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  await writeAuthStore(store);

  return {
    ok: true,
    session,
    personSlug: person.slug,
    sessionToken,
  };
}

const MEMBER_SESSION_MS = 60 * 60 * 12 * 1000;
const MEMBER_REMEMBER_MS = 60 * 60 * 24 * 30 * 1000;

export async function loginWithPassword(input: {
  email: string;
  password: string;
  remember?: boolean;
}): Promise<
  | { ok: true; session: AuthSession; sessionToken: string }
  | { ok: false; error: string }
> {
  const email = normalizeEmail(input.email);
  const store = await readAuthStore();
  const account = findAccountByEmail(store, email);
  if (!account) {
    return { ok: false, error: 'Invalid email or password.' };
  }
  const verified = await verifyPasswordSecure(
    input.password,
    account.passwordHash,
  );
  if (!verified.ok) {
    return { ok: false, error: 'Invalid email or password.' };
  }
  if (verified.needsRehash) {
    account.passwordHash = await hashPasswordSecure(input.password);
    account.updatedAt = nowIso();
  }
  const sessionToken = generateToken();
  let personSlug: string | null = null;
  if (account.personId) {
    const db = await serverGetFullDatabase();
    personSlug =
      db.people.find((p) => p.id === account.personId)?.slug ?? null;
  }
  const session: AuthSession = {
    accountId: account.id,
    email: account.email,
    role: account.role,
    personId: account.personId,
    personSlug,
    createdAt: nowIso(),
  };
  store.sessions[sessionToken] = {
    ...session,
    token: sessionToken,
    expiresAt:
      Date.now() + (input.remember ? MEMBER_REMEMBER_MS : MEMBER_SESSION_MS),
  };
  await writeAuthStore(store);
  return { ok: true, session, sessionToken };
}

export async function sessionFromToken(
  token: string | undefined | null,
): Promise<AuthSession | null> {
  if (!token) return null;
  const store = await readAuthStore();
  const row = store.sessions[token];
  if (!row || row.expiresAt < Date.now()) return null;
  return {
    accountId: row.accountId,
    email: row.email,
    role: row.role,
    personId: row.personId,
    createdAt: row.createdAt,
  };
}

export async function destroySession(token: string | undefined | null) {
  if (!token) return;
  const store = await readAuthStore();
  delete store.sessions[token];
  await writeAuthStore(store);
}
