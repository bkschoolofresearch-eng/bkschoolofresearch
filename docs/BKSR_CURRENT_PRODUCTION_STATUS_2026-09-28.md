# BKSR current production status — 28 September 2026

| Field | Value |
|---|---|
| **Assessed** | 28 September 2026, about 17:40 UTC+6 |
| **Method** | Read-only. Git, source, existing docs, and non-destructive HTTPS checks against the public site. |
| **Official site** | https://www.bkschoolofresearch.org/ |
| **GitHub** | https://github.com/bkschoolofresearch-eng/bkschoolofresearch |
| **Security commit checked** | `f2e2036c21a35ee8ea59e622b2396a8e4764a954` |
| **Application files changed by this assessment** | None. This report is the only file added. |

Status labels: **LIVE VERIFIED**, **LOCALLY VERIFIED**, **STATICALLY VERIFIED**, **BLOCKED**, **NOT IMPLEMENTED**, **FAILED**.

---

## 1. Executive summary

The public website is up on Vercel at the official www domain. Apex redirects to www. The live deployment matches **`origin/main` at `3d206ec`**, not the security release.

`f2e2036` is on `origin/security/bksr-production-hardening` only. It is **not** an ancestor of `origin/main`. It is **not** what the live site is serving.

Live evidence that the security release is absent:

- `/people` and the homepage still render fictional names (Carlos Ramirez, Sofia Chen, Aisha Patel, Daniel Wong).
- `/people/carlos-ramirez` returns **HTTP 200**.
- The homepage still renders “What Our Researchers Say” and “Attribution pending”.
- Those presentations were removed in `f2e2036` and are still present on `origin/main`.

What *is* live from earlier `main` work (`3d206ec`, “updated the admin CMS research and publications”):

- `robots.txt` and `sitemap.xml` return 200.
- Unauthenticated reads of join applications, registration entries, and homepage CMS config return **401**.
- `GET /api/cms/people` without `?published=1` returns **401**. With `?published=1` it returns **200** and one published person. Draft statuses were not in that payload.
- CMS health reports **`driver: fs`**. Mongo is configured on the host but is not the active CMS driver.
- Canonical, Open Graph URL, robots `Host`, and all **148** sitemap URLs are **`http://localhost:3000`**.

The local working tree is the security branch plus a large **uncommitted** pile. That pile includes later CMS/SEO work and also **puts fictional demo people and placeholder quotes back into seed and the homepage**. It does not build (`pnpm run build` exit 1).

**Next phase:** land the security release on `main` and production as a clean commit, without the dirty tree, and point production `NEXT_PUBLIC_SITE_URL` at `https://www.bkschoolofresearch.org`. Do not start the Mongo cutover yet.

---

## 2. Current Git state

| Item | Evidence | Status |
|---|---|---|
| Local branch | `security/bksr-production-hardening` | LIVE VERIFIED (git) |
| Tracking | In sync with `origin/security/bksr-production-hardening` at `f2e2036` | LIVE VERIFIED (git) |
| `HEAD` commit | `f2e2036` `fix: harden BKSR production security and SEO` | LIVE VERIFIED (git) |
| `origin/main` and local `main` | Both `3d206ec` `updated the admin CMS research and publications` | LIVE VERIFIED (git) |
| `f2e2036` merged into `main`? | `git merge-base --is-ancestor` exit 1. Only commit on the security branch since `3d206ec` is `f2e2036` itself (`git log origin/main..f2e2036`). | **FAILED** (not merged) |
| `main` pushed? | Local `main` and `origin/main` are the same SHA. Nothing newer than `3d206ec` is on `origin/main`. | LIVE VERIFIED (git) |
| Security changes on the production branch (`main`)? | No. HMAC session file `src/lib/cms/admin-session.ts` is absent on `origin/main`. `bcrypt` is absent from `origin/main` password code. `devOtp` is still returned unconditionally in `origin/main` session routes. | STATICALLY VERIFIED |
| Working tree | Dirty. Dozens of modified tracked files, deletions under `src/app/admin/pages/`, and untracked admin/SEO/seed files. Not committed. Not on `origin/main`. | LIVE VERIFIED (git) |
| Local branch aligned with `origin/main`? | No. Branch is the security branch, one commit ahead of `main`, plus uncommitted work. | LIVE VERIFIED (git) |

