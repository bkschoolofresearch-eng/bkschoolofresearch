# BKSR Security/SEO Patch — Controlled Release Checklist

Branch: `security/bksr-production-hardening`  
Scope: Security + SEO hardening only. **No** production Mongo/auth driver cutover.

## A. Push release branch

```bash
git push -u origin security/bksr-production-hardening
```

Do this only after explicit approval.

## B. Verify Vercel Preview

1. Open the Preview URL created for the branch/PR.
2. Confirm homepage, `/people`, `/research`, `/publications` load.
3. Confirm no fictional demo names (e.g. Carlos Ramirez) on `/people`.
4. Confirm “What Our Researchers Say” placeholder block is absent.
5. Open `/robots.txt` and `/sitemap.xml` (200).
6. Confirm research DOI cards still open external journal/DOI URLs.

## C. Confirm required environment variables (Preview + later Production)

Names only — do **not** change `CMS_DRIVER` or `AUTH_DRIVER` for this patch:

```
NEXT_PUBLIC_SITE_URL=https://www.bkschoolofresearch.org
CMS_ADMIN_EMAIL
CMS_ADMIN_PASSWORD
CMS_ADMIN_SECRET
# Keep existing:
CMS_DRIVER          # leave as currently configured (do not flip to mongo in this release)
# AUTH_DRIVER       # leave unset / fs
MONGODB_URI         # may remain for future; unused while CMS_DRIVER=fs
CLOUDINARY_* / NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
RESEND_API_KEY / RESEND_FROM_EMAIL / CONTACT_INBOX_EMAIL
```

## D. Test admin authentication (Preview)

1. Open `/admin` → password step → OTP email.
2. Confirm login succeeds with signed session (no raw secret inspection needed).
3. Confirm CMS lists load while authenticated.
4. Confirm API responses do **not** include `devOtp` on Preview if `NODE_ENV=production` / Vercel production-like; on Preview may still be production runtime — OTP must arrive by email.

## E. Test public/private CMS read permissions (Preview)

Unauthenticated:

```bash
curl -sI "https://<preview>/api/cms/joinApplications"
# expect 401
curl -sI "https://<preview>/api/cms/registrationEntries"
# expect 401
curl -sI "https://<preview>/api/cms/people"
# expect 401
curl -s "https://<preview>/api/cms/people?published=1" | head
# expect 200 with published people only
```

Authenticated admin cookie or `x-cms-admin-secret` header: private collections readable.

## F. Merge into main

1. Open PR: `security/bksr-production-hardening` → `main`
2. Review diff (security/SEO only)
3. Merge after Preview smoke passes
4. Let Vercel Production auto-deploy from `main` (or promote Preview)

## G. Verify production deployment

1. Confirm deploy SHA matches merge commit
2. `https://www.bkschoolofresearch.org/robots.txt` → 200
3. `https://www.bkschoolofresearch.org/sitemap.xml` → 200
4. Absolute canonical on homepage (view source)
5. `/people` without demo roster

## H. Post-deploy security smoke tests

```bash
curl -s -o NUL -w "%{http_code}" https://www.bkschoolofresearch.org/api/cms/joinApplications
# 401
curl -s -o NUL -w "%{http_code}" "https://www.bkschoolofresearch.org/api/cms/people?published=1"
# 200
curl -s https://www.bkschoolofresearch.org/api/cms/health
# driver should remain unchanged from pre-deploy (do not expect mongo unless already set)
```

Admin login OTP on production (authorized operator only). No destructive CMS deletes/seeds.

## I. Rollback

1. Vercel → Deployments → previous Production deployment → **Promote to Production**
2. Or revert the merge commit on `main` and redeploy
3. Do not run seed/reset during rollback

## Explicit non-goals of this release

- Production `CMS_DRIVER=mongo` cutover
- Production `AUTH_DRIVER=mongo` cutover
- Frontend redesign
- Content rewriting / institutional claim edits
