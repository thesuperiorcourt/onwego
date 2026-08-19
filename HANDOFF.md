# On We Go — handoff

Everything a fresh session needs to keep building this. Written for whoever picks up the work in the local clone.

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
| `BRAINSTORM.md` | Direction and ideas by category — gamification, project model, UI, production readiness, naming, platform. Nothing here is decided until it moves into this file |
| `NAMING.md` | Every place the app name lives, and the checklist for renaming it safely |
| `PRODUCTION.md` | What's missing before this can be a real product: legal, security, subscriptions, operations, the decisions that are expensive to reverse, and how to fix the five biggest gaps |
| `STACK.md` | Every service, what it's for, what it costs, and what was deliberately left out |
| `README.md` | What the app is, how to deploy it, how the systems work |

## Order of work

The owner's priority, in her words: **get the core app functional first, then go back and change the index.**

1. **Make sign-in and sync provably work** (see "Do this first" below).
2. **Fix what's broken in the engine** — start with `PARTS.md` defect K1, missed days not visibly redistributing.
3. **QA the whole feature set against real use** — the method is at the bottom of `PARTS.md`. The question is never "does it render", it's "what's the why, and does it hold when the user misses a day."
4. **Then** the interface and product changes in `BRAINSTORM.md`.
5. **Before TestFlight**, the short list at the end of `PRODUCTION.md` — account deletion, error monitoring, arming row-level security, and self-hosting the fonts and auth SDK.

Expect all of this to be iterative. Set the work up so step 4 is cheap to repeat — which is what the next section is about.

## Non-negotiables

0. **Generic first.** The engine knows about worlds, tasks, units, tracks and dates — never about books, chapters or any other single domain. Domain flavour lives in data and in what the user types.
1. **No build step.** The client is plain HTML, CSS and JS, loaded directly by the browser and bundled as-is into the iOS shell. No bundler, no framework, no JSX. If something seems to need a build, find another way (the auth SDK is loaded as a browser module from a CDN for exactly this reason). This does **not** mean one enormous file — see "Setting up www for iteration".
2. **Local-first.** Every action saves to device storage immediately and works offline. Sync is how other devices find out, never a prerequisite. Signed out, the whole app must still work.
3. **WCAG 2.1 AA.** Already met and tested. Any new UI keeps it: one `h1` per screen, headings that don't skip, named controls, `aria-hidden` on decorative emoji, `role="list"` on unbulleted lists, 44px targets, colour never the only signal, dialogs with focus trap and Escape.
4. **Nothing punishes the user.** No red, no overdue, no streak reset on a missed day. Falling behind redistributes; it never scolds.
5. **Run the tests before saying something works.** `test/` has eleven suites, no framework.
6. **No AI or agent language anywhere in the project.** Code comments, UI copy, docs and commit messages read as a team's work. That AI was used gets disclosed honestly elsewhere; it doesn't belong in the product's voice. Address whoever picks up a task as a colleague — a developer or designer on this team — not as a tool.

---

## Layout

```
www/index.html               the whole app (~165 KB, one file)
www/config.js                authUrl + apiBase, edited per deployment
netlify/functions/sync.mjs   authenticated sync + cloud snapshots
netlify.toml                 publish=www, functions dir, NODE_VERSION=22
package.json                 @neondatabase/serverless, jose — both pinned exactly
db/schema.sql                app_state, app_snapshot, RLS policies (already run)
capacitor.config.json        for the iOS build
test/*.cjs                   the suites; test/a11y_contrast.py for colour
```

### Inside index.html, in order