`f2e2036` vs `3d206ec` is 27 files, +1037 / −282. It adds the public-read allowlist completion, HMAC admin sessions, bcrypt, production `devOtp` gate, demo-people removal from public pages, auth Mongo scaffold, security tests, and the P0/checklist docs.

---

## 3. Latest main commit

| | |
|---|---|
| SHA | `3d206ecead748b52e9e30367bc65922b5e426fba` |
| Subject | `updated the admin CMS research and publications` |
| Remote | `origin/main` |
| Parent line | `eb0d973` `updated`, then `3d206ec` |

`3d206ec` already contains a **partial** CMS gate (`CMS_ADMIN_ONLY_COLLECTIONS`, published-only filter), `robots.ts`, `sitemap.ts`, and `getSiteUrl()`. It does **not** contain the security commit’s allowlist completion, signed admin sessions, bcrypt, or the public removal of demo people and placeholder quotes.

---

## 4. Actual Vercel production deployment

| Check | Result | Status |
|---|---|---|
| Vercel MCP | Namespace `plugin-vercel-vercel` is `needsAuth`. Not authenticated for this assessment. | **BLOCKED** |
| Local Vercel CLI project link | `.vercel/project.json` points at project id `prj_FZjl3cMeeAVl7VojmEPEUc3Ms9tN`, project name `bksr`, org `team_K3ReTbLEeN562JD0WCkWVr3O`. Earlier work established this CLI login is a **different** team from the official `bksr` team that owns www. No deploy command was run. | **BLOCKED** for official deployment id |
| GitHub deployments API | HTTP rate limit. No deployment payload. | **BLOCKED** |
| Production deployment id, timestamp, and exact SHA from the dashboard | Not retrieved. | **BLOCKED** |
| What the live site actually behaves like | Content fingerprint matches `3d206ec`, not `f2e2036` (section 5 and 6). | LIVE VERIFIED (behavior) |
| Official domain | `https://www.bkschoolofresearch.org/` HTTP 200, `Server: Vercel`, HSTS present. | LIVE VERIFIED |
| Apex | `https://bkschoolofresearch.org/` **308** to `https://www.bkschoolofresearch.org/`. | LIVE VERIFIED |
| Legacy alias | `https://bksr.vercel.app/` HTTP 200, no redirect to www. `X-Vercel-Cache: STALE` at check time. | LIVE VERIFIED |

**Do not treat Git history as proof of what Vercel is serving.** The behavior check is the evidence: production is serving the pre-security-release site.

---

## 5. Security patch deployment status

| Fix | On `f2e2036` | On `origin/main` | Live www |
|---|---|---|---|
| 1. Explicit public CMS allowlist (`canPublicReadCollection` / `assertPublicCmsReadAllowed`) | Yes | No. Main only has `CMS_ADMIN_ONLY_COLLECTIONS` plus “deny if not `published=1`”. | Behavior matches **main**, not the stricter allowlist. `mediaClippings` is 404 because that collection is only in the dirty tree. |
| 2. Published-only public reads | Yes | Partial. `?published=1` filters `status === 'published'`. | LIVE VERIFIED for people: no `published=1` → 401; `published=1` → 200, 1 item, status `published` only. |
| 3. Private/draft reads need auth | Yes | Partial (any collection without `published=1` requires admin). | LIVE VERIFIED: `/api/cms/people` 401; `/api/cms/homepage` 401. |
| 4. Join applications not public | Yes | Yes (admin-only set) | LIVE VERIFIED: 401 with and without `?published=1`. Body not stored. |
| 5. Registration entries not public | Yes | Yes | LIVE VERIFIED: 401 with and without `?published=1`. |
| 6. Production fail-closed if admin env missing | Yes (`cmsAdminSecurityReady`) | Not this implementation | **BLOCKED** on live (would need to remove env). Code for the fail-closed path is not on `main`. |
| 7. HMAC admin session cookie | Yes (`admin-session.ts`) | File absent. No `issueCmsAdminSessionCookie` on `main`. | **BLOCKED** (no login performed). Not in the commit that matches live behavior. |
| 8. No `devOtp` in production API JSON | Yes (`allowDevOtpExposure`) | **No.** Session routes spread `devOtp` whenever it was issued. | **BLOCKED** (did not request an OTP). Source on the live-matching commit still exposes it. |
| 9. bcrypt + legacy rehash | Yes | **No** `bcrypt` in `origin/main` `src/lib/auth/password.ts` | **BLOCKED** (no password write). Not in the live-matching commit. |
| 10. Fictional people and placeholder testimonials removed from public UI | Yes | **No.** `peopleDemoRoster` and `ResearcherSay` are still rendered from `origin/main` pages. | **FAILED.** Names and “Attribution pending” are in the live HTML. `/people/carlos-ramirez` is HTTP 200. |

