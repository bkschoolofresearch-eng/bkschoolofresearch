# BKSR Production Domain Audit

| Field | Value |
|---|---|
| **Audit date** | 26 September 2026 |
| **Canonical domain** | `https://www.bkschoolofresearch.org/` |
| **GitHub repository** | `https://github.com/bkschoolofresearch-eng/bkschoolofresearch` |
| **Vercel project** | `bksr` (Hobby) — Production domain `www.bkschoolofresearch.org` (+ apex) |
| **Live production commit (dashboard)** | `eb0d973` (“updated”) on `main` — **does not yet include** local audit SEO/security fixes |
| **Legacy deploy alias** | `https://bksr.vercel.app/` |
| **Repository branch** | `main` (tracks `origin/main`) |
| **Audit method** | Code inspection + live HTTP/Playwright checks + local lint/typecheck/build + Vercel Overview confirmation |
| **Deployment performed** | No automatic deploy from this audit |

Verification labels used below:

| Label | Meaning |
|---|---|
| **LIVE VERIFIED** | Confirmed against the public production host |
| **STATICALLY VERIFIED** | Confirmed from source / config inspection only |
| **LOCALLY TESTED** | Confirmed via local lint/typecheck/build |
| **BLOCKED** | Could not verify without credentials / dashboard / authorized access |
| **FAILED** | Checked and failed |

---

## 1. Official domain status

| Check | Result | Status |
|---|---|---|
| `https://www.bkschoolofresearch.org/` resolves | HTTP 200, `Server: Vercel` | LIVE VERIFIED |
| HTTPS / TLS | Connection succeeds; `Strict-Transport-Security: max-age=63072000` | LIVE VERIFIED |
| SSL certificate details (issuer/expiry) | OpenSSL not available on audit host | BLOCKED (see dashboard steps) |
| Apex `https://bkschoolofresearch.org/` | **308 Permanent Redirect** → `https://www.bkschoolofresearch.org/` (1 hop, no loop) | LIVE VERIFIED |
| Redirect loop | None observed | LIVE VERIFIED |
| `https://bksr.vercel.app/` | Still serves the site (HTTP 200), **no** redirect to www | LIVE VERIFIED |
| Same project / deployment | Both hosts return BKSR homepage title and Vercel headers; exact deployment SHA not confirmed without Vercel dashboard | LIVE VERIFIED (hosting) / BLOCKED (exact deployment identity) |

**Verdict:** The official www domain is live on Vercel with correct apex→www permanent redirect. The legacy `bksr.vercel.app` alias remains publicly reachable and creates a duplicate-content risk until redirected or access-controlled.

---

## 2. Redirect / canonical configuration

### Live behavior

- Apex → www: **308** (correct)
- www self: **200** (no loop)
- Repo `next.config.ts`: only path aliases (activities/publications). **No** www/apex redirects in code (correct — DNS/Vercel domains own this)

### Code / SEO canonical (pre-fix live)

| Item | Live finding |
|---|---|
| `metadataBase` | Missing on live deploy |
| Canonical | Relative `/` only |
| Open Graph URL | Absent |
| `robots.txt` | **404** |
| `sitemap.xml` | **404** |

### Safe code fixes prepared in this audit (not yet deployed)

See §15. After deploy, expect absolute `https://www.bkschoolofresearch.org/...` canonicals, robots, and sitemap.

---

## 3. Live route inventory

All checked against `https://www.bkschoolofresearch.org` unless noted.

| Route | HTTP | Notes | Status |
|---|---|---|---|
| `/` | 200 | Homepage loads; hero slideshow; prototype media in use | LIVE VERIFIED |
| `/about` | 200 | | LIVE VERIFIED |
| `/people` | 200 | Includes demo roster names (e.g. Carlos Ramirez) + prototype portraits | LIVE VERIFIED |
| `/people/bezon-kumar` | 200 | Authentic ED profile present | LIVE VERIFIED |
| `/research` | 200 | 40 projects; DOI external link confirmed | LIVE VERIFIED |
| `/research/ongoing` | 200 | | LIVE VERIFIED |
| `/publications` | 200 | | LIVE VERIFIED |
| `/activities` | 200 | | LIVE VERIFIED |
| `/news-events` | 200 | | LIVE VERIFIED |
| `/events` | 200 | | LIVE VERIFIED |
| `/notices` | 200 | | LIVE VERIFIED |
| `/resources` | 200 | | LIVE VERIFIED |
| `/contact` | 200 | | LIVE VERIFIED |
| `/join` | 200 | | LIVE VERIFIED |
| `/login` | 200 | | LIVE VERIFIED |
| `/register` | 200 | | LIVE VERIFIED |
| `/verify` | 200 | | LIVE VERIFIED |
| `/search` | 200 | | LIVE VERIFIED |
| `/admin` | 200 | HTML shell loads (client auth gate); robots noindex in admin layout | LIVE VERIFIED |
| `/robots.txt` | **404** | Missing on live | LIVE VERIFIED / FAILED |
| `/sitemap.xml` | **404** | Missing on live | LIVE VERIFIED / FAILED |

