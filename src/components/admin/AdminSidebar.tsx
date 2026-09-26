'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminNavGroups } from './admin-nav';
import { useCms } from './CmsProvider';

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { mode, apiAuthenticated, logoutCms } = useCms();

  const isActive = (href: string) => {
    const base = href.split('?')[0];
    if (base === '/admin') return pathname === '/admin';
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-[#0B1F36]/50 lg:hidden',
          open ? 'block' : 'hidden',
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-dvh w-[17.5rem] flex-col overflow-hidden bg-[#0B1F36] text-white transition-transform lg:sticky lg:top-0 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin" className="min-w-0" onClick={onClose}>
            <div className="truncate font-[family-name:var(--font-admin-display)] text-xl tracking-tight">
              BKSR
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Content manager
            </div>
          </Link>
          <button
            type="button"
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4"
        >
          {adminNavGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={`${group.label}-${item.href}-${item.label}`}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        title={item.description}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors',
                          active
                            ? 'bg-white font-semibold text-[#0B1F36]'
                            : 'text-white/80 hover:bg-white/10 hover:text-white',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            active ? 'opacity-90' : 'opacity-70',
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-3 border-t border-white/10 px-5 py-4">
          <p className="text-[11px] leading-relaxed text-white/45">
            {apiAuthenticated
              ? mode === 'mongo'
                ? 'Saving to MongoDB'
                : 'Saving to server · updates the public site'
              : 'Sign in required'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              target="_blank"
              className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 hover:bg-white/10"
            >
              View website
            </Link>
            {apiAuthenticated ? (
              <button
                type="button"
                onClick={() => void logoutCms()}
                className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white/80 hover:bg-white/10"
              >
                Log out
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}
