# BKSR current production status — 28 September 2026

Read-only assessment. No application code, environment, data, or deployment was changed for this pass. The only file written is this report.

Checked at about 18:30 UTC+6 on 28 September 2026, from workspace `F:/Ratul/bk`.

Status labels used below: **LIVE VERIFIED**, **LOCALLY VERIFIED**, **STATICALLY VERIFIED**, **BLOCKED**, **NOT IMPLEMENTED**, **FAILED**.

---

## 1. Executive summary

GitHub `main` is still `3d206ec`. The security patch `f2e2036` was **not** merged into `main`.

The security branch **was** pushed. Its tip is now `eba89a4` (`security/bksr-production-hardening`), four commits ahead of `main`. Those later commits keep the security patch and then add BKSR in Media as its own collection, favicon/JSON-LD, a production localhost-URL guard, and a **public demo roster** (Carlos Ramirez and seven other fictional profiles, plus homepage quotes).

`https://www.bkschoolofresearch.org` is **not** serving `origin/main`. The live site has `www` canonical URLs, Organization JSON-LD, `icon-192`, a working `mediaClippings` API, and the public CMS gate (private collections return 401). That combination exists only on the security branch after `f2e2036`. The exact Vercel production deployment id and SHA are **BLOCKED** (Vercel access was not authorized; no deploy was triggered).

`https://bksr.vercel.app` is a **different, older** deployment: relative canonical `/`, no JSON-LD, and the “Attribution pending” testimonial line. It still returns HTTP 200.

CMS on the live site is the filesystem driver (`"driver":"fs"`), falling back to compiled seed when `.data/cms-database.json` is absent. Mongo is configured (`mongoConfigured: true`) and **not** the active driver. Auth Mongo remains a scaffold. `AUTH_DRIVER` is unset locally.

The public people API returns 9 published profiles, including the demo roster, and the JSON includes `email` and `verificationCode`. Values are not copied here.

`pnpm run test:security`, `lint`, `typecheck`, and `build` all exited 0 on this branch.

**Do not merge `eba89a4` to `main` as-is.** That tip puts fictional people back on the public site. **Do not flip `CMS_DRIVER` or `AUTH_DRIVER`.**

---

## 2. Current Git state

| Item | Evidence |
| --- | --- |
| Workspace branch | `security/bksr-production-hardening` |
| HEAD | `eba89a4f83aa12abf3c0136eecbae0a67a3ca37b` |
| Remote tracking | `origin/security/bksr-production-hardening` at the same SHA (in sync before this report edit) |
| `origin/main` and local `main` | `3d206ecead748b52e9e30367bc65922b5e426fba` |
| `f2e2036` ancestor of HEAD | yes |
| `f2e2036` ancestor of `origin/main` | **no** |
| Commits on this branch after `main` | 4 (`f2e2036`, `f6ed203`, `6f24ecf`, `eba89a4`) |
| Other worktree | `F:/Ratul/bk-security-release` at local merge `3062f87` (`release/bksr-security-seo`). That branch is **not** on `origin`. It merges only `f2e2036`, not `eba89a4`. |
| Working tree before this report | clean |

`eba89a4` vs `f2e2036` is 108 files, about +13826 / −1478. That delta is the media split, admin list/editor work, favicon, `SiteJsonLd`, the localhost canonical guard, and `src/content/seed/demo-roster.ts`.

---

## 3. Latest main commit

```
3d206ecead748b52e9e30367bc65922b5e426fba
updated the admin CMS research and publications
```

`main` does not contain HMAC admin sessions, bcrypt, the devOtp production gate, `mediaClippings`, or `SiteJsonLd`. It does contain an earlier, narrower CMS gate (`CMS_ADMIN_ONLY_COLLECTIONS`).

---

## 4. Actual Vercel production deployment

| Check | Result |
| --- | --- |
| Deployment id | **BLOCKED** |
| Production commit SHA | **BLOCKED** as an exact SHA |
| Timestamp, Ready state, Git branch in Vercel | **BLOCKED** |
| Custom domain behavior | **LIVE VERIFIED** — see fingerprint below |

Vercel MCP for this session needs authentication. This assessment did not log in and did not run a deploy.

**www fingerprint (LIVE VERIFIED), which `origin/main` cannot produce:**