Representative detail / utility routes returned 200 for listed hubs; no unexpected hard 404s on primary nav destinations.

Mobile viewport (~390px) homepage: layout readable, CTAs visible, no obvious horizontal overflow (**LIVE VERIFIED** via Playwright screenshot). Desktop research page navigation and cards render (**LIVE VERIFIED**).

---

## 4. Production environment assessment

Public health endpoint (LIVE VERIFIED):

`GET /api/cms/health` →

```json
{
  "ok": true,
  "driver": "fs",
  "apiEnabled": true,
  "mongoConfigured": true,
  "cloudinaryConfigured": true,
  "resendConfigured": true,
  "mode": "local-file"
}
```

| Concern | Assessment | Priority |
|---|---|---|
| `CMS_DRIVER` on production | **`fs` (local-file)** despite Mongo being configured | **P0** |
| Mongo configured flag | `true` (URI present) but **not active** | P0 |
| Cloudinary | Configured (flag true); CDN URLs / uploads not E2E tested | STATICALLY + LIVE (flag) |
| Resend | Configured (flag true); no production email sent during audit | LIVE (flag) / BLOCKED (send) |
| `NEXT_PUBLIC_SITE_URL` on Vercel | Not observed in HTML (relative canonical suggests unset or unused on live build) | P0 for email/SEO after deploy of fixes |
| Local `.env.local` | Has the expected variable **names** for CMS/Mongo/Cloudinary/Resend (values not reported) | STATICALLY VERIFIED |

**Critical:** On Vercel, filesystem writes under `.data/` are ephemeral. Production must use `CMS_DRIVER=mongo` with a durable Mongo database before treating CMS edits as production-safe.

---

## 5. MongoDB / CMS persistence

| Item | Finding | Status |
|---|---|---|
| Driver selection code | `CMS_DRIVER === 'mongo'` **and** `MONGODB_URI` → mongo; else fs | STATICALLY VERIFIED |
| Live driver | **fs** | LIVE VERIFIED |
| Mongo URI present | Health reports `mongoConfigured: true` | LIVE VERIFIED |
| Collection seed / reset | **Not run** (forbidden without approval) | N/A |
| Cache | `getContentDatabase` uses `unstable_cache` (~30s, CMS tags) | STATICALLY VERIFIED |

### Remediation plan (approval required — do not auto-run)

1. In Vercel project `bksr` → Production env:
   - Set `CMS_DRIVER=mongo`
   - Confirm `MONGODB_URI`, `MONGODB_DB` (recommended `bksr`)
   - Set `NEXT_PUBLIC_SITE_URL=https://www.bkschoolofresearch.org`
   - Confirm admin + Cloudinary + Resend vars
2. Verify Mongo connectivity via authenticated `POST /api/cms/health` (admin session), not seed.
3. **Only after backup/export of any intended source of truth**, decide whether to migrate FS seed → Mongo using the existing seed script — **never** run seed against production without explicit approval.
4. Redeploy and re-check `/api/cms/health` for `"driver":"mongo"`.
5. Smoke-test one non-destructive admin read (list research) and one reversible draft edit in a staging slot if available.

---

## 6. Authentication

### Admin / Content Studio

| Item | Finding | Status |
|---|---|---|
| Login flow | Email/password → OTP email → session cookie `bksr_cms_admin` | STATICALLY VERIFIED |
| API mutations | `assertCmsAdmin` on POST/PATCH/DELETE | STATICALLY VERIFIED |
| Open CMS mode | `fs` + no admin env → APIs open (dev only) | STATICALLY VERIFIED |
| Live admin UI | `/admin` returns 200 login shell | LIVE VERIFIED |
| Live authorized CMS ops | No authorized credentials used | BLOCKED |
| Session cookie = raw secret | Session value equals `CMS_ADMIN_SECRET` or password | **P1** STATICALLY VERIFIED |

### Member auth