**Verdict:** the security release is **not deployed**. It is **not merged**.

---

## 6. Production smoke results

Non-destructive GET only. No forms submitted. No CMS writes.

| Path | HTTP | Notes |
|---|---|---|
| `/` | 200 | Demo names, testimonials, BKSR in Media, Business Standard text present. Canonical `http://localhost:3000`. |
| `/about` | 200 | |
| `/research` | 200 | Title “Research \| BK School of Research”. `doi.org` present in HTML. |
| `/publications` | 200 | |
| `/people` | 200 | Demo names plus Bezon. |
| `/people/bezon-kumar` | 200 | |
| `/people/carlos-ramirez` | 200 | Fictional profile is public. |
| `/activities` | 200 | |
| `/news-events`, `/news`, `/events`, `/notices` | 200 | |
| `/contact`, `/join`, `/login`, `/media`, `/search` | 200 | |
| `/admin` | 200 | `robots` **noindex, nofollow**. Title “BKSR CMS”. Login itself was not completed. |
| `/login` | 200 | `robots` **index, follow**. Page metadata overrides the auth layout noindex (see SEO). |
| `/robots.txt` | 200 | `Host` and `Sitemap` are `http://localhost:3000`. Disallows `/admin`, `/api/`, `/account`, `/verify`, `/forgot-password`. |
| `/sitemap.xml` | 200 | 148 URLs, **all** `http://localhost:3000/...`. |
| `GET /api/cms/health` | 200 | `{"ok":true,"driver":"fs","apiEnabled":true,"mongoConfigured":true,"cloudinaryConfigured":true,"resendConfigured":true,"mode":"local-file"}`. Public. No secrets in this payload. |

`/api/cms/publications?published=1` returned 200. Response body was not archived.

Images were not pixel-audited. Navigation was not click-tested in a browser in this pass; route status codes above are the check.

---

## 7. CMS database status

| | Local working tree env | Production (live health) |
|---|---|---|
| `CMS_DRIVER` | `mongo` (`.env.local`, value is not a secret) | Effective driver **`fs`** |
| `MONGODB_URI` | set (value not recorded) | Health `mongoConfigured: true` — a URI is present on the host. It is **not** the active driver. |
| `MONGODB_DB` | `bksr` | Not exposed by health. Not queried. |
| `NEXT_PUBLIC_CMS_MODE` | `mongo` | Not read from the dashboard. |
| Active CMS store | Local process would use Mongo **if** this env is loaded | **Filesystem driver.** On Vercel, a local `.data/cms-database.json` is not durable. Live public pages still show content, so the deployed FS snapshot or build-time data is what visitors see. Exact file durability was not opened. |
| `AUTH_DRIVER` | **unset** in `.env.local` | Not in the health payload. Code defaults to filesystem unless `AUTH_DRIVER=mongo` and `MONGODB_URI`. |

Public people API (`?published=1`) returned one published record. Response **keys** include `email` and `verificationCode`. Values were not copied into this report. That is a field-stripping gap on the public read path (`serverGetAll` returns stored documents).

No production Mongo connection was opened. No seed or migration was run.

---

## 8. Auth database status

| Piece | State | Status |
|---|---|---|
| Default store | `.data/auth-store.json` via `src/lib/auth/server-store.ts` | STATICALLY VERIFIED |
| Accounts, sessions, OTPs, register tokens, invites | Fields exist on the FS store shape | STATICALLY VERIFIED |
| Mongo auth | `src/lib/auth/mongo-store.ts` is a scaffold on `f2e2036` and in the working tree. Header says it is not production-ready. `AUTH_DRIVER` is unset locally. | STATICALLY VERIFIED |
| Activation rule | Mongo only if `AUTH_DRIVER=mongo` **and** `MONGODB_URI` | STATICALLY VERIFIED |
| Live member login / OTP / session | Not exercised | **BLOCKED** |
| Password hashing on the live-matching commit | SHA-256 style path. bcrypt is only in `f2e2036` / dirty tree (`src/lib/auth/password.ts`) | STATICALLY VERIFIED |