- Canonical `https://www.bkschoolofresearch.org`
- `robots.txt` `Host: https://www.bkschoolofresearch.org`
- Sitemap: 139 `<loc>` entries, all on `www`, none on `localhost`
- Homepage contains `application/ld+json` and `icon-192`
- `GET /api/cms/mediaClippings?published=1` → **200**
- `GET /api/cms/health` → `driver: fs`, `mode: local-file`, `mongoConfigured: true`, `apiEnabled: true`

**`https://bksr.vercel.app/` (LIVE VERIFIED) does not match www:**

- HTTP 200, `X-Vercel-Cache: STALE` at check time
- Canonical `/` (relative)
- No JSON-LD, no `icon-192`
- Page still contains “Attribution pending”

Apex `https://bkschoolofresearch.org/` → **308** to `https://www.bkschoolofresearch.org/`.

So: **GitHub main ≠ www**. www matches the security-branch lineage after `f2e2036`. The legacy Vercel alias is an older public copy.

---

## 5. Security patch deployment status

| Question | Answer |
| --- | --- |
| Was `f2e2036` merged into `main`? | **No** |
| Is `f2e2036` on the pushed security branch? | **Yes**, as a parent of `eba89a4` |
| Is `main` pushed? | `origin/main` is `3d206ec`. Nothing newer was pushed to `main` |
| Are there newer commits after the security patch? | **Yes**, three commits on the security branch, pushed to `origin/security/bksr-production-hardening` |
| Is the open branch aligned with `origin/main`? | **No**. It matches `origin/security/...` |
| Are security changes on the Git production branch (`main`)? | **No** |
| Are those behaviors on www? | **Partly.** API gate and `www` canonical are live. Fictional people were put back and are live. |

---

## 6. Production smoke results

Non-destructive GETs only. No forms submitted.

| URL | Status | Notes |
| --- | --- | --- |
| `/` | 200 | Carlos Ramirez in HTML. JSON-LD and `icon-192` present. “Attribution pending” absent on www |
| `/about` `/research` `/publications` `/people` `/activities` `/news-events` `/contact` `/join` | 200 | |
| `/people/carlos-ramirez` | 200 | Indexable demo profile. Canonical is the www URL |
| `/login` | 200 | `robots`: **index, follow** |
| `/admin` | 200 | `robots`: **noindex, nofollow** |
| `/robots.txt` `/sitemap.xml` | 200 | www host, 139 URLs |
| `/api/cms/health` | 200 | `driver: fs` |
| `/api/cms/joinApplications` | 401 | |
| `/api/cms/registrationEntries` and `?published=1` | 401 | |
| `/api/cms/people` | 401 | |
| `/api/cms/people?published=1` | 200 | 9 items. Keys include `email` and `verificationCode`. Bodies not stored |
| `/api/cms/mediaClippings?published=1` | 200 | Collection exists on the deployed build |

Research cards were not clicked through. Code on this branch still prefers an external project URL (`test:security` covers that helper). A full click-through of every DOI link was not repeated in this pass.

---

## 7. CMS database status

| Name | Local `.env.local` | Production |
| --- | --- | --- |
| `CMS_DRIVER` | `mongo` | **Not the active driver.** Health reports `fs` |
| `NEXT_PUBLIC_CMS_MODE` | `mongo` | Not separately verified on the client |
| `MONGODB_URI` | set (value not recorded) | Health `mongoConfigured: true`. URI not read |
| `MONGODB_DB` | `bksr` | Not confirmed as the live database name |
| `AUTH_DRIVER` | **unset** | Not observable from the public health payload |

Active production CMS driver: **filesystem** (`src/lib/cms/server-repository.ts` uses Mongo only when `CMS_DRIVER=mongo` and `MONGODB_URI` are both set).

`src/lib/cms/fs-repository.ts` reads `.data/cms-database.json`. If that file is missing or unreadable, public reads return `getSeedDatabase()`. On Vercel that file is not a durable store, so **the compiled seed is the production content source** unless a file happens to exist on that instance.

Mongo repository code is present (`src/lib/cms/mongo-repository.ts`) and is what local `CMS_DRIVER=mongo` uses. It is not what www health reports.

---

## 8. Auth database status

`src/lib/auth/server-store.ts` uses Mongo only when `AUTH_DRIVER=mongo` and `MONGODB_URI` are set. Local `AUTH_DRIVER` is unset, so local auth is the file store (`.data/auth-store.json`).

