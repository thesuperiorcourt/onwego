# PRODUCTION — what's missing before this can be a real product

A gap analysis for On We Go, written after reviewing the Joie roadmap and developer instructions. Joie is a different product with different values; this borrows its *structure* and its discipline, not its answers.

Nothing here is urgent today. The order of work is still: sign-in works → engine bugs → QA → interface. This document exists so that none of it is a surprise later, and so the decisions that are hard to reverse get made deliberately rather than by accident.

---

## Conventions worth adopting now

Three habits from the Joie documents that cost nothing and save a lot:

**Settled decisions block.** A short list at the top of the handoff of things that are decided and shouldn't be relitigated each session — display name, bundle ID, repo, stack. Ambiguity here wastes real time.

**One-way doors vs two-way doors.** Spend design effort where a decision is expensive to reverse; defer anything that's a routine change later. Adding a field is a two-way door. A bundle identifier, a data model, or storing media inside the database is a one-way door. *Think ahead; don't build ahead.*

**Roadmap authority.** When a plan and the code disagree: preserve user data first, preserve working functionality second, take the least disruptive path third, and weigh the tradeoff before any large architectural change.

---

## The one-way doors, in priority order

### 1. The data model is a single JSON document per user

Every world, task, log entry and loot drop lives in one `jsonb` blob in `app_state`. At seventy tasks this is fine and pleasantly simple. It will not hold at years of history: every save rewrites everything, every sync moves the whole document, and two devices editing different worlds still conflict at the document level.

**Decide before there's real user data:** stay document-shaped (simple, cheap, fine for a personal-scale app) or move to rows per task and per log (needed for search, partial sync, and history at scale). Migrating later is possible but costs a data migration on live accounts.

*Leaning:* stay document-shaped through TestFlight, revisit before public launch. The threshold to watch is the size of a single user's document — when it approaches a megabyte, the decision has been made for you.

### 2. Proof-of-work media

The proof mechanic in `BRAINSTORM.md` is the most exciting idea in the product and the most expensive one. Photos and screenshots mean:

- a storage provider and a monthly bill that scales with users
- retention rules, deletion on request, and export including media
- a privacy policy that describes image storage honestly
- moderation exposure if anything is ever shared
- backup and sync payloads that are no longer trivially small

**Decide early:** is proof *stored*, or *verified and discarded*? Discarding is dramatically cheaper and better for privacy: check that a photo was taken, record that the check passed, keep nothing. Storing enables a memory-lane style reward surface later. Don't build the storing version by accident.

**Never store media in the database.** That's the classic one-way door.

### 3. Bundle identifier

Permanent once submitted to the App Store, and the app name is still in flux. A neutral identifier ages better than a branded one. See `NAMING.md`.

### 4. Payment provider

If the app is distributed through the App Store and sells anything that unlocks in-app functionality, Apple's in-app purchase is required — a web Stripe checkout is not a workaround. Stripe is only relevant for a web-only tier.

**Implication for pricing:** Apple takes a cut (reduced for small businesses, which this qualifies as). Design pricing around that from the start rather than discovering it after setting a price.

---

## Legal, compliance and business

None of this exists yet. All of it is required for a public App Store release.

| Item | Status | Notes |
|---|---|---|
| Privacy Policy | missing | Must be a public URL before submission. Must describe: what's collected, why, where it's stored, every third party, analytics, subscriptions, export, deletion, GDPR and CCPA rights, and a contact address |
| Terms of Service | missing | Public URL |
| Subscription terms | missing | Required once anything is sold |
| Refund and cancellation policy | missing | Apple handles refunds, but the policy still has to say so |
| Business entity | unknown | Joie's roadmap treats an LLC as a launch prerequisite; worth the same consideration here |
| Support email | missing | App Store requires a support URL or address |
| Privacy request contact | missing | Required by GDPR/CCPA |
| Data export | **exists** | Backups → download a copy |
| **Data deletion** | **built** | Settings → Account → Delete account. Erases the cloud copy always; erases the login itself once `NEON_API_KEY`/`NEON_PROJECT_ID`/`NEON_BRANCH_ID` are set — see "How to fix the five gaps" §1 |

**The deletion gap is the one to fix soonest.** It's a legal requirement, it's an App Store review item, and it's also just correct: someone who signs up should be able to leave completely. It needs a Settings action, a function endpoint that deletes their rows, and a note in the privacy policy.

---

## Third-party services inventory

Required by every serious privacy policy, and useful for spotting hidden dependencies. Current state:

| Provider | Role | Personal data? | Stores user content? | Core dependency? |
|---|---|---|---|---|
| Netlify | Hosting, serverless functions | IP addresses in logs | No | Yes |
| Neon | Postgres database | Yes | **Yes** | Yes |
| Neon Managed Better Auth | Accounts, sessions | Yes — email, name | No | Yes |
| Google OAuth | Sign-in option | Yes | No | No, optional path |
| Apple | Distribution, in-app purchase | Yes, at their end | No | Yes, for iOS |
| Sentry | Error monitoring (errors and stack traces only) | IP addresses, if not scrubbed at the Sentry project level | No | No — degrades to function logs if unset |