---

## 9. Mongo migration readiness

| Question | Answer | Status |
|---|---|---|
| CMS repository code for Mongo | Present (`src/lib/cms/mongo-repository.ts`) and wired behind `getCmsDriver()` | STATICALLY VERIFIED |
| Auth repository complete? | Scaffold with replace-all read/write. Not proven by a staging round-trip. | STATICALLY VERIFIED |
| CMS indexes | `src/lib/db/indexes.ts` `ensureIndexes` for CMS collections. Invoked from health **POST** (admin), not from public GET. | STATICALLY VERIFIED |
| Auth indexes | No `auth_` indexes in `indexes.ts` | **NOT IMPLEMENTED** |
| Migration scripts | No approved production migration runner was executed or found as a finished cutover. `scripts/seed-demo-roster.mjs` is **untracked** and must not be treated as a migration. | STATICALLY VERIFIED |
| Staging migration tested | Not in this assessment | **BLOCKED** |
| Backup / export plan | Not present as an executed artifact in-repo | **NOT IMPLEMENTED** |
| Rollback plan | Not present as an executed procedure | **NOT IMPLEMENTED** |
| Production data vs seed | Not reconciled. Production CMS driver is `fs`. Local env points at Mongo. Those are different stores. | STATICALLY VERIFIED |
| Safe to switch drivers now? | **No.** | |

---

## 10. Admin / CMS status

| Workflow | Code | Live |
|---|---|---|
| Admin shell `/admin` | Present | LIVE VERIFIED page 200, noindex. Login and OTP **BLOCKED** (not performed). |
| Dashboard, research, publications, people, news, events, notices, media library, join applications, registration forms, navigation, settings | Routes and editors exist in the tree | **STATICALLY VERIFIED** only. No production mutations. |
| Cache revalidation | `revalidateTag` on CMS writes in the repositories | STATICALLY VERIFIED. Not observed live. |
| Public published rendering | Pages return 200 | LIVE VERIFIED for the routes in section 6. |
| BKSR in Media as its own collection | Uncommitted `mediaClippings` work | **NOT** on `main` or live (`/api/cms/mediaClippings?published=1` → 404). Live homepage still has a BKSR in Media section from the older publications/press path. |
| Dirty tree vs security commit | Uncommitted `src/app/(public)/page.tsx` renders `ResearcherSay` again. `src/content/seed/people.ts` spreads `demoPeople`. `src/content/seed/demo-roster.ts` is untracked. | This **undoes** the security commit’s public demo removal if it is committed as-is. |

End-to-end admin CRUD was **not** verified.

---

## 11. SEO completion matrix