`src/lib/auth/mongo-store.ts` states it is not activated by default and must not be switched on until migration work is approved. Account, session, OTP, and invitation persistence in that file are a scaffold.

Live auth storage driver: **BLOCKED** (no admin login was performed; health does not report `AUTH_DRIVER`).

---

## 9. Mongo migration readiness

| Check | State |
| --- | --- |
| CMS repository code | Present. **Not** the live driver |
| Auth repository | Scaffold. Comment in `mongo-store.ts` says it is not production-ready |
| CMS indexes | `src/lib/db/indexes.ts` has content indexes, including media clippings |
| Auth indexes (`auth_*`) | **NOT IMPLEMENTED** in `indexes.ts` |
| Migration / backup / rollback scripts | No approved production migration was found that should be run. None was executed |
| Staging migration tested | **BLOCKED** / not evidenced |
| Seed vs production data | Live public people (9, including demo ids from `demo-roster.ts`) match the **seed**, which is what the FS fallback serves |

**Auth Mongo is still not suitable for production.** CMS Mongo must not be turned on in production until backup, index, and rollback steps exist and a staging copy has been checked. This pass did not connect for writes.

---

## 10. Admin / CMS status

End-to-end admin login was **not** run (that would mutate session/OTP state). The matrix below is source inspection on `eba89a4` plus the public reads above.

| Workflow | State |
| --- | --- |
| Admin login + OTP routes | **STATICALLY VERIFIED** (`src/app/api/cms/session/`) |
| Dashboard, research, publications, people, homepage, news/events/notices, media library, join, registration forms | **STATICALLY VERIFIED** admin routes exist, including `/admin/bksr-in-media` |
| Public published rendering | **LIVE VERIFIED** for the routes in section 6 |
| Cache revalidation | **STATICALLY VERIFIED** in the FS writer. Not exercised |
| Production mutations | Not performed |

---

## 11. SEO completion matrix

| Item | State |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` locally | `http://localhost:3000` |
| Production canonical | **LIVE VERIFIED** `https://www.bkschoolofresearch.org` |
| Localhost guard | **STATICALLY VERIFIED** in `src/lib/seo/site-url.ts`: if `VERCEL_ENV=production` and the env URL is localhost, use `https://www.bkschoolofresearch.org` |
| `metadataBase` / absolute canonicals | **LIVE VERIFIED** on www homepage, login, and the Carlos profile |
| `robots.txt` | **LIVE VERIFIED**, Host is www |
| `sitemap.xml` | **LIVE VERIFIED**, 139 www URLs |
| Open Graph / Twitter | **STATICALLY VERIFIED** in `src/lib/seo/metadata.ts`. Not separately fetched from a social debugger |
| Public pages indexable | **LIVE VERIFIED** (`index, follow` on `/`) |
| Admin noindex | **LIVE VERIFIED** |
| Login / auth noindex | **FAILED** live. `/login` is `index, follow`. Child page metadata overrides the auth layout |
| Dynamic published URLs in sitemap | **LIVE VERIFIED** as a www sitemap. Whether every published CMS row is included was not diffed item-by-item |
| Apex → www | **LIVE VERIFIED** 308 |
| `bksr.vercel.app` duplicate | **FAILED** as a cleanup. Still HTTP 200 on an older build, indexable |
| Google Search Console / sitemap submission | **BLOCKED** (no Search Console access) |
| Organization + WebSite JSON-LD | **LIVE VERIFIED** on www (`SiteJsonLd`) |
| Breadcrumb schema | **NOT IMPLEMENTED** as a site-wide breadcrumb graph |
| Article/publication schema | **NOT IMPLEMENTED** as a dedicated Article/ScholarlyArticle graph on detail pages |

SEO is **not** complete.

---

## 12. Remaining security gaps

Evidence-backed. No penetration test was run.