| Region | Holds |
|---|---|
| `MAASVERSE_CAMPAIGN` | **seed content only** — the 69-day example campaign: days, bait bands, milestones. Removable; see "About the reading data" |
| `Store` | device storage, with legacy-key fallback |
| `THEMES` | five theme packs; every colour token per pack |
| `LEVELS` `PAYOUT` `LOOT` `RARITY_W` `DEFAULT_SHOP` | progression and rewards |
| world engine | `flatUnits` `unitLabel` `baitFor` `replan` `levelFor` `rollLoot` |
| `sceneSVG` `floraSVG` `motes` | the illustrated scene: sky, moon phase, sunrise, grove |
| tasks | `TASK_FIELDS` `SHOW_FIELDS` `newTask` `filterTasks` `renderTasks` `taskEditor` |
| tracks | `TASK_TYPES` `newTrack` `recomputeTrack` `relabelLinked` `tierImpact` `spawnRepeat` |
| screens | `renderTonight` `renderGrove` `renderTrail` `renderHoard` + `paint` |
| dialogs | `openSheet` `openDrop` `closeSheet` `normalizeA11y` `toast` `setErr` |
| backups | `storageHealth` `writeLocalSnap` `applyState` + the Backups sheet |
| `Account` | Neon sign-in, session, bearer token; `Sync.*` rides on it |

---

## How the pieces fit

**Tasks are the data layer.** Everything is a task record; only `title` is required. The shipped campaign was migrated into 69 task records on first run. Tonight, Trail and the Grove all read from tasks — edit a task and every screen follows.

**Tonight is assembled from sections** the user defines: categories, tags, scope, count, sort, and which fields appear per card. The first card of the first section is the hero and carries the `h1`.

**Tracks decide what a result changes.** A track owns categories and a total, with one anchor pinned:

- `anchor: 'deadline'` → the date holds, future amounts move
- `anchor: 'pace'` → the amount holds, the finish date moves
- `ripple: 'smooth' | 'consume' | 'fixed'` → how the difference lands

The three win buttons show their own consequence (`5.06/day left`, or a projected date). When a deadline track demands more per day than the user called comfortable, Tonight surfaces an honest warning with three ways out: move the finish (which *creates* the extra sessions), trim the scope, or leave it.

**Auth and sync.** The browser signs in against Neon Managed Better Auth (Google, or an emailed code) and holds a session token. Every `/api/sync` call carries it as a bearer token; the function verifies it against the auth service's JWKS and uses the `sub` claim — never the body — to scope every query. Optional `ALLOW_EMAILS` env var acts as an invite list.

---

## Setting up www for iteration — do this early

`www/index.html` is currently ~165 KB in a single file. That was right for getting here; it is wrong for what comes next. The owner expects months of iteration on this app, and a single file makes every change riskier than it needs to be: no way to review a diff in isolation, no way to hand one area to one person, and a mistake anywhere breaks everything.

**Split it into ES modules. No build step required** — browsers load `<script type="module">` with relative imports natively, Netlify serves them fine, and Capacitor's WebView serves them fine.

Suggested shape, which follows the seams already in the code:

```
www/index.html          shell, meta, the <style> block (or extract to app.css)
www/app/main.js         boot, paint, view router
www/app/store.js        device storage, legacy keys
www/app/themes.js       THEMES
www/app/engine.js       units, labels, bait bands, levels, loot
www/app/tasks.js        task model, filters, editor
www/app/tracks.js       anchors, ripple, projections, repeats
www/app/scene.js        sceneSVG, floraSVG, motes
www/app/screens/*.js    tonight, grove, trail, tasks, hoard
www/app/ui.js           dialogs, toast, normalizeA11y
www/app/account.js      auth + sync
www/app/backups.js      snapshots, restore
www/seed/campaign.js    the example campaign — one file, deletable
```

Rules for the split:
- **Behaviour must not change.** Run the full test suite before and after; the suites load `www/index.html`, so update their entry point and expect identical results.
- Do it as **one commit that only moves code**, no improvements mixed in. Anything else makes the diff unreviewable.
- Keep the seed campaign in its own file so removing it before launch is a deletion, not surgery.
- `test/a11y_contrast.py` parses `THEMES` out of `index.html` — point it at the new module.

One caveat: ES modules don't work over `file://`. Local development needs `netlify dev` or any static server. That's already the recommended workflow.

Do this **before** the interface work in `BRAINSTORM.md`, and **after** sign-in is confirmed working — it's a refactor, and refactoring on top of an unverified system means debugging two things at once.

## State of play

**Verified by tests:** campaign maths, task CRUD/search/filter, layout sections, all track anchors and ripple modes, the strain warning, repeats, device storage and snapshots, restore and undo, accessibility across every screen and sheet, contrast in all five packs, and the sync function's account isolation, staleness handling, allowlist and rejection paths.

