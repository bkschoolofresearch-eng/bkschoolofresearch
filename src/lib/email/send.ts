import 'server-only';

import {
  detailRow,
  emailButton,
  emailGreeting,
  escapeHtml,
  otpCodeBlock,
  renderEmail,
} from '@/lib/email/layout';

export type MailResult = { sent: boolean; preview?: string; error?: string };

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/**
 * Email delivery via Resend.
 * Without RESEND_API_KEY, logs and returns sent:false so UI can show invite/OTP.
 * FROM must be a verified Resend domain (not a free Gmail address).
 */
async function deliver(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'BK School of Research <onboarding@resend.dev>';

  if (!key) {
    console.info('[bksr-email:dev]', {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return { sent: false, preview: input.text };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('[bksr-email] Resend failed', res.status, body);
      return {
        sent: false,
        preview: input.text,
        error: `Resend ${res.status}: ${body.slice(0, 200)}`,
      };
    }
    return { sent: true };
  } catch (err) {
    console.error('[bksr-email] send error', err);
    return {
      sent: false,
      preview: input.text,
      error: err instanceof Error ? err.message : 'Send failed',
    };
  }
}

export async function sendInviteEmail(input: {
  to: string;
  name: string;
  role: string;
  inviteUrl: string;
}): Promise<MailResult> {
  const subject = `You're invited to BK School of Research`;
  const greeting = emailGreeting(input.name, 'text');
  const text = [
    greeting,
    ``,
    `You have been invited to BK School of Research as ${input.role}.`,
    ``,
    `Create your account and complete your profile:`,
    input.inviteUrl,
    ``,
    `The link asks you to verify your email with a one-time code, then set a password and your profile.`,
    ``,
    `BK School of Research`,
  ].join('\n');

  const html = renderEmail({
    preheader: `Create your account as ${input.role}.`,
    eyebrow: 'Invitation',
    title: "You're invited",
    footnote: 'This invitation was sent because an administrator added you to the BKSR team.',
    bodyHtml: `
      <p style="margin:0 0 14px;">${emailGreeting(input.name)}</p>
      <p style="margin:0 0 14px;">You have been invited to join <strong>BK School of Research</strong> as <strong>${escapeHtml(input.role)}</strong>.</p>
      <p style="margin:0;">Open the link to verify your email, choose a password, and complete your profile.</p>
      ${emailButton(input.inviteUrl, 'Create your account')}
    `,
  });

  return deliver({ to: input.to, subject, html, text });
}

export async function sendOtpEmail(input: {
  to: string;
  name?: string;
  otp: string;
}): Promise<MailResult> {
  const subject = `Your verification code — BK School of Research`;
  const greeting = emailGreeting(input.name, 'text');
  const text = [
    greeting,
    ``,
    `Your verification code is: ${input.otp}`,
    ``,
    `It expires in 10 minutes.`,
    `If you did not request this code, you can ignore this email.`,
    ``,
    `BK School of Research`,
  ].join('\n');
  const html = renderEmail({
    preheader: 'This code expires in 10 minutes.',
    eyebrow: 'Verification',
    title: 'Your verification code',
    footnote: 'If you did not request this code, you can ignore this email.',
    bodyHtml: `
      <p style="margin:0 0 18px;">${emailGreeting(input.name)}</p>
      <p style="margin:0 0 16px;">Enter this code to continue. It expires in 10 minutes.</p>
      ${otpCodeBlock(input.otp)}
    `,
  });
  return deliver({ to: input.to, subject, html, text });
}

export async function sendContactEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<MailResult> {
  const to =
    process.env.CONTACT_INBOX_EMAIL?.trim() ||
    process.env.RESEND_CONTACT_TO?.trim() ||
    'info@bkschoolofresearch.org';

  const subject = `New enquiry: ${input.subject}`;
  const text = [
    `New enquiry from ${input.name} <${input.email}>`,
    `Subject: ${input.subject}`,
    ``,
    input.message,
  ].join('\n');
  const html = renderEmail({
    preheader: `${input.name} wrote: ${input.subject}`,
    eyebrow: 'Contact',
    title: 'New enquiry',
    footnote: 'Reply to this email to answer the sender directly.',
    bodyHtml: `
      <p style="margin:0 0 8px;">A message arrived through the website contact form.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 18px;">
        ${detailRow('From', escapeHtml(input.name))}
        ${detailRow('Email', `<a href="mailto:${escapeHtml(input.email)}" style="color:#173b6c;text-decoration:none;">${escapeHtml(input.email)}</a>`)}
        ${detailRow('Subject', escapeHtml(input.subject))}
      </table>
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#68727d;">Message</p>
      <div style="margin:0;padding:16px 18px;background:#f8f7f3;border-radius:16px;white-space:pre-wrap;">${escapeHtml(input.message)}</div>
    `,
  });

  return deliver({
    to,
    subject,
    html,
    text,
    replyTo: input.email,
  });
}

