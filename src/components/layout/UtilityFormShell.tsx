import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/utils';

type UtilityFormShellProps = {
  title: string;
  description: string;
  panel: React.ReactNode;
  cardEyebrow: string;
  cardTitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

/**
 * Shared form-first layout for auth / verify / registration utility pages.
 * No full-bleed PageHero — compact title band + side panel + form card.
 */
export function UtilityFormShell({
  title,
  description,
  panel,
  cardEyebrow,
  cardTitle,
  children,
  footer,
  className,
}: UtilityFormShellProps) {
  return (
    <div
      className={cn(
        'bg-[linear-gradient(180deg,#f7f4ee_0%,#ffffff_42%)]',
        className,
      )}
    >
      <div className="border-b border-border/70 pt-24 pb-6 sm:pt-28 sm:pb-8">
        <Container>
          <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl md:text-[2.75rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            {description}
          </p>
        </Container>
      </div>

      <Container className="py-8 sm:py-10 md:py-14">
        <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="order-2 lg:order-1 lg:col-span-5 xl:col-span-4">
            {panel}
          </div>

          <div className="order-1 lg:order-2 lg:col-span-7 xl:col-span-8">
            <div className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-paper shadow-[0_20px_60px_-40px_rgba(13,39,69,0.55)]">
              <div className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
                <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                  {cardEyebrow}
                </p>
                <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                  {cardTitle}
                </h2>
              </div>
              <div className="px-6 py-6 sm:px-8 sm:py-8">{children}</div>
            </div>

            {footer ? (
              <div className="mt-5 text-center text-xs text-muted sm:text-sm">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </div>
  );
}

export function UtilityFormFooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-medium text-accent underline-offset-2 hover:underline"
    >
      {children}
    </Link>
  );
}
