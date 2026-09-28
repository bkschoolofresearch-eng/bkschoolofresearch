import 'server-only';

/** True on Vercel production or NODE_ENV=production. */
export function isProductionRuntime(): boolean {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production'
  );
}

/**
 * Dev-only OTP echo in API JSON. Never enabled in production / Vercel prod.
 */
export function allowDevOtpExposure(): boolean {
  if (isProductionRuntime()) return false;
  if (process.env.ALLOW_DEV_OTP === '0') return false;
  return true;
}
