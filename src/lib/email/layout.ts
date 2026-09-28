import { CANONICAL_SITE_URL, getSiteUrl } from '@/lib/seo/site-url';

const INK = '#0d2745';
const NAVY = '#0b233f';
const ACCENT = '#173b6c';
const RED = '#b83a3a';
const BODY = '#17212b';
const MUTED = '#68727d';
const LINE = '#d9dee5';
const CANVAS = '#f2f5f8';
const PAPER = '#ffffff';
const WASH = '#f8f7f3';

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Segoe UI', Helvetica, Arial, sans-serif";

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Absolute logo so inboxes can load it even when mail is sent from local dev. */
function logoUrl() {
  const site = getSiteUrl();
  const origin =
    site.includes('localhost') || site.includes('127.0.0.1') ? CANONICAL_SITE_URL : site;
  return `${origin}/brand/bksr-logo-light.png`;
}

function siteOrigin() {
  const site = getSiteUrl();
  if (site.includes('localhost') || site.includes('127.0.0.1')) return CANONICAL_SITE_URL;
  return site;
}

export function emailButton(href: string, label: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;">
      <tr>
        <td align="center" bgcolor="${NAVY}" style="border-radius:999px;background:${NAVY};">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:15px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>
  `;
}

export function emailGreeting(name?: string, mode: 'text' | 'html' = 'html') {
  const trimmed = name?.trim();
  if (!trimmed || trimmed === 'CMS Administrator') return 'Hello,';
  const safe = mode === 'html' ? escapeHtml(trimmed) : trimmed;
  return `Hello ${safe},`;
}

/**
 * Shared BKSR mail shell: navy lockup, warm paper, editorial type.
 * `bodyHtml` is already escaped by the caller.
 */
export function renderEmail(input: {
  preheader: string;
  eyebrow: string;
  title: string;
  bodyHtml: string;
  footnote: string;
}) {
  const origin = siteOrigin();
  const preheader = escapeHtml(input.preheader);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:${CANVAS};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${CANVAS};opacity:0;">
    ${preheader}${'&nbsp;'.repeat(24)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CANVAS}" style="background:${CANVAS};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
          <tr>
            <td bgcolor="${NAVY}" style="background:${NAVY};border-radius:22px 22px 0 0;padding:28px 32px 24px;">
              <a href="${origin}" style="text-decoration:none;">
                <img src="${logoUrl()}" width="210" height="67" alt="BK School of Research" style="display:block;width:210px;max-width:100%;height:auto;border:0;outline:none;" />
              </a>
            </td>
          </tr>
          <tr>
            <td bgcolor="${RED}" height="3" style="background:${RED};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td bgcolor="${PAPER}" style="background:${PAPER};padding:32px 32px 8px;">
              <p style="margin:0 0 10px;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${RED};">${escapeHtml(input.eyebrow)}</p>
              <h1 style="margin:0;font-family:${SERIF};font-size:30px;font-weight:500;line-height:1.2;color:${INK};">${escapeHtml(input.title)}</h1>
            </td>
          </tr>
          <tr>
            <td bgcolor="${PAPER}" style="background:${PAPER};padding:18px 32px 32px;font-family:${SANS};font-size:16px;line-height:1.65;color:${BODY};">
              ${input.bodyHtml}
            </td>
          </tr>
          <tr>
            <td bgcolor="${WASH}" style="background:${WASH};border-top:1px solid ${LINE};border-radius:0 0 22px 22px;padding:20px 32px 22px;">
              <p style="margin:0;font-family:${SERIF};font-size:15px;color:${INK};">BK School of Research</p>
              <p style="margin:6px 0 0;font-family:${SANS};font-size:13px;line-height:1.5;color:${MUTED};">${escapeHtml(input.footnote)}</p>
              <p style="margin:10px 0 0;font-family:${SANS};font-size:13px;">
                <a href="${origin}" style="color:${ACCENT};text-decoration:none;">www.bkschoolofresearch.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function otpCodeBlock(code: string) {
  const safe = escapeHtml(code).replace(/\s+/g, '');
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;">
      <tr>
        <td align="center" bgcolor="${NAVY}" style="background:${NAVY};border-radius:16px;padding:16px 12px 16px 22px;">
          <span style="font-family:${SERIF};font-size:32px;font-weight:600;line-height:1;letter-spacing:0.32em;color:#ffffff;-webkit-user-select:all;user-select:all;">${safe}</span>
        </td>
      </tr>
    </table>
  `;
}

export function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${LINE};">
        <p style="margin:0;font-family:${SANS};font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">${escapeHtml(label)}</p>
        <p style="margin:4px 0 0;font-family:${SANS};font-size:16px;line-height:1.45;color:${INK};">${value}</p>
      </td>
    </tr>
  `;
}