| Item | Finding | Priority |
|---|---|---|
| Store | `.data/auth-store.json` (filesystem) | **P0** on Vercel |
| Password hashing | SHA-256 + fixed salt (`bksr-demo-v1`) — demo-grade | **P1** |
| Cookies | `httpOnly`, `secure` in production, `sameSite=lax` | STATICALLY VERIFIED |
| Invite links | Built via `getSiteUrl()` / `NEXT_PUBLIC_SITE_URL` | STATICALLY VERIFIED |
| Forgot password | Page exists; copy indicates incomplete email reset | STATICALLY VERIFIED |
| E2E login/register on production | Not exercised (no unauthorized account creation) | BLOCKED |

---

## 7. Join / Apply system

| Step | Code | Live E2E |
|---|---|---|
| Public `/join` | Implemented | Page loads (LIVE) |
| Submit API + persistence | Implemented against CMS store | BLOCKED (no fake prod submissions) |
| Admin review | Admin collection `joinApplications` | BLOCKED |
| Invite → register → profile | Implemented in auth ops | BLOCKED |
| Career / event / dynamic forms | Routes + admin registration forms present | STATICALLY VERIFIED / pages LIVE |

Pre-fix live API note: unauthenticated `GET /api/cms/joinApplications` returned `{"items":[]}` (empty but **readable**). Code fix now requires admin for that collection.

---

## 8. Admin authorization

| Check | Result |
|---|---|
| Mutations require admin | STATICALLY VERIFIED |
| Full DB dump `GET /api/cms` | Requires admin | STATICALLY VERIFIED |
| Pre-fix collection GET without auth | **Allowed** (draft/inbox risk) | LIVE VERIFIED / **P0** |
| Pre-fix `GET /api/cms/homepage|navigation|site-settings` | **Allowed** without auth | LIVE VERIFIED / **P1** |
| Post-fix (this PR/code) | Collection GETs require admin unless `?published=1`; admin-only collections always gated; singleton GETs require admin | LOCALLY coded — deploy pending |

Unauthenticated visitors could not mutate content via POST/PATCH/DELETE without credentials (**STATICALLY VERIFIED**). Read exposure was the primary live gap.

---

## 9. Resend / Cloudinary

| Service | Live health flag | E2E | Notes |
|---|---|---|---|
| Resend | `resendConfigured: true` | BLOCKED (no send) | From-address must be a verified domain in Resend dashboard |
| Cloudinary | `cloudinaryConfigured: true` | BLOCKED (no upload) | `next/image` allows `res.cloudinary.com` |

Env var **names** required in production (values never listed here):

`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_INBOX_EMAIL`, `CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`

---

## 10. SEO and indexing

### Live (current production deploy)

| Item | Status |
|---|---|
| Homepage title/description | Present | LIVE VERIFIED |
| `robots` meta | `index, follow` on homepage | LIVE VERIFIED |
| Canonical | Relative `/` only | LIVE VERIFIED / FAILED (absolute) |
| OG images | Default OG image not strongly present on homepage (`summary` card) | LIVE VERIFIED |
| `robots.txt` / `sitemap.xml` | Missing (404) | FAILED |
| Admin noindex | Admin layout sets `robots: noindex` | STATICALLY VERIFIED |
| Auth / account / verify noindex | Added in code for auth layout, account, verify | Code ready; not live until deploy |

### Staging duplicate content

`bksr.vercel.app` remains indexable unless redirected or `X-Robots-Tag`/password protection is applied in Vercel (**P1**).

---

## 11. Prototype content inventory

| Category | Inventory | Recommendation | Priority |
|---|---|---|---|
| **DEMO PERSONNEL** | `peopleDemoRoster`: **28** fictional names (Carlos Ramirez, Daniel Wong, Aisha Patel, Sofia Chen, …) merged into `/people` and category hubs | Remove from public surfaces or hide until real roster published | **P0** |
| **DEMO / PLACEHOLDER TESTIMONIALS** | Homepage “What Our Researchers Say” uses “Attribution pending” + prototype/Unsplash portraits | Hide section or replace with real attributed quotes | **P0** |
| **GENERATED PROTOTYPE MEDIA** | `/media/prototype/*` heavily used on homepage (hero, covers, collab), PageHero defaults, press fallbacks; live homepage HTML contained dozens of prototype refs | Acceptable temporarily for stakeholder demo; replace with institutional photography before final launch | **P1** |
| **AUTHENTIC** | Bezon Kumar ED content; research/publication titles from stakeholder docs; contact emails; social links; founded 2015 | Keep | — |
| **UNVERIFIED CLAIMS** | Homepage stat “26 Countries represented” and ED message claims (35 projects, 15,000 trainees, WHO/UNICEF) — sourced from seed/About copy | Stakeholder verify before treating as public fact | **P1** |
| **COLLABORATION LOGOS** | Homepage collaboration uses prototype logo assets | Replace with archive-documented partner marks | **P1** |

