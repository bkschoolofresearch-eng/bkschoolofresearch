# BKSR P0 Remediation Report

| Field | Value |
|---|---|
| **Date** | 26 September 2026 |
| **Branch** | `ratul` (clean start; remediation committed locally as uncommitted until operator request) |
| **Canonical domain** | `https://www.bkschoolofresearch.org/` |
| **Audit source** | `docs/BKSR_PRODUCTION_DOMAIN_AUDIT.md` |
| **Deployed automatically** | No |

Verification labels:

| Label | Meaning |
|---|---|
| **IMPLEMENTED** | Code present in this working tree |
| **LOCALLY VERIFIED** | Confirmed via local lint / tsc / build / security tests |
| **STAGING VERIFIED** | Confirmed on a non-production Vercel preview |
| **LIVE VERIFIED** | Confirmed on www production |
| **BLOCKED** | Needs operator / credentials / staging |
| **FAILED** | Checked and failed |

---

## 1. Issues fixed

| Issue | Status |
|---|---|
| Unauthenticated CMS collection reads | **IMPLEMENTED** — explicit public allowlist + admin for everything else |
| `?published=1` exposing inbox collections | **IMPLEMENTED** — join/registration/role/link collections never public |
| Draft leakage via public API | **IMPLEMENTED** — strict `status === 'published'` |
| Production open CMS without admin env | **IMPLEMENTED** — fail closed in production |
| Admin cookie = raw long-lived secret | **IMPLEMENTED** — HMAC signed, time-bounded session cookie |
| `devOtp` in production API JSON | **IMPLEMENTED** — gated by `allowDevOtpExposure()` |
| Demo SHA-256 password hashing | **IMPLEMENTED** — bcrypt + legacy verify/rehash |
| Relative SEO / missing robots & sitemap | **IMPLEMENTED** (from prior audit; retained) |
| Fictional demo people on public site | **IMPLEMENTED** — removed from public presentation |
| Placeholder researcher testimonials | **IMPLEMENTED** — section removed from homepage until real quotes exist |

---

## 2. Existing audit fixes verified

Already present on branch before this remediation (from prior audit / CMS work):

- `src/lib/seo/site-url.ts`, absolute metadata, `robots.ts`, `sitemap.ts`
- Auth/account/verify `noindex`
- Initial CMS GET gating (extended here with allowlist)
- Research external DOI/journal link helpers

These remain in place and were re-verified during build (routes `/robots.txt`, `/sitemap.xml` generated).

---

## 3. Files changed (this remediation)

### Security / CMS
- `src/lib/cms/public-read.ts` — public allowlist + admin-only set
- `src/lib/cms/admin-auth.ts` — production fail-closed; signed session verify
- `src/lib/cms/admin-session.ts` — HMAC session issue/verify
- `src/lib/cms/api-guard.ts` — 503 when admin security not configured
- `src/lib/cms/admin-otp.ts` — no production OTP echo
- `src/app/api/cms/[collection]/route.ts`
- `src/app/api/cms/[collection]/[id]/route.ts`
- `src/app/api/cms/session/route.ts`
- `src/app/api/cms/session/otp/route.ts`

### Auth
- `src/lib/auth/password.ts` — bcrypt + legacy migration
- `src/lib/auth/server-ops.ts` — bcrypt register/login; no prod `devOtp`
- `src/lib/auth/server-store.ts` — optional `AUTH_DRIVER=mongo` switch (off by default)
- `src/lib/auth/mongo-store.ts` — Mongo auth scaffold (not activated)
- `src/lib/security/runtime.ts` — production / OTP exposure helpers

### Public content
- `src/app/(public)/page.tsx` — CMS team only; testimonials hidden
- `src/app/(public)/people/page.tsx` — no demo roster merge
- `src/app/(public)/people/[slug]/page.tsx` — CMS people only; demo profiles 404
- `src/content/seed/people-demo.ts` — retained for design demos, not public

### Quality / docs / config
- `src/components/home/ResearcherSay.tsx` — lint-safe ref update
- `src/components/layout/useSiteCtaPit.ts` — prefer-const
- `src/lib/cms/repository.ts` — prefer-const
- `scripts/security-regression.mts` + `package.json` `test:security`
- `.env.example` — `AUTH_DRIVER` notes
- `tsconfig.json` — exclude `scripts` from app typecheck
- `docs/BKSR_P0_REMEDIATION_REPORT.md` — this file

---

## 4. Security behavior before vs after

