# OnWeGo

A campaign tracker that behaves like a world instead of a checklist. One HTML file, one serverless function, no framework, no build step.

Ships with the **Maasverse** campaign loaded: *Kingdom of Ash* Ch. 58 → epilogue (Aug 18–30), then all three *Crescent City* books, ending Oct 25 with Oct 26 as buffer and Oct 27 as the finish line.

```
www/index.html              the entire app
netlify/functions/sync.mjs  cross-device sync
netlify.toml                build + routing
capacitor.config.json       iOS wrapper config (for TestFlight later)
package.json
```

---

## 1. Push it to GitHub

```bash
cd onwego
git init
git add .
git commit -m "onwego"
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

Every push to `main` redeploys automatically. Rename the site under **Site configuration → Change site name**; note the URL, you'll need it in step 4.

## 3. Turn on sync

Open the site → **Hoard → Settings → Sync across devices** → enter a passphrase (8+ characters, treat it like a password) → **Save and sync now**.

Enter the *same* passphrase on any other device and they stay in step.

How it works: the app always writes locally first, so it's instant and works with no signal. A moment later it pushes to a Netlify Blobs store keyed by a hash of your passphrase. On open — and whenever you return to the app — it pulls, and whichever side was saved most recently wins. There's no login and no user table; the passphrase is the only key, which is why it should be long.

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
2. In the app, set **Site address** in the sync sheet to your Netlify URL (`https://your-site.netlify.app`). The native shell serves the HTML locally, so it needs the full URL to reach the sync function — on the web version, leave it blank.
3. In Xcode: pick your team under Signing & Capabilities, set the version and build number.

Then **Product → Archive → Distribute App → TestFlight**.

Internal testers (you, up to 100 devices on your own account) install without App Store review. External testers go through a lighter beta review.

After any change to the app: `git push` updates the web version, and `npx cap sync ios` + a new archive updates the TestFlight build.

---

## Making it yours

**New worlds** — Tonight screen → tap the world name → *Build a new world*. Name, dates, and parts as `name, count` per line. It generates the day plan, bait bands, and milestones. Works for a series, a course, a season, a backlog.

**Theme packs** — Grove screen → the pack button, top left. Five ship: Midnight (moon phases, stars, a sun that rises as you approach the finish line), Meadow, Ember, Tidewater, Orchard.

**The code** — everything is in `www/index.html`:

| What | Where |
|---|---|
| Theme packs | `const THEMES` |
| Loot table and drop rates | `const LOOT`, `RARITY_W` |
| XP per result, loot chances | `const PAYOUT` |
| Level names | `const LEVELS` |
| Default reward shop | `const DEFAULT_SHOP` |
| Maasverse campaign | `const MAASVERSE_CAMPAIGN` |
| Trees, sprouts, flowers | `floraSVG()` |
| Sky, moon phase, sunrise | `sceneSVG()` |
| Sync client | `const Sync` |

## Rules the app follows

- Three ways to win a night: minimum (2 chapters, +10 XP), full clear (+20), boss mode (+3 past target, +30 and guaranteed loot).
- Bait is attached to chapters, not dates — fall behind and the Ch. 89–93 bait still waits at Ch. 89–93.
- **Redistribute** re-spreads what's unread across the days that remain. Nothing is ever overdue.
- Milestones fire off your position: Ch. 68 unlocks a biome, Ch. 93 plants a legendary tree, each finished book opens new ground.
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
| Hook | Why you want to — the bait. Hidden behind a tap on Tonight |
| How | The approach that works for this one |
| Payoff | What you get out of finishing |
| Notes | Anything else |
| Category / Subcategory | The groupings — a book, a course, a room |
| Tags | Comma separated |
| Date | Leave blank for anytime |
| Streak toggle | Whether logging it keeps the streak alive |

Search runs across title, hook, notes, target, category and tags. Filters stack: category, tag, streak-only, and scope (today / today and later / not logged / logged / everything). Sort by any field, either direction.

Renaming the four comment fields is a one-line change in `TASK_FIELDS`; the labels are used everywhere automatically.

## Tonight — choose what shows

Tonight is assembled from **sections** you define (Tonight screen → *Choose what shows on this screen*). Each section independently picks:

- which categories and tags to pull from (leave empty for all)
- which tasks — today only, today and later, anything unlogged, or everything
- how many to show
- sort field and direction
- which fields appear on each card, including whether the minimum/maximum buttons show at all

Two ship by default: **Tonight** (one card, today, with buttons and hook) and **Coming up** (the next three). Add as many as you want — a "Starred only" section, a "House chores, 5 at a time" section, a section per category.

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

If a deadline-anchored track starts demanding more per day than you called comfortable (default: 1.6× your starting pace), Tonight says so plainly — "now needs 9.2 a day" — and offers three ways out:

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

## Where your data lives

Three layers, because one is not a backup.

| Layer | What it covers | Needs |
|---|---|---|
| **This device** | Every change, saved instantly | Nothing |
| **On-device history** | The last 5 days, to undo a bad edit | Nothing |
| **Cloud snapshots** | One per day, kept 30 days | Sync turned on |
| **Downloaded file** | Whatever you keep, wherever you keep it | You tapping the button |

**Hoard → Settings → Backups** shows all of it, with a restore button per snapshot. A restore always stashes the version you had first, so **Undo the last restore** is there if you grab the wrong one. Restores need two taps.

**In the TestFlight build**, the app stores data in its own WebView storage, which survives app updates and device restarts but is deleted if you delete the app. So: turn sync on before you rely on it, and download a copy occasionally — on iOS that lands in Files, which iCloud backs up with everything else.

If storage is blocked (private browsing, or a full disk), the app says so on launch rather than silently forgetting your night.

## Accessibility

Built to WCAG 2.1 AA. What that means here:

- **Contrast** — every text colour is checked against the surface it actually lands on, in all five theme packs. Text hits 4.5:1 or better; borders, focus rings, and progress fills hit 3:1 or better. Cards sit on a near-solid backdrop so text never floats over a bright patch of sky.
- **Forms** — every field has a real label, the required field is marked, and errors appear in text next to the form as well as being announced.
- **Colour is never the only signal** — loot rarity says "Legendary" as well as glowing, locked biomes say "Locked", today's node says "Tonight", the selected theme has a check mark.
- **Keyboard** — everything is reachable and operable. Sheets are real modal dialogs: focus moves in, Tab stays inside, Escape closes, focus returns to the control that opened them.
- **Screen readers** — one `h1` per screen with headings that never skip a level, a `main` landmark and skip link, named controls with emoji marked decorative, progress bars that expose their value, and XP and loot announced through a polite live region.
- **Motion** — the drifting light respects `prefers-reduced-motion`, and there's a **Reduce motion** switch in Settings for when the system setting isn't what you want.
- **Targets and text** — controls are at least 44px, body text is 16px, and the layout reflows without horizontal scrolling at 200% zoom.
- **Timers** — sprints can be paused or stopped, and nothing is lost either way.

### Checking it yourself

```bash
npm install jsdom
node test/qa_sweep.cjs           # every screen and sheet, structural problems
python3 test/a11y_contrast.py    # every colour pairing in every theme pack
```

`test/` has nine more suites covering tasks, tracks, ripple behaviour, backups and the sync function. See `test/README.md`.

Two things no automated test can do, so do them on a real device: a pass with VoiceOver on, and a look at 200% text size.

## Local development

```bash
npm install -g netlify-cli
netlify dev
```

Serves `www` and runs the function at `http://localhost:8888/api/sync`.