| Item | Code on `origin/main` | Live | Dirty working tree |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Resolver prefers this env, else www when `VERCEL_ENV=production` | Built output is localhost, so the **build** resolved to `http://localhost:3000`. Dashboard value **BLOCKED**. Most plausible cause is Production env set to localhost, which wins over the `VERCEL_ENV` branch. | Local `.env.local` host is `localhost:3000`. Uncommitted `getSiteUrl()` ignores a localhost env when `VERCEL_ENV=production`. Not deployed. |
| `metadataBase` / canonical | `src/lib/seo/metadata.ts` + `getSiteUrl()` | Canonical `http://localhost:3000` | Same bug locally, which is correct for local dev |
| `robots.txt` | Yes | 200, but Host/Sitemap are localhost | — |
| `sitemap.xml` | Yes, published slugs | 200, 148 localhost URLs | — |
| Open Graph | Yes | `og:url` localhost. Description is the older homepage sentence (below). | Uncommitted `og:image` `/brand/bksr-logo.png` |
| Twitter | `summary` on live | LIVE VERIFIED tags exist; not a large card | — |
| Public pages indexable | Default index, follow | LIVE VERIFIED on `/` and `/research` | — |
| Admin noindex | Admin layout | LIVE VERIFIED on `/admin` | — |
| Login / private noindex | Auth layout sets noindex, but `src/app/(auth)/login/page.tsx` calls `buildPageMetadata` **without** `noIndex`, and that sets `robots: index, follow`, which overrides the layout | LIVE VERIFIED `/login` is `index, follow` | Same override still in the working tree. `/account` and `/verify` pass `noIndex: true` in code. Live account/verify were not fetched. |
| www vs apex | Vercel domain redirect, not `next.config` | Apex 308 to www | — |
| `bksr.vercel.app` | — | Still HTTP 200, not redirected | **FAILED** as a duplicate host |
| JSON-LD / Organization | Not on `main` | Absent in homepage HTML | Uncommitted `src/components/seo/SiteJsonLd.tsx` |
| Breadcrumb schema | — | — | **NOT IMPLEMENTED** |
| Article / publication schema | — | — | **NOT IMPLEMENTED** |
| Google Search Console / sitemap submit | No repo evidence | — | **BLOCKED** / **NOT IMPLEMENTED** |
| Favicon | Live link is only hashed `/favicon.ico` (old hash `favicon.3fpu2ql9ns1a0.ico`) | Google result previously showed a generic icon. Not re-checked in Google during this pass. | Uncommitted `src/app/icon.png`, `apple-icon.png`, replaced `favicon.ico`, `public/icon-192.png` |
| Homepage meta description | Page override: “Interdisciplinary research shaping evidence-based policy…” | LIVE VERIFIED that sentence | Uncommitted page uses `siteSettings.defaultSeo.description` instead. Not deployed. |

**SEO is not complete.** Robots and sitemap exist and are the wrong host.

---

## 12. Remaining security gaps

Evidence-backed. No penetration test was run.

| Gap | Evidence | Priority |
|---|---|---|
| Security release not in production | Section 5 | P0 |
| `devOtp` still returned on `origin/main` session routes when an OTP is issued | `git grep` on `origin/main` | P0 until `f2e2036` is what production runs |
| Admin cookie is not the HMAC session on `main` | `admin-session.ts` missing on `origin/main` | P0 |
| Member passwords on `main` are not bcrypt | No `bcrypt` on `origin/main` password module | P0 |
| Demo people publicly routable | `/people/carlos-ramirez` 200 | P0 |
| Canonical and sitemap advertise localhost | Live robots + 148 sitemap URLs | P0 |
| Login is indexable | Live robots meta `index, follow` | P1 |
| Public people JSON includes `email` and `verificationCode` | Keys on `GET /api/cms/people?published=1` | P1 |
| Public `GET /api/cms/health` describes driver and which vendors are configured | Live 200 JSON | P1 |
| No rate limit on login, OTP, or public forms | No `rateLimit` usage under `src/`. OTP attempt cap exists only inside the auth store (`MAX_OTP_ATTEMPTS`) | P1 |
| No CSRF token layer found | Cookie session model; not separately reviewed as a full CSRF design | P1, STATICALLY VERIFIED as absent |
| HTML sanitizer is a small allowlist regex in `RichText.tsx`, not a proven HTML library | `src/components/ui/RichText.tsx` | P2 |
| Upload filename sanitization exists for Cloudinary | `src/lib/storage/cloudinary.ts` | STATICALLY VERIFIED. Size/type limits were not re-tested. |
| Session invalidation / logout | Not exercised | **BLOCKED** |
| `bksr.vercel.app` duplicate public host | HTTP 200 | P1 |

---

## 13. Content and prototype status

| Item | Live | Dirty tree |
|---|---|---|
| Fictional people | Rendered and routable | Uncommitted seed spreads `demoPeople` again |
| Placeholder testimonials | “What Our Researchers Say” / “Attribution pending” on the homepage | Uncommitted homepage passes `demoResearcherQuotes` into `ResearcherSay` |
| Authentic person | Bezon Kumar profile 200. Public API count of published people: 1 | Seed still has Bezon |
| Research external DOI | `doi.org` present on `/research` HTML | Helper covered by security test locally |
| Prototype imagery | Not re-audited page by page. Prior audits still describe prototype media under `public/media/prototype` and `src/lib/content/prototype-media.ts` | Still in the tree |
| Search | `SearchOverlay` and `SearchPanel` call `getSearchIndex({ useSeed: true })` | **STATICALLY VERIFIED.** Search does not read the live CMS. |
| BKSR in Media | Section text present on the live homepage | Separate `mediaClippings` collection is uncommitted only |
| Empty publication-type shells | Not each re-opened in this pass | Architecture remains |