**esm.sh and Google Fonts are gone from this list — fixed.** Both used to be contacted by every user's browser on every visit. The auth SDK is vendored into `www/vendor/` (see its README there for how it was pulled and how to update the pinned version) and the two font families are self-hosted from `www/fonts/`. Neither is contacted anymore; nothing in this table needs updating for either.

---

## Security

| Item | Status |
|---|---|
| Encryption in transit | Yes, HTTPS throughout |
| Encryption at rest | Yes, provider-managed |
| Secure authentication | Yes — token verified against published keys on every request |
| Per-user isolation in the API | Yes, and tested |
| **Row-level security actually enforced** | **Yes**, as of 2026-08-19. `DATABASE_URL` connects as `onwego_api`, a restricted role created by `db/rls_role.sql`; `netlify/functions/sync.mjs` scopes every query to `app.user_id` inside a transaction, which is what lets the policies in `db/schema.sql` actually fire. Verified live against production. See HANDOFF.md's RLS item |
| Rate limiting | None. The sync endpoint is open to anyone with a valid token, and sign-up is open to anyone at all |
| Abuse controls on signup | None. `ALLOW_EMAILS` is the current blunt instrument |
| Error monitoring | **Built.** Client-side JS errors and the sync function's own failures both funnel to Sentry, if `SENTRY_DSN` is set — see "How to fix the five gaps" §2 |
| Optional passcode or biometric lock | Not applicable yet; worth considering once the app holds proof-of-work photos |

---

## Subscription design

A sketch, not a decision. Two principles first, both borrowed and both right:

**Premium should expand the experience, never restrict the core.** A free user should never feel punished.

**Changing subscription state must never destroy or hide data.** If someone lapses, their history stays visible; only new premium-only creation is restricted.

For a gamified productivity app specifically, there's a third principle worth adding: **don't paywall progression.** Locking a skill tree behind money turns earned achievement into a purchase, which poisons the exact thing that makes the app work. Sell cosmetics, capacity and convenience — not advancement.

| Free | Premium |
|---|---|
| Unlimited worlds, tasks and tracks | Full theme library and cosmetic unlocks |
| The whole logging loop, streaks, XP, levels | Proof-of-work media storage, if proof is stored |
| Garden, milestones, biomes | Advanced automation and quality-of-life |
| Cloud sync and backups | Recaps, history views, deeper stats |
| Export | |
| A small set of themes | |

Sync belongs on the free side. An app that forgets your work unless you pay is not trustworthy, and trust is the whole basis of a productivity tool.

**Build the plumbing before the paywall:** a single entitlement matrix as the source of truth, and environment flags (`ENABLE_PAYWALL`, `PREVIEW_MODE`) so everything stays unlocked in development and TestFlight without deleting the subscription logic.

---

## Operations

- **Monitoring and alerts** — nothing exists. At minimum: know when a deploy fails and when the sync function starts erroring.
- **Environment management** — currently three variables in Netlify. Document what each is for, and keep production and preview separate once there's real data.
- **Backup verification** — backups exist; restoring from them has been tested locally but never from the cloud path. An untested restore is not a backup.
- **Recovery procedures** — write down what to do when the database is unreachable, a bad deploy ships, or a user reports lost data.

---

## Quality gaps not yet covered

- **Responsive QA at small widths and large text.** Contrast and structure are verified; real-device testing at 320px and 200% Dynamic Type is not.
- **Localization.** Every user-facing string is currently inline. Separating strings from logic is nearly free during the module split described in `HANDOFF.md`, and expensive afterwards. English-only at launch is fine; making it *impossible* to translate is not.
- **Performance with years of history.** Timeline renders every task in the campaign. At seventy that's fine; at two thousand it isn't. Needs virtualisation or paging eventually.
- **Onboarding.** Still the largest product gap for anyone who isn't the owner.


---

## How to fix the five gaps

Concrete enough to hand to whoever picks up the work. None of these is built yet — this document and the others are the only things that changed in the repo so far.

### 1. Account deletion *(built)*

**Server:** `DELETE /api/sync` in `netlify/functions/sync.mjs` erases `app_snapshot` then `app_state` for the verified user, then calls `deleteAuthUser()`, which removes the login itself via Neon's project API (`DELETE .../auth/users/{id}`, a Neon API key, project id and branch id — not Better Auth's own client-side self-delete, which needs an email-verification round trip this app doesn't wire up). Data is always erased; the login-removal step degrades honestly if unconfigured, reporting `account:false` with a reason instead of pretending success.

**Still needed to finish this live:** three Netlify env vars — `NEON_API_KEY` (Neon Console → account/org → API Keys), `NEON_PROJECT_ID` and `NEON_BRANCH_ID` (Neon Console → project settings / branches). Without them, deletion still removes every row for the account; it just can't remove the login itself yet.

**Client:** Settings → Account, below sign-out. Two-tap `#ac_delete` (same arm-then-confirm pattern as task and track deletion), with `#ac_export` offered first. Copy is explicit that an offline device is untouched.