| Behavior | Before | After |
|---|---|---|
| `GET /api/cms/people` (no auth) | Returned items | **401** unless admin |
| `GET /api/cms/people?published=1` | Returned published (+ risk for no-status) | Published only, allowlisted |
| `GET /api/cms/joinApplications` | `{"items":[]}` readable | **401** |
| `GET /api/cms/homepage` | Open | **401** (admin) |
| Production without admin env | Possible open FS CMS | **503 / closed** |
| Admin session cookie | Raw secret/password | HMAC payload + expiry |
| Member password | SHA-256 fixed salt | bcrypt; legacy auto-rehash on login |
| OTP in JSON | Echoed when mail fails | Dev-only; never in production |

**LIVE VERIFIED:** Not yet — undeployed.

---

## 5. CMS public / private API behavior

### Public (no auth) — only with `?published=1`
`pages`, `people`, `researchAreas`, `researchProjects`, `publications`, `activities`, `news`, `events`, `notices`, `resources`, `galleryAlbums`, `galleryImages`, `media`, `achievements`

### Always admin
`joinApplications`, `registrationEntries`, `registrationForms`, `roleAssignments`, `personContentLinks`, `achievementAssignments`, `memberAchievements`

### Singletons
`/api/cms/homepage`, `/navigation`, `/site-settings` — admin GET/PATCH

Public pages continue to use server-side `getContentDatabase()` (not the open admin API).

---

## 6. Auth changes

| Area | Change | Status |
|---|---|---|
| Member passwords | bcrypt (cost 12); legacy SHA-256 verify → rehash | **IMPLEMENTED** / **LOCALLY VERIFIED** (unit) |
| Admin browser session | Signed cookie | **IMPLEMENTED** |
| Script access | `x-cms-admin-secret` still accepts secret/password | **IMPLEMENTED** |
| OTP leak | Stripped in production | **IMPLEMENTED** |
| Durable member store | Mongo scaffold + `AUTH_DRIVER` switch | **IMPLEMENTED** scaffold; **default still FS** |
| Forgot password | Still incomplete product flow | Unchanged |

---

## 7. SEO fixes

| Item | Status |
|---|---|
| `metadataBase` + absolute canonical/OG | **IMPLEMENTED** |
| `robots.txt` | Generated in build (**LOCALLY VERIFIED**) |
| `sitemap.xml` | Generated; published content; no research detail URLs | **LOCALLY VERIFIED** |
| Admin / auth / account / verify noindex | **IMPLEMENTED** |
| Live www SEO | Still missing until deploy | **BLOCKED** (not LIVE) |

---

## 8. Demo content changes

| Item | Action |
|---|---|
| 28 fictional people | Removed from `/`, `/people`, hubs, profiles |
| Placeholder “Attribution pending” quotes | Homepage section removed (component kept) |
| Prototype decorative imagery | Still used where CMS imagery missing (temporary OK) |
| Collaboration prototype logos | Still present (decorative; replace later) |
| Real Bezon Kumar / CMS people | Unchanged |

---

## 9. MongoDB migration readiness

### Current live production (last known)
`CMS_DRIVER=fs` despite `mongoConfigured: true` (**LIVE VERIFIED** earlier).

### Code readiness

| Layer | Ready? | Notes |
|---|---|---|
| CMS Mongo repository | Yes (existing) | Do not seed/overwrite production |
| Auth Mongo store | Scaffold only | `AUTH_DRIVER=mongo` off by default |
| Combined production cutover | **Not ready** | Needs staging E2E |

### Migration strategy (approval required — do not auto-run)

**Source of truth today:** Vercel FS is ephemeral → treat compiled seed / any exported `.data` as incomplete. Prefer exporting from a controlled staging mongo after a one-time import from the intended content snapshot.

1. **Backup**
   - Export local `.data/cms-database.json` and `.data/auth-store.json` if present
   - Snapshot Mongo Atlas cluster if any data already exists
2. **Staging project / Preview env**
   - `CMS_DRIVER=mongo`, `MONGODB_URI`, `MONGODB_DB=bksr`
   - `AUTH_DRIVER=fs` initially (or mongo only after auth tests)
   - Import content with an **idempotent upsert** script (not `seed` wipe)
3. **Validate**
   - Collection counts, sample published research/publications/people
   - Admin login OTP
   - Join application create → admin list
4. **Auth migration**
   - Export auth-store → `mongoWriteAuthStore`
   - Set `AUTH_DRIVER=mongo` in staging only
   - Login with legacy hash → confirm bcrypt rehash persisted
5. **Production cutover**
   - Set env vars → redeploy → smoke
6. **Rollback**
   - Revert env to `CMS_DRIVER=fs` / previous deploy URL
   - Keep Atlas snapshot

**Never** run `seed:mongo` / reset against production without written approval.

---

## 10. Remaining approval-required actions

