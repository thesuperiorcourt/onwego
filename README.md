# On We Go

A customisable, gamified productivity app that behaves like a world instead of a checklist.

Anything with parts, amounts and a deadline fits: a course, a training block, a renovation, a thesis, a job hunt, a reading campaign. You define worlds, tasks and tracks; the app handles pacing, momentum and the part where falling behind doesn't feel like failure.

**The build currently ships with an example campaign** — a 69-day Sarah J. Maas reading run ending 27 Oct 2026 — as seed content for testing against a real use case. It comes out before public launch, replaced by generic starter content. The engine knows nothing about books: everything is worlds, tasks, units and dates, with the labels supplied by whoever is using it.

**Before adding anything with a real or scaling cost — money, a legal obligation, or significant time on something unproven — see `COSTS.md`.** It's a non-negotiable (`HANDOFF.md` #8), not a suggestion.

## 1. Push it to GitHub

```bash
cd onwego
git init
git add .
git commit -m "On We Go"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/YOUR-REPO.git
git push -u origin main
```

If the repo already has commits, use `git pull --rebase origin main` first.

## 2. Connect Netlify

Netlify → **Add new site → Import an existing project → GitHub** → pick the repo. Everything it asks for is already in `netlify.toml`, so accept the defaults:

- Publish directory: `www`
- Functions directory: `netlify/functions`
- Build command: none needed

By default, every push to `main` redeploys automatically — if you've turned that off (Site configuration → Build & deploy → Stop builds, useful once you're pushing many small commits and want to batch deploys deliberately instead), trigger deploys yourself with `netlify deploy --prod` once the CLI is linked. Rename the site under **Site configuration → Change site name**; note the URL, you'll need it in step 4.

## 3. Set up Neon and turn on sync

Sync runs on Neon Postgres plus Neon's Managed Better Auth — there's no passphrase and no separate user table to manage; signing in with Google or an emailed code is the whole account system.

1. **Create a Neon project**, then turn on **Auth** for it (Neon Console → your project → Auth). This gives you an Auth URL that looks like `https://ep-....neonauth.....aws.neon.tech/neondb/auth`.
2. **Run `db/schema.sql`** once, in the Neon Console's SQL Editor, against your main branch. It creates `app_state` and `app_snapshot` and nothing else — Neon Auth owns its own schema already.
3. **Set environment variables in Netlify** (Site configuration → Environment variables):
   - `DATABASE_URL` — the *pooled* connection string from Neon's Connection Details, not the direct one
   - `NEON_AUTH_URL` — the Auth URL from step 1
   - `ALLOW_EMAILS` — optional, comma-separated invite list; leave unset for open signup
4. **Point the client at your Auth URL** — edit `authUrl` in `www/config.js` to the value from step 1 and push, or leave it blank and paste it into the app's own **Settings → Account** sheet the first time you open it (it's saved on the device from then on).
5. Open the site → **Settings → Account** → sign in with Google or an emailed code. Sign in again on any other device and they stay in step.

How it works: the app always writes locally first, so it's instant and works offline or signed out. A moment later it pushes to Postgres over `/api/sync`, authenticated with the session token from step 5 — never a password, never the device's own claim about who it is. On open, and whenever you return to the app, it pulls, and whichever side saved most recently wins.

**Account deletion, error monitoring and row-level security** are all built in and verified live once their optional env vars are set (`NEON_API_KEY`/`NEON_PROJECT_ID`/`NEON_BRANCH_ID` for deletion, `SENTRY_DSN` for monitoring) — see `PRODUCTION.md` for what each unlocks and where to get the values, and `CHANGELOG.md` for how each was verified.

## 4. TestFlight

Same codebase, wrapped in a native shell by Capacitor. You need the Mac, Xcode, and your paid Apple Developer account.

```bash
npm install
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/ios@latest
npx cap add ios
npx cap sync ios
npx cap open ios
```

Before the first build:

1. In `capacitor.config.json`, change `appId` to your real bundle ID (`com.yourname.onwego`) and register that same ID in App Store Connect.
2. In the app, set **Site address** in **Settings → Account** to your Netlify URL (`https://your-site.netlify.app`). The native shell serves the HTML locally, so it needs the full URL to reach the sync function — on the web version, leave it blank.
3. In Xcode: pick your team under Signing & Capabilities, set the version and build number.

Then **Product → Archive → Distribute App → TestFlight**.

Internal testers (you, up to 100 devices on your own account) install without App Store review. External testers go through a lighter beta review.

After any change to the app: `git push` updates the web version, and `npx cap sync ios` + a new archive updates the TestFlight build.

---

## Making it yours

**New worlds** — Today screen → tap the world name → *Build a new world*. Name, dates, and parts as `name, count` per line. It generates the day plan, bait bands, and milestones. Works for a series, a course, a season, a backlog.

**Theme packs** — Today or Rewards screen → the pack button, top left of the illustrated scene. Five ship: Midnight (moon phases, stars, a sun that rises as you approach the finish line), Meadow, Ember, Tidewater, Orchard.

**The code** — `www/index.html` is just the page shell; the app itself is ES modules under `www/app/`:

| What | Where |
|---|---|
| Theme packs | `export const THEMES` in `www/app/themes.js` |
| Loot table and drop rates | `LOOT`, `RARITY_W` in `www/app/engine.js` |
| XP per result, loot chances | `PAYOUT` in `www/app/engine.js` |
| Level names | `LEVELS` in `www/app/engine.js` |
| Default reward shop | `DEFAULT_SHOP` in `www/app/engine.js` |
| Maasverse campaign | `export const MAASVERSE_CAMPAIGN` in `www/seed/campaign.js` — one file, deletable |
| Trees, sprouts, flowers | `floraSVG()` in `www/app/scene.js` |
| Sky, moon phase, sunrise | `sceneSVG()` in `www/app/scene.js` |
| Sign-in and sync | `Account`, `Sync` in `www/app/account.js` |

## Rules the app follows

- Three ways to win: minimum (+10 XP), full clear (+20), boss mode (past target, +30 and guaranteed loot) — in the shipped example, that's 2 chapters / the day's target / 3 past target.
- Bait is attached to units, not dates — fall behind and it still waits at the same unit range (the shipped example: fall behind and the Ch. 89–93 bait still waits at Ch. 89–93).
- **Redistribute** re-spreads what's left across the days that remain. Nothing is ever overdue.
- Milestones fire off your position, not the calendar (the shipped example: Ch. 68 unlocks a biome, Ch. 93 plants a legendary tree, each finished book opens new ground).
- Nothing wilts. Skipping a day removes nothing.

## Tasks — where the data lives

Everything in a world is a task record, editable in the **Tasks** tab. The shipped Maasverse campaign is migrated into tasks on first run, so all 69 quest days are there to rename, re-hook, retag, or delete.

Only **Title** is required. Every other field is optional:

| Field | What it's for |
|---|---|
| Title | The only required one |
| Target | What you're aiming at — "Ch. 63–67", "3 miles", "Section 2" |
| Minimum | The smallest amount that still counts |
| Maximum | The full amount you planned |
| Hook | Why you want to — the bait. Hidden behind a tap on Today |
| How | The approach that works for this one |
| Payoff | What you get out of finishing |
| Notes | Anything else |
| Category / Subcategory | The groupings — a book, a course, a room |
| Tags | Comma separated |
| Date | Leave blank for anytime |
| Streak toggle | Whether logging it keeps the streak alive |

Search runs across title, hook, notes, target, category and tags. Filters stack: category, tag, streak-only, and scope (today / today and later / not logged / logged / everything). Sort by any field, either direction.

Renaming the four comment fields is a one-line change in `TASK_FIELDS`; the labels are used everywhere automatically.

## Today — choose what shows

Today is assembled from **sections** you define (Today screen → *Choose what shows on this screen*). Each section independently picks:

- which categories and tags to pull from (leave empty for all)
- which tasks — today only, today and later, anything unlogged, or everything
- how many to show
- sort field and direction
- which fields appear on each card, including whether the minimum/maximum buttons show at all

Three ship by default: **Today** (one card, now, with buttons and hook), **Missed** (anything unlogged and past its date, ahead of everything else), and **Up next** (the next three). Add as many as you want — a "Starred only" section, a "House chores, 5 at a time" section, a section per category.

The first card of the first section is the hero, and gets the big treatment. Tasks with no minimum or maximum get a simple Done / Boss pair instead of three tiers.

## Tracks — what moves when you log

A track owns one or more categories and holds a total to finish. One thing about it is pinned down; logging moves the other.

| Anchor | Pinned | What a result changes |
|---|---|---|
| **Deadline** | The finish date | The amounts on every future task |
| **Pace** | The amount per day | The projected finish date |
| **None** | Nothing | Nothing is rewritten — you just get a forecast |

How the difference lands is a second choice:

- **Smooth** — spread it evenly across everything left. A boss night shaves a fraction off each remaining day.
- **Consume** — amounts hold, dates slide. Getting ahead pulls the finish in; falling behind pushes it out.
- **Fixed** — nothing is rewritten. Surplus banks as being ahead.

The Maasverse campaign ships as one deadline-anchored, smooth track: 347 chapters, finish Oct 25. Change it in **Tasks → Tracks**.

**The tier buttons show their own consequence.** Under a deadline anchor each button reads what the rest of the plan becomes (`5.15/day left` vs `5.06/day left`); under a pace anchor it reads the finish date each choice produces. The same text is in the button's accessible name.

### The honest warning

If a deadline-anchored track starts demanding more per day than you called comfortable (default: 1.6× your starting pace), Today says so plainly — "now needs 9.2 a day" — and offers three ways out:

1. **Move the finish** to the date your comfortable pace actually reaches. This adds sessions, so every day genuinely gets lighter.
2. **Trim the scope** to what fits in the days left. Still a finish.
3. **Leave it** — the warning stops and the pressure stays.

Nothing here ever marks a day late or red. A plan that quietly demands nine chapters a night is how a plan becomes something you avoid, so the app says it out loud instead.

### Task types

Types are a set — a task can be several at once, and the nightly reading quest is target + streak.

| Type | Effect |
|---|---|
| **Target** | Has amounts and moves its track forward |
| **Streak** | Logging it keeps the streak alive |
| **Repeating** | Logging it spawns the next occurrence (daily, weekdays, weekly, every N days) |
| **Anytime** | No date, never late |
| **Milestone** | No work — marks a moment |
| **Bonus** | Earns XP but never touches the pace |

## Dependency and Node versions

`package.json` pins `@neondatabase/serverless` and `jose` to exact versions rather than ranges, and `netlify.toml` pins `NODE_VERSION`. That is deliberate: a floating `latest` means your build resolves to whatever was published that morning, which is a bad way to find out a new major exists. If you bump a pin, check the new version's `engines` field against the pinned Node version.

## If you rename the project

One string has to keep agreeing with itself over time:

| What | Where | Must match |
|---|---|---|
| Device storage key | `www/app/store.js` (`Store.key = 'onwego.v1'`) | itself, release to release |

Renaming the GitHub repo or the Netlify site changes nothing here — accounts and sync live in Neon, keyed by the signed-in user, not by any string in this repo. Change `Store.key` without a fallback and the app looks freshly wiped on every device, even though the data is still there.

This build still carries the fallback from an earlier rename (questline → onwego): `Store.legacy` reads the old device key once and migrates it if the current one is empty. That's the pattern to repeat for any future rename — add the old key to `legacy`, never just swap the string. The old key can be dropped once you've opened the app on every device you use.

## Accounts and sync (Neon)

Sign-in is handled by **Managed Better Auth** on Neon; data lives in your Neon Postgres. There is no passphrase any more.