**Test:** `test/sync_server_test.cjs` — two-account isolation (delete one, the other's rows survive), the honest "not configured" path, and a stubbed `__onwegoAuthDelete` proving the right Neon endpoint and API key get used once configured. `test/account_test.cjs` covers the client-side two-tap flow. Not yet verified against the real Neon API — deliberately, since testing delete against a live account is destructive; do that with a throwaway account once the env vars are set.

### 2. Error monitoring *(built)*

**What shipped:** `netlify/functions/error.mjs` — an unauthenticated `POST /api/error` endpoint the client posts a JS error's `message`/`stack` to (deliberately unauthenticated, since a signed-out session can break too). A global `window.onerror`/`unhandledrejection` handler in `www/index.html` calls it, capped at 20 reports per page load and de-duplicated so a looping failure can't spam it. `netlify/functions/sync.mjs`'s own catch-all does the same for server-side failures. Both funnel through the shared `netlify/functions/lib/report.mjs`, which forwards a minimal Sentry envelope if `SENTRY_DSN` is set, or falls back to `console.error` (visible in Netlify's function logs) if it isn't — so there's a record either way.

**Still needed to reach Sentry specifically:** a `SENTRY_DSN` env var in Netlify — sign up for Sentry's free tier, create a project, copy its DSN. Until then, reports land in Netlify's function logs, which is a real (if less convenient) monitoring path on its own.

**Deploy failures:** Netlify already emails on failed deploys — confirm that's turned on in the site's notification settings; not something a function can wire up.

**Care taken:** the payload is capped (message 500 chars, stack 2000) and is never anything but the error's own message/stack/location — no task titles, no journal-style fields, no email addresses, no app state. `test/error_report_test.cjs` asserts the Sentry payload has exactly four fields and nothing else.

### 3. Self-host the fonts and the auth SDK *(built)*

**Fonts:** the exact woff2 files Google was serving for this app's font query, downloaded byte-identical into `www/fonts/`, with `@font-face` rules replacing the Google Fonts `<link>` tags — same variable-font axes (`SOFT`, `WONK`, `opsz`) the CSS already uses via `font-variation-settings`, so nothing about how the type renders changed. See `www/fonts/README.md` for the source and how to pick up a new Google Fonts version later.

**Auth SDK:** vendored into `www/vendor/` from esm.sh's bundled build (`?bundle`, which collapses the whole dependency graph into one file plus four small Node-shim polyfills the library references even in browser code). Each shim's absolute `/node/...` import was rewritten to a relative `./...` path so they resolve locally instead of against esm.sh's domain. Pinned at `@neondatabase/neon-js@0.7.0-beta` — see `www/vendor/README.md` for the exact fetch and how to move to a newer version deliberately, rather than a CDN resolving "latest" out from under a pin.

**Bonus, confirmed:** both changes were verified in a real browser, not just the test suite — zero requests to `esm.sh` or Google on page load, fonts render identically, and the vendored SDK produces a fully working auth client (`getSession`, `signIn.social`, `emailOtp.sendVerificationOtp` all present). The iOS build is now genuinely offline-capable on first run, which it wasn't before.

### 4. The data model

**Not a fix — a decision.** Watch one number: the byte size of a single user's `data` column.

```sql
select user_id, pg_column_size(data) as bytes from app_state order by bytes desc;
```

Under a few hundred kilobytes, the document model is fine and simpler than the alternative. As it approaches a megabyte, every save and every sync is moving that much data, and the decision has been made for you.

**If it needs to move**, the shape is: keep `app_state` for settings and world configuration, and split tasks and log entries into their own tables keyed by user and world. Do it before there are other people's accounts to migrate, not after.

### 5. Proof-of-work media

**The decision comes before any code.** Two designs:

*Verify and discard.* The user takes a photo or screenshot; the app confirms one exists, records that the check passed, and keeps nothing. No storage bill, no retention policy, no deletion obligation, nothing to leak. The mechanic works — the friction of having to actually do it is the point, not the artefact.

*Store it.* Enables a memory-lane surface, a visible history of proof, and possibly social features later. Costs: object storage, a bill that grows per user forever, retention rules, deletion on request, media in exports, moderation exposure, and much heavier backups.

**Recommendation: build verify-and-discard first.** It's a fraction of the work, it tests whether the mechanic actually motivates anyone, and it leaves the door open. Storing can be added later; un-storing other people's photos cannot.

**If it's stored anyway:** object storage (not the database), user-scoped paths, signed short-lived URLs, deletion wired into account deletion, and media included in export.

---

## Suggested sequence

1. **Now:** finish sign-in, fix the engine bugs, QA the feature set.
2. **Before TestFlight:** ~~account deletion~~ (built, needs three env vars to finish), ~~error monitoring~~ (built, needs `SENTRY_DSN` to reach Sentry specifically), arm row-level security, ~~self-host the fonts and SDK~~ (done).
3. **Before public launch:** legal documents and URLs, business and support contacts, third-party inventory published in the privacy policy, entitlement matrix and paywall flags, onboarding, responsive and Dynamic Type QA.
4. **Decide deliberately, not by drift:** the data model, whether proof is stored, and the bundle identifier.
