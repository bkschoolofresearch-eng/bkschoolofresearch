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
