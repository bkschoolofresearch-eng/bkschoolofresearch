/**
 * Mongo-backed auth persistence scaffold.
 *
 * NOT activated by default. Production must not switch AUTH_DRIVER until:
 * 1. CMS_DRIVER=mongo is verified in staging
 * 2. This store is tested with accounts/sessions/invites/OTP round-trips
 * 3. FS auth-store.json has been exported and validated
 *
 * Enable only with AUTH_DRIVER=mongo + MONGODB_URI (approval required).
 */

import 'server-only';
import type { AuthServerStore } from '@/lib/auth/server-store';

export function isAuthMongoConfigured(): boolean {
  return (
    process.env.AUTH_DRIVER === 'mongo' &&
    Boolean(process.env.MONGODB_URI?.trim())
  );
}

const AUTH_COLLECTIONS = {
  meta: 'auth_meta',
  accounts: 'auth_accounts',
  sessions: 'auth_sessions',
  otps: 'auth_otps',
  registerTokens: 'auth_register_tokens',
  invites: 'auth_invites',
} as const;

export async function mongoReadAuthStore(): Promise<AuthServerStore> {
  const { getDb } = await import('@/lib/db/mongo');
  const db = await getDb();
  const [accounts, sessions, otps, registerTokens, invites] = await Promise.all([
    db.collection(AUTH_COLLECTIONS.accounts).find({}).toArray(),
    db.collection(AUTH_COLLECTIONS.sessions).find({}).toArray(),
    db.collection(AUTH_COLLECTIONS.otps).find({}).toArray(),
    db.collection(AUTH_COLLECTIONS.registerTokens).find({}).toArray(),
    db.collection(AUTH_COLLECTIONS.invites).find({}).toArray(),
  ]);

  const sessionMap: AuthServerStore['sessions'] = {};
  for (const row of sessions) {
    const token = String(row.token ?? '');
    if (!token) continue;
    sessionMap[token] = {
      token,
      accountId: String(row.accountId),
      email: String(row.email),
      role: row.role === 'admin' ? 'admin' : 'member',
      personId: (row.personId as string | null | undefined) ?? null,
      personSlug: (row.personSlug as string | null | undefined) ?? null,
      createdAt: String(row.createdAt ?? new Date().toISOString()),
      expiresAt: Number(row.expiresAt ?? 0),
    };
  }

  const otpMap: AuthServerStore['otps'] = {};
  for (const row of otps) {
    const email = String(row.email ?? '').toLowerCase();
    if (!email) continue;
    otpMap[email] = {
      codeHash: String(row.codeHash),
      expiresAt: Number(row.expiresAt ?? 0),
      attempts: Number(row.attempts ?? 0),
      personId: String(row.personId),
      email,
    };
  }

  return {
    accounts: accounts.map((row) => ({
      id: String(row.id ?? row._id),
      email: String(row.email),
      passwordHash: String(row.passwordHash),
      role: row.role === 'admin' ? 'admin' : 'member',
      personId: (row.personId as string | null | undefined) ?? null,
      emailVerifiedAt: (row.emailVerifiedAt as string | null | undefined) ?? null,
      createdAt: String(row.createdAt ?? new Date().toISOString()),
      updatedAt: String(row.updatedAt ?? new Date().toISOString()),
    })),
    otps: otpMap,
    registerTokens: registerTokens.map((row) => ({
      token: String(row.token),
      email: String(row.email),
      personId: String(row.personId),
      expiresAt: Number(row.expiresAt ?? 0),
    })),
    invites: invites.map((row) => ({
      token: String(row.token),
      personId: String(row.personId),
      email: String(row.email),
      createdAt: String(row.createdAt ?? new Date().toISOString()),
      expiresAt: Number(row.expiresAt ?? 0),
      consumedAt: (row.consumedAt as string | null | undefined) ?? null,
    })),
    sessions: sessionMap,
  };
}

/**
 * Full replace write — intended for migration tooling and low-traffic auth.
 * Callers must treat this as replace-all (idempotent snapshot write).
 */
export async function mongoWriteAuthStore(store: AuthServerStore): Promise<void> {
  const { getDb } = await import('@/lib/db/mongo');
  const db = await getDb();

  const sessionDocs = Object.values(store.sessions).map((s) => ({ ...s }));
  const otpDocs = Object.entries(store.otps).map(([email, otp]) => ({
    ...otp,
    email,
  }));

  await Promise.all([
    db.collection(AUTH_COLLECTIONS.accounts).deleteMany({}),
    db.collection(AUTH_COLLECTIONS.sessions).deleteMany({}),
    db.collection(AUTH_COLLECTIONS.otps).deleteMany({}),
    db.collection(AUTH_COLLECTIONS.registerTokens).deleteMany({}),
    db.collection(AUTH_COLLECTIONS.invites).deleteMany({}),
  ]);

  if (store.accounts.length) {
    await db.collection(AUTH_COLLECTIONS.accounts).insertMany(store.accounts);
  }
  if (sessionDocs.length) {
    await db.collection(AUTH_COLLECTIONS.sessions).insertMany(sessionDocs);
  }
  if (otpDocs.length) {
    await db.collection(AUTH_COLLECTIONS.otps).insertMany(otpDocs);
  }
  if (store.registerTokens.length) {
    await db
      .collection(AUTH_COLLECTIONS.registerTokens)
      .insertMany(store.registerTokens);
  }
  if (store.invites.length) {
    await db.collection(AUTH_COLLECTIONS.invites).insertMany(store.invites);
  }

  await db.collection(AUTH_COLLECTIONS.meta).updateOne(
    { key: 'auth' },
    {
      $set: {
        key: 'auth',
        updatedAt: new Date().toISOString(),
        accountCount: store.accounts.length,
      },
    },
    { upsert: true },
  );
}
