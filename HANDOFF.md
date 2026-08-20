# On We Go — handoff

Everything a fresh session needs to keep building this. Written for whoever picks up the work in the local clone.

**Read `VISION.md` before anything else.** It's the product vision (v3) — a real project-management layer whose real work powers a deep management game, not a task list with XP bolted on. Everything in the current prototype can change to serve it; §40–41 spell out exactly what to keep and what to replace. `BRAINSTORM.md` points to it too, but the settled decisions and open items below should be read in its light, not independently of it.

## Settled decisions

Decided; don't relitigate without a reason.

| | |
|---|---|
| Display name | On We Go (likely to change before launch — see `NAMING.md`) |
| Slug | `onwego` — storage keys, repo, site |
| Stack | Static client on Netlify, serverless functions, Neon Postgres, Neon Managed Better Auth. See `STACK.md` |
| Not using | Expo (Capacitor is already in place) and Railway (Netlify hosts the API) — reasoning in `STACK.md` |
| Client | Plain HTML/CSS/JS, no build step |
| Distribution | iOS via Capacitor and TestFlight first; web stays live |
| Source control | GitHub, `thesuperiorcourt/onwego` |

## Working principle: one-way doors vs two-way doors

Spend design effort where a decision is hard to reverse — the data model, the bundle identifier, whether proof-of-work photos are stored. Defer anything that's a routine change later — adding a field, swapping a provider. Think ahead; don't build ahead. The current one-way doors are listed in `PRODUCTION.md`.

## Working principle: taxonomy before features

This app has a lot of interconnected moving parts — task types, dates, tracks, rewards, screens — and the failure mode isn't building the wrong feature, it's letting categories accrete ad hoc: a field added here, a near-duplicate concept named differently there, until nothing has one clear name or one clear place. Before adding something that introduces a new category — a project type, a reward kind, a field, a screen — place it deliberately first: what's the full set it belongs to, what already exists that's adjacent to it, does the name hold up outside a reading context. `PARTS.md` and `BRAINSTORM.md` exist to make this possible; keep both current as the shape of things changes, not only when a chunk of work finishes.

One live example: **"counting" is one project type among several, not the only one.** A plain checklist with no running total is at least as common as a countable project and needs to be first-class, not a fallback. See `BRAINSTORM.md` §3.

---

## What this is

**On We Go is a general-purpose, customisable, gamified productivity app.** That is the product, and it is what ships publicly. Anything with parts, amounts and a deadline belongs here: a course, a training block, a house renovation, a job hunt, a dissertation, a season of a show, a reading campaign.

The design brief, in the owner's words: the customisation and gamification of Ulives, the look of Fabulous merged with Sprout and Flora, **artsy and gamelike, not a checklist**. Guard that. It is very easy to "improve" this into a to-do app; don't.

Live at a Netlify site, repo `onwego`, database and auth on Neon.

### About the reading data — read this before you touch anything

The app currently boots with a 69-day Sarah J. Maas reading campaign (Kingdom of Ash → Crescent City, ending 27 Oct 2026). **That is seed content, not the product.** It exists because a real, specific, emotionally-loaded use case is the only honest way to test whether the mechanics actually work — abstract sample data would have hidden every problem worth finding.

Three consequences for anyone working on this:

1. **Nothing reading-specific may be hardcoded into the engine.** Books, chapters and spoilers are *data*, not concepts the code knows about. If you find yourself writing `if (book)` or naming a variable `chapter`, stop — the generic term is a **unit**, and its label is user-supplied. The same applies to copy: strings the user reads should say "sessions" and "amounts", not "chapters" and "pages". A few pieces of shipped seed data legitimately say "Ch. 63–67" because that is what the owner typed; the engine around them must not care.
2. **Before public launch, the Maas campaign comes out** and is replaced with generic starter content — a couple of neutral example worlds, or an empty state with a good "build your first world" flow. Treat `MAASVERSE_CAMPAIGN` as removable at any time. Anything that breaks when it is deleted is a bug in your layering, not a reason to keep it.
3. **The owner keeps the Maas world on her own account.** It is a live use case she is genuinely running, and it stays useful for testing. So: remove it from the *default seed* for new accounts, don't write a migration that deletes it from existing data.

The generic-first test to apply to every change: *would this feature make sense to someone tracking a marathon plan, or a thesis, or a kitchen remodel?* If it only makes sense for books, it is either seed data or it is wrong.

---

## The other documents

