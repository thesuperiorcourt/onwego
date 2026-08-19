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
| **Data deletion** | **missing** | Required. There is currently no way for a user to delete their account and data. This is a real gap, not paperwork |

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
| **esm.sh** | Serves the auth SDK to browsers | Users' IPs, on every load | No | **Yes, at runtime** |
| **Google Fonts** | Serves fonts to browsers | Users' IPs, on every load | No | Effectively yes |

**Two of these deserve attention.** `esm.sh` and Google Fonts are third parties that every user's browser contacts on every visit. That means a privacy disclosure, and — more practically — two external points of failure for an app that otherwise has none. Both are trivially fixable: vendor the auth SDK into `www/`, and self-host the two font families. Worth doing before launch, and it also improves load time in the native shell.

---

## Security

| Item | Status |
|---|---|
| Encryption in transit | Yes, HTTPS throughout |
| Encryption at rest | Yes, provider-managed |
| Secure authentication | Yes — token verified against published keys on every request |
| Per-user isolation in the API | Yes, and tested |
| **Row-level security actually enforced** | **No** — the database role bypasses RLS. The policies exist but don't apply. Fix by creating a non-owner role and repointing `DATABASE_URL` |
| Rate limiting | None. The sync endpoint is open to anyone with a valid token, and sign-up is open to anyone at all |
| Abuse controls on signup | None. `ALLOW_EMAILS` is the current blunt instrument |
| Error monitoring | **None.** Nothing reports a broken deploy or a failing function. This is the biggest operational gap |
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
| Grove, milestones, biomes | Advanced automation and quality-of-life |
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
- **Performance with years of history.** The Trail renders every task in the campaign. At seventy that's fine; at two thousand it isn't. Needs virtualisation or paging eventually.
- **Onboarding.** Still the largest product gap for anyone who isn't the owner.


---

## How to fix the five gaps

Concrete enough to hand to whoever picks up the work. None of these is built yet — this document and the others are the only things that changed in the repo so far.

### 1. Account deletion *(smallest, do first)*

**Server:** add `DELETE` handling to `netlify/functions/sync.mjs`. It already identifies the user from the verified token, so the work is two statements — delete from `app_snapshot`, delete from `app_state` — plus a call to the auth service to remove the account itself.

**Client:** a row in Settings → Account, below sign-out. Two-tap confirm, matching the pattern already used for deleting tasks and restoring backups. Offer the export first: "download a copy before you go" is both kind and the thing regulators expect.

**Copy to be honest about:** deleting the account removes the cloud copy and the account. It does not reach into a device that's offline. Say so.

**Test:** create a second account, write data, delete it, confirm the rows are gone and the first account is untouched. Extend `test/sync_server_test.cjs`, which already has the two-account fixture.

### 2. Error monitoring

**What's needed:** know when a deploy fails, when the sync function throws, and when a client-side error breaks a screen.

**Cheapest useful version:** a free-tier error reporter (Sentry is the obvious one) with two integrations — one in the function's catch blocks, one global handler in the client. Netlify already emails on failed deploys; turn that on if it isn't.

**Care needed:** never send user content to a monitoring service. Error messages and stack traces only — no task titles, no journal-style fields, no email addresses. This is a privacy commitment the policy will have to describe.

### 3. Self-host the fonts and the auth SDK

**Fonts:** download the two families, put the woff2 files in `www/fonts/`, replace the Google Fonts link with `@font-face` rules. Faster, works offline in the native shell, and removes a third party from every page load.

**Auth SDK:** currently imported from `esm.sh` at runtime. Vendor the module into `www/vendor/` and import it relatively. Pin the version — a CDN that resolves "latest" is how the earlier dependency outage happened.

**Bonus:** both changes make the iOS build genuinely offline-capable, which it currently isn't on first run.

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
2. **Before TestFlight:** account deletion, error monitoring, arm row-level security, self-host the fonts and SDK.
3. **Before public launch:** legal documents and URLs, business and support contacts, third-party inventory published in the privacy policy, entitlement matrix and paywall flags, onboarding, responsive and Dynamic Type QA.
4. **Decide deliberately, not by drift:** the data model, whether proof is stored, and the bundle identifier.