---

## 14. Test and build results

Commands were run on the **dirty working tree**, not on a clean `f2e2036` or `origin/main` checkout.

| Command | Exit | Result |
|---|---|---|
| `pnpm run test:security` | 0 | 8 passed, 0 failed. Suites: CMS allowlist, bcrypt + legacy SHA-256, research external URL. One Node warning: module type of `public-read.ts` is not declared. |
| `pnpm run lint` | 0 | 0 errors, 24 warnings (`react-hooks/exhaustive-deps`, unused vars, one jsx-a11y). |
| `pnpm run typecheck` | 2 | **FAILED.** `src/app/(public)/about/what-we-do/page.tsx` TS4104 readonly `HowWeWorkStep[]`. Also stale `.next/types/validator.ts` missing deleted `src/app/admin/pages/**` modules. |
| `pnpm run build` | 1 | Compiled, then **failed typecheck** on the same `what-we-do` error. |

`f2e2036` itself was previously reported to build in an earlier session. That was **not** re-run on a clean tree in this assessment.

---

## 15. P0 / P1 / P2 backlog

### P0

1. Do not deploy the dirty tree.
2. Merge a **clean** `f2e2036` (or a branch cut from it) to `main` and deploy that SHA. Confirm the live homepage no longer contains Carlos Ramirez or “Attribution pending”, and `/people/carlos-ramirez` is 404.
3. Set production `NEXT_PUBLIC_SITE_URL` to `https://www.bkschoolofresearch.org` and redeploy so canonical, robots, and sitemap stop saying localhost.
4. Keep `CMS_DRIVER` and `AUTH_DRIVER` unchanged during that release.

### P1

1. Stop `/login` from overriding noindex.
2. Strip `email` and `verificationCode` from public people JSON.
3. Remove or lock down public health detail, or require admin for it.
4. Redirect or disable `bksr.vercel.app`.
5. Rate-limit admin login, OTP, and public forms.
6. Add the BKSR favicon and Organization JSON-LD **after** the clean security deploy, from the uncommitted SEO work, without the demo-roster regression.

### P2

1. Breadcrumb and publication schema.
2. Search against published CMS data, not `useSeed: true`.
3. Stronger HTML sanitizer.
4. Google Search Console property, sitemap submit, inspection. Manual, after canonical is www.

### Do not do yet

- `CMS_DRIVER=mongo` or `AUTH_DRIVER=mongo` on production.
- Seed, reset, or migrate production data.
- Commit `scripts/seed-demo-roster.mjs` or `src/content/seed/demo-roster.ts` as public content.

---

## 16. Exact next recommended development phase

**A. Finish the security release for real: merge and production deploy of the clean security commit, then verify the live site.**

It comes before Mongo, extra hardening, and Search Console because those depend on production running the patched code and a correct canonical host. The patch is written and pushed. It is not what visitors get.

Candidates:

| ID | Candidate | Why it is not first |
|---|---|---|
| A | Security release verification | **This is the next phase.** Verification already failed. The missing step is merge + production deploy of the clean commit, then a repeat of the live checks. |
| B | CMS + Auth Mongo migration | Repositories are incomplete for a cutover (auth scaffold, no auth indexes, no backup/rollback drill). Production CMS is still `fs`. |
| C | Further hardening (rate limit, CSRF, health, field stripping) | Real, but smaller than “the P0 patch is not live”. |
| D | Technical SEO completion | Canonical host bug is part of the release verification. JSON-LD and favicon are uncommitted and mixed with a demo-content regression. |
| E | Google Search Console | Useless until sitemap URLs are `https://www.bkschoolofresearch.org/...`. |
| F | Search and content | Search still uses seed. Demo content must stay off the public site. Do not start from the dirty tree. |

---

## 17. Recommended implementation sequence

