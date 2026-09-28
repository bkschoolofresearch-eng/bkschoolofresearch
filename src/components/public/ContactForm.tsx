'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

const inputClass =
  'mt-1.5 w-full rounded-xl border border-border bg-white px-3.5 py-3 font-sans text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="rounded-[1.25rem] border border-ink/10 bg-surface-subtle px-6 py-10 sm:px-8">
        <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
          Received
        </p>
        <p className="mt-3 font-display text-2xl text-ink sm:text-3xl">
          Thank you
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-body sm:text-base">
          Your message has been sent to the BKSR desk. We will reply to the
          email you provided when we can.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-7"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        void (async () => {
          try {
            const res = await fetch('/api/public/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, subject, message }),
            });
            const data = (await res.json()) as { error?: string };
            if (!res.ok) {
              setError(data.error || 'Could not send your message.');
              return;
            }
            setSubmitted(true);
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
          } catch {
            setError('Could not send your message.');
          } finally {
            setBusy(false);
          }
        })();
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="font-sans text-sm font-semibold text-ink">Name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="font-sans text-sm font-semibold text-ink">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={inputClass}
          />
        </label>
      </div>
      <label className="block">
        <span className="font-sans text-sm font-semibold text-ink">Subject</span>
        <input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="font-sans text-sm font-semibold text-ink">Message</span>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} min-h-36 resize-y`}
        />
      </label>
      {error ? (
        <p className="text-sm font-medium text-brand-red">{error}</p>
      ) : null}
      <Button type="submit" variant="ink" size="lg" withArrow disabled={busy}>
        {busy ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
