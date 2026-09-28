'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authBoxedInputClass, authNoticeClass } from '@/components/auth/auth-styles';
import { Button } from '@/components/ui/Button';

type VerifyResult =
  | {
      kind: 'member';
      name: string;
      role: string;
      href: string;
    }
  | {
      kind: 'certificate';
      name: string;
      achievement: string;
      href: string | null;
    }
  | { kind: 'none' };

export function VerifyLookup({ initialCode = '' }: { initialCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [submitted, setSubmitted] = useState(Boolean(initialCode.trim()));
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCode(initialCode);
    setSubmitted(Boolean(initialCode.trim()));
  }, [initialCode]);

  useEffect(() => {
    if (!submitted || !code.trim()) {
      setResult(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/public/lookup?code=${encodeURIComponent(code.trim())}`,
        );
        const data = (await res.json()) as VerifyResult;
        if (!cancelled) setResult(data);
      } catch {
        if (!cancelled) setResult({ kind: 'none' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [submitted, code]);

  return (
    <div className="space-y-5">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          const next = code.trim().toUpperCase();
          setCode(next);
          setSubmitted(true);
          if (next) router.replace(`/verify/${encodeURIComponent(next)}`);
          else router.replace('/verify');
        }}
      >
        <label className="block">
          <span className="font-sans text-sm font-semibold text-ink">
            Verification code
          </span>
          <input
            className={authBoxedInputClass}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="BKSR-00001M or BKSR-00001C"
            autoComplete="off"
          />
        </label>
        <div className="flex justify-end border-t border-border pt-5">
          <Button type="submit" variant="primary" withArrow>
            {loading ? 'Checking…' : 'Verify'}
          </Button>
        </div>
      </form>

      {result?.kind === 'member' ? (
        <div className="rounded-[1.25rem] border border-border bg-surface-subtle p-5 sm:p-6">
          <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
            Member verified
          </p>
          <p className="mt-2 font-display text-2xl text-ink">{result.name}</p>
          <p className="mt-1 text-sm text-body">{result.role}</p>
          <p className="mt-3 font-mono text-xs text-muted">{code}</p>
          <Link
            href={result.href}
            className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
          >
            View profile
          </Link>
        </div>
      ) : null}

      {result?.kind === 'certificate' ? (
        <div className="rounded-[1.25rem] border border-border bg-surface-subtle p-5 sm:p-6">
          <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
            Certificate verified
          </p>
          <p className="mt-2 font-display text-2xl text-ink">
            {result.achievement}
          </p>
          <p className="mt-1 text-sm text-body">Awarded to {result.name}</p>
          <p className="mt-3 font-mono text-xs text-muted">{code}</p>
          {result.href ? (
            <Link
              href={result.href}
              className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
            >
              View profile
            </Link>
          ) : null}
        </div>
      ) : null}

      {result?.kind === 'none' ? (
        <p className={authNoticeClass}>
          No match for this code. Ask an administrator to confirm the member or
          certificate code was issued in the CMS.
        </p>
      ) : null}
    </div>
  );
}
