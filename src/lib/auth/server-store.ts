import 'server-only';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { normalizeEmail } from '@/lib/auth/permissions';
import type { Account, AuthSession } from '@/types/auth';

const DATA_DIR = path.join(process.cwd(), '.data');
const AUTH_FILE = path.join(DATA_DIR, 'auth-store.json');

const OTP_TTL_MS = 10 * 60 * 1000;
const REGISTER_TOKEN_TTL_MS = 30 * 60 * 1000;
const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

export interface OtpRecord {
  codeHash: string;
  expiresAt: number;
  attempts: number;
  personId: string;
  email: string;
}

export interface RegisterTokenRecord {
  token: string;
  email: string;
  personId: string;
  expiresAt: number;
}

export interface InviteRecord {
  token: string;
  personId: string;
  email: string;
  createdAt: string;
  expiresAt: number;
  consumedAt?: string | null;
}

export interface AuthServerStore {
  accounts: Account[];
  otps: Record<string, OtpRecord>;
  registerTokens: RegisterTokenRecord[];
  invites: InviteRecord[];
  sessions: Record<string, AuthSession & { token: string; expiresAt: number }>;
}

function emptyStore(): AuthServerStore {
  return {
    accounts: [],
    otps: {},
    registerTokens: [],
    invites: [],
    sessions: {},
  };
}

export function hashSecret(value: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

export function secretsEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    return ba.length === bb.length && timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function generateToken(): string {
  return randomBytes(24).toString('hex');
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readAuthStore(): Promise<AuthServerStore> {
  if (process.env.AUTH_DRIVER === 'mongo' && process.env.MONGODB_URI?.trim()) {
    const { mongoReadAuthStore } = await import('@/lib/auth/mongo-store');
    return mongoReadAuthStore();
  }
  try {
    const raw = await fs.readFile(AUTH_FILE, 'utf8');
    const parsed = JSON.parse(raw) as AuthServerStore;
    return {
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      otps: parsed.otps ?? {},
      registerTokens: Array.isArray(parsed.registerTokens)
        ? parsed.registerTokens
        : [],
      invites: Array.isArray(parsed.invites) ? parsed.invites : [],
      sessions: parsed.sessions ?? {},
    };
  } catch {
    return emptyStore();
  }
}

export async function writeAuthStore(store: AuthServerStore): Promise<void> {
  if (process.env.AUTH_DRIVER === 'mongo' && process.env.MONGODB_URI?.trim()) {
    const { mongoWriteAuthStore } = await import('@/lib/auth/mongo-store');
    await mongoWriteAuthStore(store);
    return;
  }
  await ensureDir();
  await fs.writeFile(AUTH_FILE, JSON.stringify(store, null, 2), 'utf8');
}

export function findAccountByEmail(
  store: AuthServerStore,
  email: string,
): Account | undefined {
  const normalized = normalizeEmail(email);
  return store.accounts.find((a) => normalizeEmail(a.email) === normalized);
}

export {
  OTP_TTL_MS,
  REGISTER_TOKEN_TTL_MS,
  INVITE_TTL_MS,
  MAX_OTP_ATTEMPTS,
};
