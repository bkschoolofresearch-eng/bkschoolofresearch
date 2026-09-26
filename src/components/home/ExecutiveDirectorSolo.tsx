import Image from 'next/image';
import Link from 'next/link';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { EditorialHeading } from '@/components/ui/EditorialHeading';
import { Section } from '@/components/ui/Section';

type ExecutiveDirectorSoloProps = {
  name: string;
  role: string;
  message: string;
  photoSrc: string;
  profileHref: string;
  title?: string;
  description?: string;
};

function paragraphsFromMessage(message: string) {
  return message
    .trim()
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/^[“"]|[”"]$/g, ''));
}

/**
 * Single-ED hub: portrait + View profile (left), full director message (right).
 */
export function ExecutiveDirectorSolo({
  name,
  role,
  message,
  photoSrc,
  profileHref,
  title = 'Executive Director',
  description = 'Institutional leadership of BK School of Research.',
}: ExecutiveDirectorSoloProps) {
  const paragraphs = paragraphsFromMessage(message);

  return (
    <>
      <Section
        tone="white"
        spaced={false}
        className="pt-28 pb-8 md:pt-32 md:pb-10"
      >
        <Container>
          <div className="flex justify-center">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'People', href: '/people' },
                { label: title },
              ]}
            />
          </div>
          <header className="mx-auto max-w-3xl text-center">
            <EditorialHeading as="h1" size="xl" className="text-balance">
              {title}
            </EditorialHeading>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              {description}
            </p>
            <ArrowLink href="/people" className="mt-6 justify-center">
              View full directory
            </ArrowLink>
          </header>
        </Container>
      </Section>

      <Section
        tone="surface"
        spaced={false}
        className="border-y border-border py-10 sm:py-12 md:py-14"
      >
        <Container>
          <article className="rounded-[1.75rem] bg-ink p-2 sm:rounded-[2rem] sm:p-2.5 md:rounded-[2.25rem] md:p-3">
            <div className="grid items-start gap-2.5 md:grid-cols-[15.5rem_minmax(0,1fr)] lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-3">
              {/* Portrait + CTA — stays put while the message scrolls */}
              <div className="flex flex-col gap-3 md:sticky md:top-28 md:self-start">
                <div className="relative mx-auto aspect-4/5 w-full max-w-70 overflow-hidden rounded-[1.25rem] bg-surface sm:max-w-none sm:rounded-[1.5rem] md:rounded-[1.75rem]">
                  <Image
                    src={photoSrc}
                    alt={`Portrait of ${name}`}
                    fill
                    priority
                    sizes="(max-width: 768px) 17.5rem, 18rem"
                    className="object-cover object-[center_18%]"
                  />
                </div>
                <Button
                  href={profileHref}
                  variant="onInk"
                  size="lg"
                  withArrow
                  className="mx-auto w-full max-w-70 sm:max-w-none"
                >
                  View profile
                </Button>
              </div>

              {/* Message panel */}
              <div className="flex min-w-0 flex-col rounded-[1.25rem] bg-white p-5 sm:rounded-[1.5rem] sm:p-7 md:rounded-[1.75rem] md:p-8 lg:p-9">
                <div>
                  <p className="font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    Message from the Executive Director
                  </p>
                  <h2 className="mt-2 font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ink sm:text-[1.875rem] md:text-[2.125rem] md:leading-[1.15]">
                    {name}
                  </h2>
                  <p className="mt-1.5 text-sm text-muted sm:text-base">{role}</p>
                </div>

                <div className="mt-6 space-y-4 text-sm leading-7 text-body sm:mt-7 sm:text-base sm:leading-8">
                  {paragraphs.map((paragraph, index) => (
                    <p key={index}>
                      {index === 0 ? `“${paragraph}` : paragraph}
                      {index === paragraphs.length - 1 ? '”' : null}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </Container>
      </Section>

      <Section tone="white" spaced={false} className="py-12 md:py-16">
        <Container>
          <div className="rounded-3xl bg-ink px-6 py-10 text-center text-paper sm:px-10 sm:py-12">
            <EditorialHeading
              as="h2"
              className="text-3xl text-paper sm:text-4xl"
            >
              Meet the full team
            </EditorialHeading>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-paper/75 sm:text-base">
              Browse every category in one directory — leadership, fellows,
              research, and administration.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/people" variant="onInk" size="lg">
                People directory
              </Button>
              <Button href="/people/career" variant="onInkSecondary" size="lg">
                Career at BKSR
              </Button>
            </div>
            <Link
              href="/about"
              className="mt-6 inline-flex font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-paper/80 transition-colors hover:text-paper"
            >
              About BKSR →
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