**Not verified anywhere:** the live auth handshake. The build sandbox couldn't reach the Neon auth domain, so `Account.refresh()`, `signInGoogle()` and the email-code flow are written from Neon's docs and have never spoken to the real service. **This is the first thing to check.**

Specifically unconfirmed in `Account`:
- the shape `getSession()` returns, and where the token lives on it (`session.session.token` vs `session.token` vs an access token)
- whether `client.emailOtp.sendVerificationOtp` exists, or whether it's magic-link only
- whether the session survives the Google redirect back to the site
- whether the browser holds the auth cookie cross-origin (Safari ITP is the risk; if it fails, route auth through a same-origin function proxy)

---

## Do this first

The owner has signed in with Google successfully but nothing has confirmed the app received a session or wrote to Postgres.

1. Open the deployed site, sign in, and inspect: `Account.status`, `Account.user`, `Account.token`. If `status` is `signedIn` but `token` is null, the token is somewhere else on the session object — find it and fix `refresh()`.
2. Watch the network tab for `/api/sync`. A 401 means the token isn't reaching the function or isn't verifying. A 500 with a detail message means the database call failed.
3. Confirm with `select user_id, updated_at, saved_at from app_state;` in Neon.
4. Then run the whole suite: `npm install jsdom && for t in test/*.cjs; do node $t; done`

---

## Known open items

The full register lives in `PARTS.md` (with status per part) and `BRAINSTORM.md` (with direction). The items below are the ones that block or constrain other work.

- **No way to delete an account.** Legally required, an App Store review item, and simply correct. See `PRODUCTION.md`.
- **No error monitoring.** Nothing reports a failed deploy or an erroring function.
- **RLS isn't armed.** `DATABASE_URL` connects as `neondb_owner`, which has `rolbypassrls = t`, so the policies in `db/schema.sql` aren't enforced. Isolation currently rests entirely on the function filtering by the verified `sub`. Fix by creating a non-owner role, granting it table access, and repointing `DATABASE_URL`. Deliberately deferred until sign-in works.
- **Sign in with Apple** isn't offered by Neon (Google, GitHub, Vercel only). Only becomes a blocker for a public App Store release that also offers Google sign-in. TestFlight internal testing is unaffected.
- **TestFlight** is scaffolded but never run: `npx cap add ios && npx cap sync ios && npx cap open ios`. Before the first archive, set a real bundle ID in `capacitor.config.json`, register it in App Store Connect, and set `apiBase` in `www/config.js` to the deployed site URL — the native shell serves pages locally and can't resolve a same-origin API. Google's OAuth redirect will need a custom URL scheme registered in the iOS project.
- **Theme packs** were meant to match an app called Joie, which couldn't be found. The five shipped packs are stand-ins; the owner may want them re-coloured.
- **Missed days don't visibly redistribute.** `PARTS.md` defect K1. The maths is right and the effect is invisible, so the user is told "nothing is overdue" when something plainly is. Highest-priority functional bug.
- **Launch content swap.** Before the app is public, replace the Maas seed with generic starter content and a first-run flow that helps someone build their own world from scratch. The onboarding is currently the weakest part of the product for anyone who isn't the owner: a new account inherits a stranger's reading campaign, which makes no sense. Needs: a short "what are you working toward?" setup, one or two neutral example worlds, and a genuinely good empty state.
- **Vocabulary pass.** Some user-facing copy still leans literary ("the hook", "bait", quest titles in the seed data). The mechanics are general; check the wording is too before launch.

---

## Working notes

- Build the client by editing `www/index.html` directly. It is large but organised by the regions above; search for the function name.
- `normalizeA11y()` runs after every render and every sheet mount — new markup inherits list and group semantics without remembering to add them.
- Colour tokens are per-theme. Never hardcode a colour in a component; use `var(--glow-ink)` for accent *text* and `var(--glow)` for decorative fills. They differ deliberately — the light pack fails contrast otherwise.
- `test/a11y_contrast.py` parses `THEMES` straight out of `index.html`, so it stays honest after edits.
- Prose in the UI is deadpan and specific, never chirpy. "Attention is garbage tonight" is the register.