Do **not** auto-delete CMS institutional records. Demo roster is code-seed presentation overlay — disable/remove from public merge paths after approval.

---

## 12. Responsive results

| Viewport | Page | Result | Status |
|---|---|---|---|
| ~390×844 | `/` | Hero + CTAs + stats readable; floating header; no obvious overflow | LIVE VERIFIED |
| 1440×900 | `/research` | Hub + filters + cards render; nav intact | LIVE VERIFIED |
| 768 / 1024 / 360 | Full matrix | Not exhaustively screenshot-audited in this pass | BLOCKED / partial |

No redesign performed. No confirmed layout defects requiring code changes in this audit.

---

## 13. Performance observations

| Area | Observation | Status |
|---|---|---|
| Homepage weight | Large HTML (~hundreds of KB) with many image preloads | LIVE VERIFIED |
| Animation stack | GSAP / Motion / Lenis / Matter.js / Lottie present in codebase | STATICALLY VERIFIED |
| Caching | Vercel `X-Vercel-Cache: HIT` on several routes | LIVE VERIFIED |
| Optimization changes | None applied (no confirmed P0 perf defect) | — |

---

## 14. Security findings

| ID | Finding | Priority | Status |
|---|---|---|---|
| S1 | Production CMS on **fs** driver (ephemeral / non-durable) | **P0** | LIVE VERIFIED |
| S2 | Unauthenticated CMS collection/singleton GETs (drafts/inbox readable) — **fixed in code, not deployed** | **P0** | LIVE (pre-fix) |
| S3 | Member auth persistence on filesystem unsuitable for serverless | **P0** | STATICALLY VERIFIED |
| S4 | Demo-grade password hashing (SHA-256 + fixed salt) | **P1** | STATICALLY VERIFIED |
| S5 | Admin session cookie stores long-lived secret equal to password/secret | **P1** | STATICALLY VERIFIED |
| S6 | `devOtp` can appear in API responses when email send fails | **P1** | STATICALLY VERIFIED |
| S7 | Public `/api/cms/health` reveals driver/integration flags | **P2** | LIVE VERIFIED |
| S8 | `next/image` remotePatterns includes `hostname: "**"` | **P2** | STATICALLY VERIFIED |
| S9 | No `middleware.ts` edge gate for `/admin` | **P2** | STATICALLY VERIFIED |
| S10 | Credential hygiene: ensure production admin password ≠ email and secrets are unique; rotate if ever shared in chat/logs | **P0** ops | BLOCKED (dashboard) |

Destructive security tests were not performed.

---

## 15. Files changed (this audit)

Safe code/configuration fixes only:

| File | Change |
|---|---|
| `src/lib/seo/site-url.ts` | **New** — canonical site URL helper |
| `src/lib/seo/metadata.ts` | `metadataBase`, absolute canonical/OG/Twitter URLs |
| `src/app/layout.tsx` | Wire `getSiteUrl()` into root metadata |
| `src/app/robots.ts` | **New** — allow public; disallow admin/api/account/verify/forgot-password |
| `src/app/sitemap.ts` | **New** — static hubs + published CMS slugs (no research detail URLs) |
| `src/lib/cms/public-read.ts` | **New** — admin-only collections + strict published check |
| `src/app/api/cms/[collection]/route.ts` | Require admin unless `published=1`; tighten published filter |
| `src/app/api/cms/[collection]/[id]/route.ts` | Same auth/public-read rules |
| `src/app/api/cms/homepage/route.ts` | GET requires admin |
| `src/app/api/cms/navigation/route.ts` | GET requires admin |
| `src/app/api/cms/site-settings/route.ts` | GET requires admin |
| `src/lib/auth/server-ops.ts` | Invite links use `getSiteUrl()` |
| `src/app/(auth)/layout.tsx` | `noindex` for auth pages |
| `src/app/(public)/account/page.tsx` | `noindex` |
| `src/app/(public)/verify/page.tsx` | `noindex` |
| `src/app/(public)/verify/[code]/page.tsx` | `noindex` |
| `.env.example` | Document production site URL + mongo requirement |
| `AGENTS.md` | Canonical production domain note |
| `docs/BKSR_PRODUCTION_DOMAIN_AUDIT.md` | This report |

**Not changed:** DNS, Vercel dashboard, production env values, Mongo data, seeds, UI redesigns.

---

## 16. Remaining blockers

### P0 — block “production ready”