1. **Operator:** snapshot the dirty working tree outside the security release (it is real later work, and it also reintroduces demo people). Do not merge it blindly.
2. **Code:** merge `security/bksr-production-hardening` (`f2e2036`) into `main` with no extra files.
3. **Dashboard:** Production `NEXT_PUBLIC_SITE_URL=https://www.bkschoolofresearch.org`. Do not change `CMS_DRIVER` or `AUTH_DRIVER`.
4. **Deploy** from that `main` SHA only.
5. **Verify live:** no demo names, Carlos profile 404, no “Attribution pending”, private CMS routes 401, `robots`/`sitemap`/canonical use `https://www.bkschoolofresearch.org`, research DOI links still external.
6. **Then** split the dirty tree: keep CMS/editor/SEO work; drop public demo roster and placeholder quotes.
7. **Then** favicon, JSON-LD, login noindex, public field stripping.
8. **Then** Search Console.
9. **Later, separate project:** Mongo CMS and auth cutover with backup, staging, indexes, and rollback. Not part of the security release.

---

## 18. Operator-required actions

1. Open the official Vercel project (`bksr` / www) and record the production deployment SHA. This assessment could not.
2. Confirm whether Production `NEXT_PUBLIC_SITE_URL` is `http://localhost:3000`. Live HTML strongly indicates the built site URL is localhost. Do not paste the value into chat if you treat it as sensitive; the host is already public in the sitemap.
3. Do not promote the current local dirty tree.
4. After a clean security deploy, re-check `/people/carlos-ramirez` and view-source canonical.
5. Plan a redirect for `https://bksr.vercel.app/`.
6. Authorized admin OTP test stays manual. It was not run here.
7. Google Search Console remains manual and should wait until step 4 passes.

---

## 19. File references

| Finding | Path |
|---|---|
| Security commit not in `main` | Git SHAs `f2e2036` vs `3d206ec` |
| Partial allowlist on `main` | `src/lib/cms/public-read.ts` at `origin/main` (admin-only set only) |
| Full allowlist on the security commit / dirty tree | `src/lib/cms/public-read.ts` |
| CMS route gate | `src/app/api/cms/[collection]/route.ts` |
| HMAC sessions (security commit only) | `src/lib/cms/admin-session.ts` |
| `devOtp` gate (security commit only) | `src/lib/security/runtime.ts`, `src/app/api/cms/session/route.ts` |
| bcrypt (security commit / dirty tree) | `src/lib/auth/password.ts` |
| Auth Mongo scaffold | `src/lib/auth/mongo-store.ts`, `src/lib/auth/server-store.ts` |
| CMS driver switch | `src/lib/cms/server-repository.ts` `getCmsDriver` |
| Site URL | `src/lib/seo/site-url.ts` |
| Homepage SEO override | `src/app/(public)/page.tsx` |
| Login indexable | `src/app/(auth)/login/page.tsx` vs `src/app/(auth)/layout.tsx` |
| Demo roster on `main` pages | `src/app/(public)/page.tsx`, `src/app/(public)/people/page.tsx`, `src/content/seed/people-demo.ts` |
| Demo reintroduced in the dirty tree | `src/content/seed/people.ts`, `src/content/seed/demo-roster.ts`, `src/app/(public)/page.tsx` |
| Search uses seed | `src/components/search/SearchOverlay.tsx`, `src/components/search/SearchPanel.tsx` |
| Health disclosure | `src/app/api/cms/health/route.ts` |
| HTML allowlist | `src/components/ui/RichText.tsx` |
| Uncommitted JSON-LD | `src/components/seo/SiteJsonLd.tsx` |
| Security tests | `scripts/security-regression.mts` |
| Stale docs | `docs/BKSR_CURRENT_SYSTEM_HANDOVER.md`, `docs/BKSR_PRODUCTION_DOMAIN_AUDIT.md`, `docs/BKSR_P0_REMEDIATION_REPORT.md` |

---

## 20. Unverified assumptions and blockers

| Item | Label |
|---|---|
| Official Vercel production deployment id, timestamp, and dashboard SHA | **BLOCKED** |
| GitHub deployment records | **BLOCKED** (API rate limit) |
| Exact Production env var screen | **BLOCKED**. Localhost canonical is measured from public HTML, not from the dashboard. |
| Admin OTP, signed cookie, logout | **BLOCKED** |
| `devOtp` absent from a live login response | **BLOCKED** (not requested). Source on `main` still has the field. |
| bcrypt on live accounts | **BLOCKED** |
| Production fail-closed when admin env is removed | **BLOCKED** |
| Mongo staging cutover | **BLOCKED** / not done |
| Google Search Console | **BLOCKED** |
| Every inner publication/notice/event detail page | Not all opened. Sample routes in section 6 were. |
| Clean `f2e2036` build in this session | **Not re-run.** Dirty-tree build **FAILED**. |

