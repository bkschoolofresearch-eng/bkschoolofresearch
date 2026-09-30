import { cookies } from 'next/headers';
import { jsonError, jsonOk } from '@/lib/cms/api-guard';
import { loginWithPassword } from '@/lib/auth/server-ops';
import { AUTH_SESSION_COOKIE } from '@/lib/auth/cookies';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    remember?: boolean;
  };
  const remember = body.remember === true;
  const result = await loginWithPassword({
    email: body.email ?? '',
    password: body.password ?? '',
    remember,
  });
  if (!result.ok) return jsonError(result.error, 401);

  const jar = await cookies();
  jar.set(AUTH_SESSION_COOKIE, result.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12,
  });

  return jsonOk({ session: result.session });
}