1. Switch production to `CMS_DRIVER=mongo` (with verified DB) — **approval + Vercel env**
2. Deploy security/SEO code fixes from this audit
3. Set `NEXT_PUBLIC_SITE_URL=https://www.bkschoolofresearch.org`
4. Remove/hide fictional demo people + placeholder researcher quotes from public pages
5. Confirm admin credentials are strong/unique and OTP email works (authorized test)
6. Plan durable member-auth storage (Mongo/accounts collection) before relying on member login in production

### P1

7. Redirect or protect `bksr.vercel.app` to avoid duplicate indexing
8. Replace prototype media / collaboration logos with institutional assets
9. Stakeholder-verify homepage statistics and ED claims
10. Upgrade password hashing; stop returning `devOtp` in production responses
11. Authorized E2E of Join → invite → register

### P2

12. Lock down or reduce public health disclosure
13. Narrow `next/image` remotePatterns
14. Optional edge middleware for `/admin`

---

## 17. Required Vercel dashboard actions

**Confirmed (operator screenshot, 26 Sep 2026):**

- Git connected: [bkschoolofresearch-eng/bkschoolofresearch](https://github.com/bkschoolofresearch-eng/bkschoolofresearch) → `main`
- Custom domain connected: `www.bkschoolofresearch.org` (Production Ready)
- Production deploy shown: `eb0d973` on Hobby plan
- Environment Variables panel shows **5** configured entries — likely incomplete vs the full required set in §18; verify each name below is present for **Production**

Still required:

1. Confirm Domains: apex redirects to www (already LIVE from HTTP checks).
2. Production Environment Variables — set/verify **names** listed in §18 (especially if only 5 are set today).
3. Set `CMS_DRIVER=mongo` for Production (live health still reports `fs` / `local-file`).
4. Set `NEXT_PUBLIC_SITE_URL=https://www.bkschoolofresearch.org`.
5. Decide policy for `bksr.vercel.app`: **308 → www** or Deployment Protection.
6. Confirm SSL certificate status in Domains UI (issuer/expiry).
7. Commit + push audit fixes to `main`, then let Vercel redeploy (or Redeploy after push).
8. Do **not** run seed/reset against production without written approval.

---

## 18. Required production environment variables (NAMES ONLY)

```
NEXT_PUBLIC_SITE_URL
CMS_DRIVER
MONGODB_URI
MONGODB_DB
CMS_ADMIN_EMAIL
CMS_ADMIN_PASSWORD
CMS_ADMIN_SECRET
CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER
RESEND_API_KEY
RESEND_FROM_EMAIL
CONTACT_INBOX_EMAIL
```

Recommended production values (non-secret):

- `NEXT_PUBLIC_SITE_URL=https://www.bkschoolofresearch.org`
- `CMS_DRIVER=mongo`
- `MONGODB_DB=bksr`

Optional / unused for current media path: R2_* variables.

---

## 19. Production readiness checklist

| Requirement | Ready? |
|---|---|
| Official www domain live + HTTPS | **Yes** (LIVE) |
| Apex → www permanent redirect | **Yes** (LIVE) |
| Canonical absolute URLs / robots / sitemap on live | **No** until deploy of fixes |
| Durable CMS (`mongo`) on production | **No** (`fs` LIVE) |
| CMS read APIs locked down on live | **No** until deploy of fixes |
| Demo personnel removed from public | **No** |
| Member auth durable + strong hashing | **No** |
| Resend/Cloudinary configured | **Flags yes**; E2E BLOCKED |
| Authorized admin smoke test | **BLOCKED** |
| Duplicate staging host controlled | **No** |
| Lint clean | **No** (pre-existing errors) |
| Typecheck clean | **No** (pre-existing errors) |
| Production build of audit branch | **Pass (compile + typecheck + static generation)** — `robots.txt` / `sitemap.xml` routes included. Shell exit code reported `-1` after a successful Next finish (likely process teardown noise); treat build output as successful. One blocking TS issue in `CollectionEditorPage` was fixed (`summary` default). |

**Overall:** The public frontend on the official domain is **live and navigable**, but the deployment is **not fully production-ready** until Mongo persistence, security/SEO deploy, and prototype-content cleanup are completed.

---

## Appendix A — Research link behavior

**LIVE VERIFIED:** `/research` cards with a known DOI open `https://doi.org/...` (example: `10.1108/PMM-03-2026-0025`). Code path `researchProjectExternalUrl` never fabricates internal detail destinations. Projects without external URLs remain non-linked cards (expected).

## Appendix B — Git context at audit start

- Branch: `main`
- Working tree: dirty with prior admin/research work + this audit’s files
- No deploy / no commit performed by this audit unless separately requested
