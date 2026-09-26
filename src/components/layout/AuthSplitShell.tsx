import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type AuthSplitShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Left panel image — defaults to seminar atmosphere */
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

/**
 * Pharmacinta-inspired auth shell: no site chrome.
 * Left atmosphere panel · right soft card with underline fields.
 */
export function AuthSplitShell({
  title,
  description,
  children,
  footer,
  imageSrc = '/media/prototype/bksr-hero-slide-seminar.png',
  imageAlt = '',
  className,
}: AuthSplitShellProps) {
  return (
    <div
      className={cn(
        'grid min-h-svh bg-white lg:grid-cols-[minmax(0,42%)_minmax(0,58%)]',
        className,
      )}
    >
      <aside className="relative hidden min-h-svh bg-[#d9d9d9] lg:block">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="42vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-ink/35" />
        <div className="absolute inset-x-0 bottom-0 p-8 xl:p-10">
          <Link href="/" className="inline-block">
            <Image
              src="/brand/bksr-logo-light.png"
              alt="BK School of Research"
              width={220}
              height={56}
              className="h-10 w-auto object-contain object-left xl:h-11"
              priority
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/85">
            BK School of Research — evidence, mentorship, and policy-facing
            scholarship.
          </p>
        </div>
      </aside>

      <div className="flex min-h-svh flex-col justify-center bg-white px-4 py-10 sm:px-8 lg:px-10 xl:px-14">
        <div className="mb-6 lg:hidden">
          <Link href="/" className="inline-block">
            <Image
              src="/brand/bksr-logo.png"
              alt="BK School of Research"
              width={180}
              height={48}
              className="h-9 w-auto object-contain object-left"
              priority
            />
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[36rem] rounded-[1.75rem] bg-[#eaf1ff] p-6 sm:rounded-[1.875rem] sm:p-8 md:p-10">
          <header className="max-w-xl">
            <h1 className="font-display text-[2.25rem] leading-[1.05] tracking-tight text-ink sm:text-[2.75rem] md:text-[3.5rem] md:leading-none">
              {title}
            </h1>
            <p className="mt-4 text-sm leading-6 text-ink/80 sm:text-base sm:leading-7">
              {description}
            </p>
          </header>

          <div className="mt-10 sm:mt-12">{children}</div>

          {footer ? (
            <div className="mt-8 text-sm leading-relaxed text-ink/70">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AuthFooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-medium text-ink underline-offset-2 hover:underline"
    >
      {children}
    </Link>
  );
}