| File | What it holds |
|---|---|
| `PARTS.md` | Every part of the app, what it's for, what it touches, and its status. Use the part IDs when flagging or assigning work |
| `CHANGELOG.md` | Resolved work, newest first. Things move here once they're done so this file doesn't accumulate stale checkmarks |
| `BRAINSTORM.md` | Direction and ideas by category — gamification, project model, UI, production readiness, naming, platform. Nothing here is decided until it moves into this file |
| `NAMING.md` | Every place the app name lives, and the checklist for renaming it safely |
| `PRODUCTION.md` | What's missing before this can be a real product: legal, security, subscriptions, operations, the decisions that are expensive to reverse, and how to fix the five biggest gaps |
| `STACK.md` | Every service, what it's for, what it costs, and what was deliberately left out |
| `COSTS.md` | The money-and-legal non-negotiable (#8 below) — warn before building anything with a real or scaling cost |
| `FAQ.md` | Questions a user (or the owner, standing in for one) would actually ask, organized by category — will eventually live in the app's own Settings |
| `README.md` | What the app is, how to deploy it, how the systems work |
| `PUBLISH-FROM-IPHONE.md` | The same setup as `README.md`, walked through entirely on a phone — no Mac needed until TestFlight |

### Keeping the docs themselves from going stale

Two speeds, not one fixed cadence — a full re-read of every doc every session doesn't scale as they grow (`VISION.md` alone is ~5,000 lines), and a fixed calendar interval doesn't match how bursty this project's work actually is.

- **Lightweight, at the start of any new work phase** (picking back up after a gap, or before a new initiative): a quick grep sweep for known drift patterns — stale file paths (`www/index.html` claims that predate the module split, that kind of thing), dead dependency names, suite/file counts, "built but needs X" phrasing for things that are actually done. This is what caught tonight's drift in `NAMING.md`, `PRODUCTION.md`, `README.md` and `test/README.md` — cheap, and it works.
- **Deeper, less often**: whenever a structural change ships (a rename, a module split, a big feature merge, a folded-together tab) — read the docs most coupled to exact file locations and counts (`HANDOFF.md`, `PARTS.md`, `NAMING.md`, `PRODUCTION.md`, `README.md`, `test/README.md`) fully, not just grep. The more narrative docs (`VISION.md`, `BRAINSTORM.md`, `STACK.md`, `COSTS.md`) drift less often since they're less tied to exact code locations, so they don't need the same frequency.
- **Revisit this cadence itself** once there's a few cycles of evidence on whether it's catching real problems or just busywork — don't treat this split as permanent on faith.

## Order of work

The owner's priority, in her words: **get the core app functional first, then go back and change the index.**

1. ~~Make sign-in and sync provably work~~ — done, both Google and email-code, see `CHANGELOG.md`.
2. ~~Fix what's broken in the engine~~ — `PARTS.md` defect K1 (missed days not visibly redistributing) fixed, see `CHANGELOG.md`.
3. ~~Before TestFlight, the short list at the end of `PRODUCTION.md`~~ — account deletion, error monitoring and row-level security are all done and verified live. See `CHANGELOG.md`.
4. **QA the whole feature set against real use** — the method is at the bottom of `PARTS.md`. The question is never "does it render", it's "what's the why, and does it hold when the user misses a day." Still open, ongoing.
5. **Then** the interface and product changes in `BRAINSTORM.md` and `VISION.md`.

Expect all of this to be iterative.

### Agreed sequencing (2026-08-20) — stick to this unless something logically has to jump the queue

1. **Launch content swap** — replace the Maas seed with generic starter content + real onboarding. Owner's own data is unaffected either way; see the "About the reading data" section above. In progress.
2. ~~Vocabulary pass~~ and ~~email-code + Safari sign-in verification~~ — both done alongside the content swap, see `CHANGELOG.md`. (Safari specifically stayed open — see "State of play".)
3. **Docs audit** — before touching `VISION.md`/`BRAINSTORM.md`, look over `NAMING.md`, `PARTS.md`, `PRODUCTION.md` and `README.md` for the same kind of staleness this file just had cleaned out of it, and catch anything from tonight's work that isn't reflected yet.
4. **Build `InformationArchitecture.md`** — work through whatever the docs audit turns up, plus all of `VISION.md` and `BRAINSTORM.md` together, and land the result here. This is the big one: the Tasks/Timeline duplication, the Tracks/Tasks separation proposal (rename Tasks→Tracks, Worlds→Portfolios, Tracks as VISION's "project" concept), task-type visual differentiation, and Tracks' own field complexity (where categories come from, "total to finish"/"counted as" needing a project/task "type" first) all go here rather than getting decided piecemeal. Update this file (`HANDOFF.md`) once it lands.
5. **Held until 3–4 are in a good-enough spot, not indefinitely**: Sign in with Apple (blocked on public App Store release anyway), theme pack re-colors (pure polish), TestFlight setup (do it sooner if the owner wants on-device testing before then — otherwise no urgency).

Also still open, no fixed slot: the broader "undo rewards" problem — reversing a *logged result* is solved (`unlogTask()`), but reversing rewards already *spent* (currency put toward a shop item) is a real, harder economy question, flagged for `VISION.md`/`BRAINSTORM.md` rather than solved now.

## Non-negotiables

0. **Generic first.** The engine knows about worlds, tasks, units, tracks and dates — never about books, chapters or any other single domain. Domain flavour lives in data and in what the user types.
1. **No build step.** The client is plain HTML, CSS and JS, loaded directly by the browser and bundled as-is into the iOS shell. No bundler, no framework, no JSX. If something seems to need a build, find another way — the auth SDK is vendored into `www/vendor/` for exactly this reason, not fetched from a CDN. This does **not** mean one enormous file — see "Layout".
2. **Local-first.** Every action saves to device storage immediately and works offline. Sync is how other devices find out, never a prerequisite. Signed out, the whole app must still work.
3. **WCAG 2.1 AA.** Already met and tested. Any new UI keeps it: one `h1` per screen, headings that don't skip, named controls, `aria-hidden` on decorative emoji, `role="list"` on unbulleted lists, 44px targets, colour never the only signal, dialogs with focus trap and Escape.
4. **Nothing punishes the user.** No red, no overdue, no streak reset on a missed day. Falling behind redistributes; it never scolds.
5. **Run the tests before saying something works.** `test/` has fifteen `.cjs` suites plus `a11y_contrast.py`, no framework — see `test/README.md`.
6. **No AI or agent language anywhere in the project.** Code comments, UI copy, docs and commit messages read as a team's work. That AI was used gets disclosed honestly elsewhere; it doesn't belong in the product's voice. Address whoever picks up a task as a colleague — a developer or designer on this team — not as a tool.
7. **`PARTS.md` updates in the same commit as the part it describes.** Every feature or functionality change — new, altered, or removed, BRAINSTORM work included — updates that part's row before the commit lands, not after. Cover what it does, where it lives, why it exists, when it changed, who asked for it (if that's not obvious), and how it works. See the taxonomy-before-features principle above: this is how that principle stays true instead of becoming a slogan.
8. **Warn before committing to a cost.** Money, a recurring or scaling bill, a legal obligation, or significant time/energy on something unproven — flag it, with what it costs now *and* at realistic future scale, before building it. See `COSTS.md`.

---

## Layout

The client is ES modules under `www/app/` — no build step, browsers load `<script type="module">` with relative imports natively, and both Netlify and Capacitor's WebView serve them fine. `www/index.html` is just the page shell now; find code by module, not by searching one giant file. One caveat: ES modules don't work over `file://` — local dev needs `netlify dev` or any static server, already the recommended workflow.

```
www/index.html               shell, meta, the <style> block
www/config.js                authUrl + apiBase, edited per deployment
www/fonts/                   self-hosted Figtree + Fraunces — see its README
www/vendor/                  self-hosted auth SDK — see its README
www/seed/campaign.js         MAASVERSE_CAMPAIGN — seed content only, deletable
www/app/main.js              boot, paint, view router
www/app/state.js             shared mutable App state (S, W, view, taskUI)
www/app/store.js             device storage, legacy keys
www/app/themes.js            THEMES — five theme packs, every colour token
www/app/engine.js            units, labels, bait bands, levels, loot
www/app/tasks.js             task model, filters, editor
www/app/tracks.js            anchors, ripple, projections, repeats, strain
www/app/scene.js             sceneSVG, floraSVG, motes
www/app/screens/tonight.js   Today screen (function names kept: renderTonight)
www/app/screens/trail.js     Timeline screen (renderTrail)
www/app/screens/hoard.js     Rewards screen (renderHoard — carries what used
                              to be the separate Garden screen)
www/app/ui.js                dialogs, toast, normalizeA11y
www/app/account.js           auth + sync (Account, Sync)
www/app/backups.js           snapshots, restore
netlify/functions/sync.mjs   authenticated sync + cloud snapshots + deletion
netlify/functions/error.mjs  client-side error reports → Sentry or logs
netlify/functions/lib/       shared helpers (report.mjs), not routes
netlify.toml                 publish=www, functions dir, NODE_VERSION=22
package.json                 @neondatabase/serverless, jose — both pinned exactly
db/schema.sql                app_state, app_snapshot, RLS policies
db/rls_role.sql              the restricted onwego_api role — already run
capacitor.config.json        for the iOS build
test/*.cjs                   the suites; test/a11y_contrast.py for colour
```

Screen and internal function names (`renderTonight`, `renderTrail`, `renderHoard`) are unchanged from before the tab rename — only the user-facing labels changed (Tonight→Today, Trail→Timeline, Hoard→Rewards). Don't let that mismatch surprise you when grepping.

---

## How the pieces fit

**Tasks are the data layer.** Everything is a task record; only `title` is required. The shipped campaign was migrated into 69 task records on first run. Today, Timeline and Rewards (which also carries what used to be the separate Garden screen) all read from tasks — edit a task and every screen follows.

**Today is assembled from sections** the user defines: categories, tags, scope, count, sort, and which fields appear per card. The first card of the first section is the hero and carries the `h1`. A Missed section sits ahead of Up next by default, surfacing anything unlogged and past its date — see PARTS.md T18.

**Tracks decide what a result changes.** A track owns categories and a total, with one anchor pinned:

- `anchor: 'deadline'` → the date holds, future amounts move
- `anchor: 'pace'` → the amount holds, the finish date moves
- `ripple: 'smooth' | 'consume' | 'fixed'` → how the difference lands

The three win buttons show their own consequence (`5.06/day left`, or a projected date). When a deadline track demands more per day than the user called comfortable, Today surfaces an honest warning with three ways out: move the finish (which *creates* the extra sessions), trim the scope, or leave it.

**Auth and sync.** The browser signs in against Neon Managed Better Auth (Google, or an emailed code) and holds a session token. Every `/api/sync` call carries it as a bearer token; the function verifies it against the auth service's JWKS and uses the `sub` claim — never the body — to scope every query. Optional `ALLOW_EMAILS` env var acts as an invite list.

---

## State of play

**Verified by tests:** campaign maths, task CRUD/search/filter, layout sections, all track anchors and ripple modes, the strain warning, repeats, device storage and snapshots, restore and undo, accessibility across every screen and sheet, contrast in all five packs, and the sync function's account isolation, staleness handling, allowlist and rejection paths.

**Verified live:** the full auth handshake and the RLS cutover — see `CHANGELOG.md` for what was checked and how.

Still not exercised: Safari specifically (checked in Chromium and confirmed working via email-code — see `CHANGELOG.md`). Blocked locally on an Xcode configuration issue that needs the owner's own `sudo` access (`xcode-select -s /Applications/Xcode.app/Contents/Developer`) to test via the iOS Simulator; testing in a real Safari browser directly would also close this. Worth a pass before a public launch, not blocking.

---

## Known open items

The full register lives in `PARTS.md` (with status per part) and `BRAINSTORM.md` (with direction). The items below are the ones that block or constrain other work.

- **Sign in with Apple** isn't offered by Neon (Google, GitHub, Vercel only). Only becomes a blocker for a public App Store release that also offers Google sign-in. TestFlight internal testing is unaffected.
- **TestFlight** is scaffolded but never run: `npx cap add ios && npx cap sync ios && npx cap open ios`. Before the first archive, set a real bundle ID in `capacitor.config.json`, register it in App Store Connect, and set `apiBase` in `www/config.js` to the deployed site URL — the native shell serves pages locally and can't resolve a same-origin API. Google's OAuth redirect will need a custom URL scheme registered in the iOS project.
- **Theme packs** were meant to match an app called Joie, which couldn't be found. The five shipped packs are stand-ins; the owner may want them re-coloured.
- **Launch content swap.** Before the app is public, replace the Maas seed with generic starter content and a first-run flow that helps someone build their own world from scratch. The onboarding is currently the weakest part of the product for anyone who isn't the owner: a new account inherits a stranger's reading campaign, which makes no sense. Needs: a short "what are you working toward?" setup, one or two neutral example worlds, and a genuinely good empty state.
- **Vocabulary pass.** Some user-facing copy still leans literary ("the hook", "bait", quest titles in the seed data). The mechanics are general; check the wording is too before launch.

---

## Working notes

- `normalizeA11y()` runs after every render and every sheet mount — new markup inherits list and group semantics without remembering to add them.
- Colour tokens are per-theme. Never hardcode a colour in a component; use `var(--glow-ink)` for accent *text* and `var(--glow)` for decorative fills. They differ deliberately — the light pack fails contrast otherwise.
- `test/a11y_contrast.py` parses `THEMES` out of `www/app/themes.js`, so it stays honest after edits.
- Prose in the UI is deadpan and specific, never chirpy. "Attention is garbage right now" is the register.