| Item | State |
| --- | --- |
| Public collection allowlist | **LIVE VERIFIED** behavior: join, registration, and unpublished people are 401. Code: `src/lib/cms/public-read.ts` |
| Published-only public reads | **LIVE VERIFIED** for people |
| Join and registration not public | **LIVE VERIFIED** 401 |
| Production fail-closed if admin secrets are missing | **STATICALLY VERIFIED** on this branch. Live unset-env test **BLOCKED** |
| Signed admin session cookie | **STATICALLY VERIFIED** `src/lib/cms/admin-session.ts`. Live cookie **BLOCKED** (no login) |
| No `devOtp` in production responses | **STATICALLY VERIFIED** `src/lib/security/runtime.ts`. Live login **BLOCKED** |
| bcrypt + legacy rehash | **LOCALLY VERIFIED** (`test:security`, 2 password tests). Live upgrade **BLOCKED** |
| Fictional people removed | **FAILED** live and in current seed |
| Public people payload | **FAILED** as a data exposure. Published people JSON includes `email` and `verificationCode` |
| Rate limit on login, OTP, public forms | **NOT IMPLEMENTED** (no `rateLimit` / `csrf` usage under `src/`) |
| CSRF | **NOT IMPLEMENTED** in application code |
| Rich text sanitizer | **STATICALLY VERIFIED** regex allowlist in `src/components/ui/RichText.tsx` |
| Health endpoint | **LIVE VERIFIED** public GET discloses `driver`, `mongoConfigured`, `cloudinaryConfigured`, `resendConfigured` |
| Server-side validation | Present on CMS write paths in source. Not re-tested with writes |

---

## 13. Content and prototype status

| Item | State |
| --- | --- |
| Demo people | **LIVE.** `src/content/seed/people.ts` spreads `demoPeople`. Public API count is 9. `/people/carlos-ramirez` is 200 |
| Homepage quotes | Seeded from `demoResearcherQuotes` in `src/content/seed/demo-roster.ts`. www HTML includes Aisha Patel. The older “Attribution pending” line is on `bksr.vercel.app`, not on www |
| Bezon Kumar | In the authentic seed and on the public people payload |
| Prototype imagery | Demo portraits under `/media/prototype/` are still referenced by the demo roster |
| Search | **STATICALLY VERIFIED** `SearchOverlay` and `SearchPanel` call search with `useSeed: true`. Search does not read the live CMS |
| Empty publication shells | Not re-audited page by page in this pass |

`scripts/seed-demo-roster.mjs` is on this branch. It was not run.

---

## 14. Test / build results

Run on `eba89a4` in `F:/Ratul/bk`. Source was not edited to force a pass.

| Command | Exit | Result |
| --- | --- | --- |
| `pnpm run test:security` | 0 | 8 passed, 0 failed. Node warning: `MODULE_TYPELESS_PACKAGE_JSON` on `public-read.ts` |
| `pnpm run lint` | 0 | 0 errors, 24 warnings (`react-hooks/exhaustive-deps`, unused vars, one `jsx-a11y` on `ResearchAuthorsField`) |
| `pnpm run typecheck` | 0 | `tsc --noEmit` clean |
| `pnpm run build` | 0 | Next.js 16.3.3 compiled, TypeScript finished, static pages generated |

---

## 15. P0 / P1 / P2 backlog

**P0**

- Stop publishing the demo roster. `demo-roster.ts` is spread into public people and homepage quotes, and www already serves it.
- Stop returning `email` and `verificationCode` on public people reads.
- Do not merge `eba89a4` onto `main` until that roster is gone. A later deploy from today’s `main` (`3d206ec`) would also roll back the www canonical, JSON-LD, and `mediaClippings` behavior.
- `bksr.vercel.app` is a second public, indexable host on an older build.

**P1**

- `/login` is `index, follow`.
- Search still uses the seed index.
- Confirm the Vercel production SHA in the dashboard (blocked here).
- Rate limiting and CSRF are absent.
- Public `/api/cms/health` discloses integration flags.

**P2**

- Auth Mongo scaffold, missing auth indexes, no backup/rollback drill.
- CMS Mongo cutover. Local env already says `CMS_DRIVER=mongo`; production health still says `fs`.
- Breadcrumb and article structured data.
- Search Console after the duplicate host and demo profiles are gone.
- ESLint warnings (24).

---

## 16. Exact next recommended development phase

**Remove the public demo roster and the sensitive people fields, then make `main` match that cleaned tree.**

Why this is first:

- Final security verification (candidate A) is far enough along to see a live failure: fictional people and `verificationCode` are public. More dashboard confirmation does not fix that.
- Mongo migration (B) is blocked by an incomplete auth store, no auth indexes, FS-backed production, and no backup drill.
- Broader hardening (C), leftover SEO (D), and Search Console (E) depend on one public host and one truthful people directory.
- Search (F) still reads seed data; changing it before the seed is clean would index the demo roster.

