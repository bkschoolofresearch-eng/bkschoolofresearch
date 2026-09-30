'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

/** Shared page title block for every admin route */
export function AdminPageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A90A8]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-[family-name:var(--font-admin-display)] text-[1.75rem] leading-tight text-[#0B1F36] sm:text-[2rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5B6B7C]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function AdminPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(11,31,54,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminPrimaryButton({
  children,
  href,
  onClick,
  type = 'button',
  disabled,
  className = '',
  value,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  value?: string;
}) {
  const classes =
    `inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1F36] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173B6C] disabled:opacity-50 ${className}`.trim();
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} value={value} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

export function AdminSecondaryButton({
  children,
  href,
  onClick,
  type = 'button',
  disabled,
  value,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  value?: string;
}) {
  const className =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-[#D5DEE8] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1F36] transition hover:bg-[#F4F7FB] disabled:opacity-50';
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} value={value} onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}

export function AdminLockedState({ noun }: { noun: string }) {
  return (
    <AdminPanel className="border-[#F0D4D4] bg-[#FFF8F8] p-6 text-sm text-[#8A3B3B]">
      Sign in to the CMS to manage {noun}.
    </AdminPanel>
  );
}