Assumption used on purpose: live demo names plus testimonials mean production is not running `f2e2036`, because that commit removes those render paths. That does not require the Vercel SHA.

---

## Documentation that no longer matches the code or the live site

| Document | What is stale |
|---|---|
| `docs/BKSR_CURRENT_SYSTEM_HANDOVER.md` (19 Sep 2026) | Says pre-production, no sitemap, no tests, production target `bksr.vercel.app`, SEO without sitemap. Live www exists, robots/sitemap return 200, `scripts/security-regression.mts` exists on the security branch. |
| `docs/BKSR_PRODUCTION_DOMAIN_AUDIT.md` (26 Sep 2026) | Says live commit `eb0d973` and robots/sitemap **404**. Live now serves robots and sitemap (wrong host) and the public HTML matches `3d206ec` features (demo people still present, robots present). |
| `docs/BKSR_P0_REMEDIATION_REPORT.md` | Marks the security fixes as implemented. That is true of `f2e2036` and false of `origin/main` and of the live site’s demo people and testimonials. |
| `docs/BKSR_SECURITY_SEO_RELEASE_CHECKLIST.md` | Still directionally right: merge and production verify were **not** done. Preview pass was reported by the operator and was **not** re-checked here. |

---

## 12b. Status matrix

| Area | Current state | Evidence | Local | Production | Remaining | Priority |
|---|---|---|---|---|---|---|
| Frontend | Public routes respond | Section 6 | Dirty tree does not build | LIVE VERIFIED 200s | Fix typecheck before any new deploy | P1 |
| Research / publications | Listings and DOI text exist | `/research` contains `doi.org` | Security test for external URL helper passed on dirty tree | LIVE VERIFIED listing only | Detail-page click-through not re-tested | P2 |
| CMS / admin | UI and APIs exist | Source | Not logged in | Shell 200; CRUD **BLOCKED** | Authorized OTP test after clean deploy | P0 verify |
| Security | Patch written, not live | Section 5 | Tests 8/8 on dirty tree | Demo profiles **FAILED**; private inbox 401 matches older `main` gate | Deploy `f2e2036` | P0 |
| Member authentication | FS store, bcrypt only on security commit | `server-store.ts`, `password.ts` | Not logged in | **BLOCKED** | Do not flip `AUTH_DRIVER` | P0 code is unreleased |
| CMS persistence | Code supports fs and mongo | `getCmsDriver` | Local env `CMS_DRIVER=mongo` | Live health `driver: fs` | No cutover | P0 do not switch |
| Auth persistence | FS default, Mongo scaffold | `mongo-store.ts` | `AUTH_DRIVER` unset | Not shown by health | Staging drill later | P1 later |
| MongoDB migration | Not ready | Section 9 | Not run | Not active | Backup, indexes, rollback | Not next |
| SEO | Robots/sitemap exist; host is wrong | Section 11 | Uncommitted JSON-LD/favicon | LIVE VERIFIED localhost canonical | Fix env + deploy, then GSC | P0 |
| Search | Seed-backed client search | `useSeed: true` | STATICALLY VERIFIED | `/search` 200; data source not the live CMS | CMS-backed search later | P2 |
| Media | Cloudinary configured on live health | Health JSON | Upload not tested | **BLOCKED** | — | P2 |
| Email | Resend configured flag true on live health | Health JSON | Not sent | **BLOCKED** | — | P2 |
| Join / apply | Page 200; applications API 401 | Live GET | Not submitted | LIVE VERIFIED no public read | Do not submit a fake application | — |
| Production deployment | www is live; security SHA is not | Sections 4–5 | — | Behavior ≠ `f2e2036` | Clean merge and deploy | P0 |
| Content authenticity | Demo people and placeholder quotes are public | Live HTML and Carlos URL | Dirty tree would publish them again via seed | **FAILED** | Remove on the deployed commit and keep them out of the dirty tree | P0 |
| Testing | Security tests pass; build fails on dirty tree | Section 14 | LOCALLY VERIFIED | Not a production test run | Fix `what-we-do` types before building this tree | P1 |
