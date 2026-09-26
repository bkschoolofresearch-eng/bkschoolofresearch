'use client';

import { BksrLoader } from '@/components/ui/BksrLoader';

/** Centered admin loading state — only render while a real fetch is in flight. */
export function AdminLoading({
  label = 'Loading',
  className = '',
  fullScreen = false,
}: {
  label?: string;
  className?: string;
  /** Full viewport (session check before shell). */
  fullScreen?: boolean;
}) {
  return (
    <div
      className={
        fullScreen
          ? `flex min-h-screen w-full items-center justify-center bg-[#EEF2F6] ${className}`
          : `flex min-h-[40vh] w-full items-center justify-center py-16 ${className}`
      }
    >
      <BksrLoader size={fullScreen ? 88 : 72} label={label} />
    </div>
  );
}