---

## 17. Recommended implementation sequence

1. **Code:** delete the public demo roster and homepage demo quotes; strip `email` and `verificationCode` from public people responses. Do not switch drivers.
2. **Git:** put that cleaned tree on `main` (the security patch and the www canonical/JSON-LD/`mediaClippings` work included). Do not deploy `eba89a4` again unchanged.
3. **Dashboard:** confirm the production deployment SHA. Point `bksr.vercel.app` at www or stop serving it. Set production `NEXT_PUBLIC_SITE_URL` to `https://www.bkschoolofresearch.org` so the localhost guard is not the only protection.
4. **Authorized check:** log in once on a preview, confirm no `devOtp`, confirm admin cookie is signed, confirm Carlos returns 404.
5. **Then:** login `noindex`, Search Console sitemap submission, search against CMS data.
6. **Not yet:** `CMS_DRIVER=mongo` or `AUTH_DRIVER=mongo` in production.

---

## 18. Operator-required actions

- Open the Vercel project that owns `www.bkschoolofresearch.org` and record the production deployment id, SHA, and branch. This session could not.
- Do not promote `bksr.vercel.app`’s older deployment back onto www.
- After the demo roster is removed and `main` is the intended SHA, submit the www sitemap in Google Search Console.
- Do not change `CMS_DRIVER` or `AUTH_DRIVER` until a backup and rollback exist.

---

## 19. File references

- Public allowlist: `src/lib/cms/public-read.ts`
- CMS driver switch: `src/lib/cms/server-repository.ts`
- FS seed fallback: `src/lib/cms/fs-repository.ts` (`readDb` returns `getSeedDatabase()` when the file is missing)
- Auth Mongo scaffold: `src/lib/auth/mongo-store.ts`, `src/lib/auth/server-store.ts`
- Passwords: `src/lib/auth/password.ts`
- Sessions: `src/lib/cms/admin-session.ts`
- devOtp gate: `src/lib/security/runtime.ts`
- Canonical guard: `src/lib/seo/site-url.ts`
- JSON-LD: `src/components/seo/SiteJsonLd.tsx`, mounted from `src/app/layout.tsx`
- Demo roster: `src/content/seed/demo-roster.ts`, spread from `src/content/seed/people.ts` and `src/content/seed/homepage.ts`
- Search seed flag: `src/components/search/SearchOverlay.tsx`, `src/components/search/SearchPanel.tsx`
- Indexes: `src/lib/db/indexes.ts` (no `auth_` indexes)
- Security tests: `scripts/security-regression.mts`

Historical docs that no longer match the live site:

- `docs/BKSR_CURRENT_SYSTEM_HANDOVER.md` — pre-production handover.
- `docs/BKSR_PRODUCTION_DOMAIN_AUDIT.md` — described an older deploy and missing robots/sitemap. www now returns both, on the www host.
- `docs/BKSR_P0_REMEDIATION_REPORT.md` — describes `f2e2036` as the removal of demo people. Current branch tip and www put them back.
- `docs/BKSR_SECURITY_SEO_RELEASE_CHECKLIST.md` — merge-to-`main` and production SHA confirmation are still open.
- The copy of this status report that was committed inside `eba89a4` said www still looked like `3d206ec` with `localhost` canonicals. That fingerprint is stale. www has since served the later security-branch behavior. `bksr.vercel.app` still looks like the older build.

---

## 20. Unverified assumptions and blockers

- Exact Vercel production deployment id, SHA, timestamp, and Git branch: **BLOCKED**.
- Whether www is byte-for-byte `eba89a4` or another commit that contains the same features: **not proven**. It is proven not to be `3d206ec`.
- Admin HMAC cookie, production `devOtp` absence, bcrypt upgrade on a real login, and fail-closed boot without admin secrets: **BLOCKED** (no authenticated or destructive checks).
- Google Search Console property and sitemap submission: **BLOCKED**.
- Durable production CMS file contents vs pure seed fallback: health says `fs`. The 9 public people match the demo seed. A server-local `.data/cms-database.json` was not opened.
- `F:/Ratul/bk-security-release` (`3062f87`) is a local merge of `f2e2036` only. It is not on GitHub and is not the live site.
