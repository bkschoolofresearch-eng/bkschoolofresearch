/**
 * Security regression checks for BKSR P0 remediation.
 * Pure-logic tests — no production network calls.
 *
 * Run: pnpm run test:security
 */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';
import {
  assertPublicCmsReadAllowed,
  canPublicReadCollection,
  CMS_ADMIN_ONLY_COLLECTIONS,
  CMS_PUBLIC_PUBLISHED_COLLECTIONS,
  isPublishedCmsItem,
} from '../src/lib/cms/public-read.ts';
import {
  hashPasswordSecure,
  verifyPasswordSecure,
} from '../src/lib/auth/password.ts';
import { researchProjectExternalUrl } from '../src/lib/content/research-links.ts';
import { readFileSync } from 'node:fs';
import { redactPublicCmsPayload } from '../src/lib/cms/public-response.ts';
import { sitemapPublicPath } from '../src/lib/seo/public-path.ts';

describe('CMS public-read allowlist', () => {
  it('never allows joinApplications publicly', () => {
    assert.equal(canPublicReadCollection('joinApplications', true), false);
    assert.equal(canPublicReadCollection('joinApplications', false), false);
    assert.equal(assertPublicCmsReadAllowed('joinApplications', true).ok, false);
  });

  it('never allows registrationEntries publicly', () => {
    assert.equal(canPublicReadCollection('registrationEntries', true), false);
  });

  it('allows published people/publications/research only with published=1', () => {
    assert.equal(canPublicReadCollection('people', true), true);
    assert.equal(canPublicReadCollection('people', false), false);
    assert.equal(canPublicReadCollection('publications', true), true);
    assert.equal(canPublicReadCollection('researchProjects', true), true);
  });

  it('admin-only and public sets do not overlap', () => {
    for (const key of CMS_ADMIN_ONLY_COLLECTIONS) {
      assert.equal(
        CMS_PUBLIC_PUBLISHED_COLLECTIONS.has(key),
        false,
        `${key} must not be public`,
      );
    }
  });

  it('published filter rejects drafts and items without status', () => {
    assert.equal(isPublishedCmsItem({ status: 'published' }), true);
    assert.equal(isPublishedCmsItem({ status: 'draft' }), false);
    assert.equal(isPublishedCmsItem({ status: 'archived' }), false);
    assert.equal(isPublishedCmsItem({ id: 'x' }), false);
  });
});

describe('password hashing', () => {
  it('hashes with bcrypt and verifies', async () => {
    const hash = await hashPasswordSecure('correct-horse-battery');
    assert.match(hash, /^\$2[aby]\$/);
    const ok = await verifyPasswordSecure('correct-horse-battery', hash);
    assert.equal(ok.ok, true);
    assert.equal(ok.needsRehash, false);
    const bad = await verifyPasswordSecure('wrong', hash);
    assert.equal(bad.ok, false);
  });

  it('accepts legacy SHA-256 and flags rehash', async () => {
    const legacy = createHash('sha256')
      .update('bksr-demo-v1:legacy-pass')
      .digest('hex');
    const result = await verifyPasswordSecure('legacy-pass', legacy);
    assert.equal(result.ok, true);
    assert.equal(result.needsRehash, true);
  });
});

describe('public CMS response redaction', () => {
  it('removes claim secrets from public people payloads and keeps the profile', () => {
    const payload = redactPublicCmsPayload('people', {
      items: [
        {
          id: 'person-1',
          name: 'Bezon Kumar',
          role: 'Executive Director',
          email: 'person@example.org',
          phone: '+8801000000000',
          accountId: 'acct-1',
          verificationCode: 'BKSR-00001M',
          bio: 'Public biography',
        },
      ],
    }) as { items: Array<Record<string, unknown>> };

    const person = payload.items[0];
    assert.equal(person.name, 'Bezon Kumar');
    assert.equal(person.bio, 'Public biography');
    assert.equal('email' in person, false);
    assert.equal('phone' in person, false);
    assert.equal('accountId' in person, false);
    assert.equal('verificationCode' in person, false);
    assert.equal(JSON.stringify(payload).includes('BKSR-00001M'), false);
  });

  it('keeps public organisation contact fields on non-person records', () => {
    const payload = redactPublicCmsPayload('pages', {
      item: {
        title: 'Contact',
        emails: { general: 'bkschoolofresearch@gmail.com' },
        phone: '+8801000000000',
      },
    }) as { item: Record<string, unknown> };

    assert.deepEqual(payload.item.emails, {
      general: 'bkschoolofresearch@gmail.com',
    });
    assert.equal(payload.item.phone, '+8801000000000');
  });

  it('strips auth secrets from any public collection payload', () => {
    const payload = redactPublicCmsPayload('publications', {
      item: {
        title: 'Paper',
        passwordHash: 'secret-hash',
        devOtp: '123456',
        sessionToken: 'tok',
      },
    }) as { item: Record<string, unknown> };

    assert.equal(payload.item.title, 'Paper');
    assert.equal('passwordHash' in payload.item, false);
    assert.equal('devOtp' in payload.item, false);
    assert.equal('sessionToken' in payload.item, false);
  });
});

describe('sitemap and auth metadata', () => {
  it('drops private, api, and off-host sitemap targets', () => {
    const origin = 'https://www.bkschoolofresearch.org';
    assert.equal(sitemapPublicPath('/people/bezon-kumar', origin), '/people/bezon-kumar');
    assert.equal(sitemapPublicPath('/login', origin), null);
    assert.equal(sitemapPublicPath('/admin/research', origin), null);
    assert.equal(sitemapPublicPath('/api/cms/people', origin), null);
    assert.equal(sitemapPublicPath('/verify/BKSR-00001M', origin), null);
    assert.equal(
      sitemapPublicPath('https://doi.org/10.0000/example', origin),
      null,
    );
    assert.equal(
      sitemapPublicPath('http://localhost:3000/about', origin),
      null,
    );
  });

  it('marks auth and account pages noindex in their page metadata', () => {
    const pages = [
      'src/app/(auth)/login/page.tsx',
      'src/app/(auth)/register/page.tsx',
      'src/app/(auth)/forgot-password/page.tsx',
      'src/app/(public)/account/page.tsx',
      'src/app/(public)/verify/page.tsx',
      'src/app/(public)/verify/[code]/page.tsx',
    ];
    for (const page of pages) {
      const source = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
      assert.match(source, /noIndex:\s*true/, `${page} must set noIndex`);
    }
  });
});

describe('research external links', () => {
  it('prefers project URL and never invents internal routes', () => {
    const href = researchProjectExternalUrl({
      url: 'https://doi.org/10.1108/PMM-03-2026-0025',
      publicationIds: [],
      description: '',
      summary: '',
    });
    assert.equal(href, 'https://doi.org/10.1108/PMM-03-2026-0025');
    assert.equal(
      researchProjectExternalUrl({
        url: '/research/some-slug',
        publicationIds: [],
        description: '',
        summary: '',
      }),
      null,
    );
  });
});