1. Commit + push this remediation to GitHub `main`/`ratul` (operator chooses branch policy)
2. Vercel Production env: full variable set (§11), especially `CMS_DRIVER=mongo` **after** staging
3. Set `NEXT_PUBLIC_SITE_URL=https://www.bkschoolofresearch.org`
4. Redirect or protect `bksr.vercel.app`
5. Authorized admin OTP + CMS write smoke on staging
6. Stakeholder verify homepage stats / ED claims
7. Replace prototype imagery when institutional assets ready

---

## 11. Environment variable names only

```
NEXT_PUBLIC_SITE_URL
CMS_DRIVER
NEXT_PUBLIC_CMS_MODE
AUTH_DRIVER
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
ALLOW_DEV_OTP
```

Recommended production (non-secret):

- `NEXT_PUBLIC_SITE_URL=https://www.bkschoolofresearch.org`
- `CMS_DRIVER=mongo` *(only after staging)*
- `AUTH_DRIVER=fs` until auth mongo staging passes, then `mongo`
- `MONGODB_DB=bksr`

---

## 12. Test results

| Suite | Result |
|---|---|
| `pnpm run test:security` | **PASS** (8/8) — allowlist, bcrypt, legacy rehash flag, research external URL | **LOCALLY VERIFIED** |
| Existing automated app tests | None beyond security script | — |

---

## 13. Build results

| Command | Exit | Result |
|---|---|---|
| `pnpm run lint` | **0** | PASS (warnings only; 0 errors) |
| `pnpm run typecheck` / `tsc --noEmit` | **0** | PASS |
| `pnpm run build` | **0** | PASS — includes `/robots.txt`, `/sitemap.xml`; people static paths no longer include demo roster |

---

## 14. Deployment sequence

### A. Safe security/SEO patch (recommended next)
1. Merge/push this code
2. Ensure Production has admin + site URL + Cloudinary/Resend vars
3. Keep `CMS_DRIVER=fs` **or** already-planned mongo — do not change blindly mid-deploy without migration plan
4. Deploy via Git → Vercel
5. Verify: `/robots.txt`, `/sitemap.xml`, `GET /api/cms/joinApplications` → 401, `/people` has no Carlos Ramirez, admin login still works

**Rollback A:** Redeploy previous Vercel deployment / revert Git commit.

### B. MongoDB CMS migration
Follow §9 staging → production. Separate from A if possible.

**Rollback B:** `CMS_DRIVER=fs` + prior deployment; restore Atlas snapshot if writes occurred.

### C. Durable auth migration
Staging `AUTH_DRIVER=mongo` after B. Then production.

**Rollback C:** `AUTH_DRIVER=fs` + restore auth export.

### D. Production data validation
Count checks, spot-check research DOI cards, people, publications.

### E. Authorized E2E
Admin OTP, join submit (staging), invite/register (staging).

---

## 15. Rollback procedure (summary)

| Stage | Action |
|---|---|
| A Security/SEO | Instant rollback to previous Vercel deployment |
| B CMS mongo | Env revert `CMS_DRIVER`; redeploy; Atlas restore if needed |
| C Auth mongo | Env revert `AUTH_DRIVER`; restore `.data`/auth collections |
| Content mistake | Restore from export — never re-seed over live without approval |

---

## 16. Remaining production blockers

| Priority | Blocker | Status |
|---|---|---|
| P0 | Code not deployed to www | **BLOCKED** (operator push/deploy) |
| P0 | Live still on `CMS_DRIVER=fs` | **BLOCKED** (migration approval) |
| P0 | Member auth still FS by default | **BLOCKED** for durable serverless auth |
| P1 | `bksr.vercel.app` duplicate host | Operator |
| P1 | Prototype imagery / collab logos | Content |
| P1 | Homepage unverified stats | Stakeholder |
| P2 | Public `/api/cms/health` info disclosure | Optional follow-up |

---

## Final readiness answers

| Question | Answer |
|---|---|
| Is the security/SEO patch ready to deploy? | **Yes** — lint/typecheck/build/security tests PASS locally. Operator must push + deploy. |
| Is MongoDB migration ready? | **No** — CMS driver exists; cutover plan documented; **not** staging-verified; do not flip production yet. |
| Is member auth persistence production-ready? | **No** — hashing improved; storage still FS by default; Mongo auth is scaffold only. |
| Is the complete website production-ready? | **No** — P0 persistence + undeployed patch remain. |
| Exact operator action required? | 1) Review/merge this branch 2) Push to GitHub 3) Confirm Vercel env names 4) Deploy security/SEO patch 5) Run staging mongo migration before setting `CMS_DRIVER=mongo` on Production |

**Do not claim LIVE VERIFIED for undeployed code.**