**Files involved**

| File | Job |
|---|---|
| `www/config.js` | Your Auth URL and (for iOS) your site address |
| `db/schema.sql` | Run once in the Neon SQL Editor |
| `netlify/functions/sync.mjs` | Verifies the session token, reads/writes your rows |

**Netlify environment variables**

| Name | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string |
| `NEON_AUTH_URL` | The branch's Auth URL |
| `ALLOW_EMAILS` | Optional. Comma-separated invite list; empty means anyone can sign up |

**How a request is trusted.** The browser signs in against Neon and gets a session token. Every call to `/api/sync` carries that token, and the function verifies it against the auth service's published JWKS before touching the database. The user id inside the verified token is the only thing that selects rows — never the request body, never a query parameter. Two accounts cannot see each other's data even if one of them tries.

**Signed out, the app still works.** Everything is local-first: logging a day, planting a tree, editing tasks all work with no account and no signal. Signing in adds sync and cloud backups. Sign out and the device keeps everything it had.

**First sign-in with existing progress** pushes the device's copy up rather than pulling an empty account down — the reading you already did wins.

## Where your data lives

Three layers, because one is not a backup.

| Layer | What it covers | Needs |
|---|---|---|
| **This device** | Every change, saved instantly | Nothing |
| **On-device history** | The last 5 days, to undo a bad edit | Nothing |
| **Cloud snapshots** | One per day, kept 30 days | Sync turned on |
| **Downloaded file** | Whatever you keep, wherever you keep it | You tapping the button |

**Rewards → Settings → Backups** shows all of it, with a restore button per snapshot. A restore always stashes the version you had first, so **Undo the last restore** is there if you grab the wrong one. Restores need two taps.

**In the TestFlight build**, the app stores data in its own WebView storage, which survives app updates and device restarts but is deleted if you delete the app. So: turn sync on before you rely on it, and download a copy occasionally — on iOS that lands in Files, which iCloud backs up with everything else.

If storage is blocked (private browsing, or a full disk), the app says so on launch rather than silently forgetting your night.

## Accessibility

Built to WCAG 2.1 AA. What that means here:

- **Contrast** — every text colour is checked against the surface it actually lands on, in all five theme packs. Text hits 4.5:1 or better; borders, focus rings, and progress fills hit 3:1 or better. Cards sit on a near-solid backdrop so text never floats over a bright patch of sky.
- **Forms** — every field has a real label, the required field is marked, and errors appear in text next to the form as well as being announced.
- **Colour is never the only signal** — loot rarity says "Legendary" as well as glowing, locked biomes say "Locked", today's node says "Today — not logged yet", the selected theme has a check mark.
- **Keyboard** — everything is reachable and operable. Sheets are real modal dialogs: focus moves in, Tab stays inside, Escape closes, focus returns to the control that opened them.
- **Screen readers** — one `h1` per screen with headings that never skip a level, a `main` landmark and skip link, named controls with emoji marked decorative, progress bars that expose their value, and XP and loot announced through a polite live region.
- **Motion** — the drifting light respects `prefers-reduced-motion`, and there's a **Reduce motion** switch in Settings for when the system setting isn't what you want.
- **Targets and text** — controls are at least 44px, body text is 16px, and the layout reflows without horizontal scrolling at 200% zoom.
- **Timers** — sprints can be paused or stopped, and nothing is lost either way.

### Checking it yourself

```bash
npm install
node test/qa_sweep.cjs           # every screen and sheet, structural problems
python3 test/a11y_contrast.py    # every colour pairing in every theme pack
```

`test/` has fourteen more suites covering tasks, tracks, ripple behaviour, missed days, backups, account deletion, error reporting and the sync function. See `test/README.md`.

Two things no automated test can do, so do them on a real device: a pass with VoiceOver on, and a look at 200% text size.

## Local development

```bash
npm install -g netlify-cli
netlify dev
```

Serves `www` and runs the function at `http://localhost:8888/api/sync`.
