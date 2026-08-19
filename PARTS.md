# PARTS — the component register

Every part of the app that can be reviewed, assigned, tested or flagged. Not just tabs: the pieces inside them, what each is *supposed* to do, and what it touches elsewhere.

**How to use this.** Each part has an ID. Use the ID when flagging a bug, assigning work, or writing a test. When you change a part, check its **Touches** column — that's where breakage shows up. Status values: `ok` (works and has been tested), `unverified` (built, never confirmed against real use), `broken`, `unclear` (works but the user can't tell what it's for), `missing`.

The **Why** column matters more than the rest. If a part can't justify its why in one sentence, it's a candidate for removal, not polish.

**Keep this current.** Every update that touches a part updates its row here in the same commit — What it does, Touches, Status. Cover what/where/why/when/who/how wherever it's not obvious from the column alone (a one-line addition to Touches or Status is enough; it doesn't need new columns). This file is the map; a stale map is worse than none. See HANDOFF.md's non-negotiable #7.

---

## T — Tonight

The default screen. Should answer one question: *what am I doing right now, and why would I want to?*

| ID | Part | What it does | Why it exists | Touches | Status |
|---|---|---|---|---|---|
| T1 | Illustrated scene | Renders the sky/ground/grove SVG (`sceneSVG`, `motes`), tinted by the active theme pack | Makes it a place, not a list. Moon tracks campaign progress; sun rises toward the finish | Themes, world progress, grove contents | ok |
| T2 | World switcher (top left) | A pill showing the active world's name; opens the Worlds sheet | Move between projects | Worlds, all screens | unclear — reads as a label, not a control |
| T3 | Days-left counter (top right) | A pill; opens the Pace sheet on tap | Ambient time pressure; opens Pace | Tracks, dates | unclear — opens Pace but doesn't look tappable |
| T4 | Hero card | Renders the first task of the first configured Tonight section, full-size, as the `h1` | The one thing to do now | Tasks, sections config | ok |
| T5 | Win tiers (min / full / boss) | Three buttons call `logTask()` with a payout tier; each grants XP, currency, a loot chance, and plants something in the Grove | Three ways to succeed so a bad night still counts | Tasks, tracks, XP, currency, loot, grove, streak | ok |
| T6 | Tier impact captions | Each tier button shows `tierImpact()` — what logging it would do to the track: days left, or a projected finish date | Shows the consequence of each choice before choosing | Tracks | ok, but invisible when rounding hides the difference — see K1 |
| T7 | Hook reveal | Collapsed reveal of the task's `hook` field, pulled from seed bait bands (`baitFor`) or a custom hook | Turns motivation into a small reward | Tasks (hook field), bait bands in seed data | ok — wording is literary, see BRAINSTORM |
| T8 | Meta chips (how / position) | Small inline chips for whichever fields a section is configured to show | Context without clutter | Tasks | ok |
| T9 | Momentum meter | Progress bar toward the nearest unclaimed milestone (`nextMilestone`) | Progress toward the next milestone | Tracks, milestones | ok |
| T10 | Escape hatch ("attention is garbage") | Opens the Sprint sheet in place of the win tiers | Removes the all-or-nothing trap | Sprint timer | ok |
| T11 | Sprint button | Starts a 10/15/25-minute countdown (`sprintFace`); pays XP, currency and a loot chance on completion regardless of whether a task was logged | Timed focus, rewards on completion | XP, currency, loot | ok |
| T12 | Standing stats (streak, currency) | Streak count (`streak()`) and currency total, shown ambiently | Ambient progress | Streak logic, currency | ok |
| T13 | Level bar | XP progress toward the next level (`levelFor`) | Long arc progression | XP, levels | ok |
| T14 | Next milestone card | The nearest milestone whose unit position hasn't been reached yet | Something to aim at | Milestones, biomes | ok |
| T15 | Strain warning | `strainCard()` — appears when a deadline-anchored track's live per-day rate exceeds the comfort pace set on the track; offers three ways out | Says out loud when the plan stopped being possible, offers three real choices | Tracks, dates, tasks | ok, tested — now also fires on Trail (see K1). Still unconfirmed against real day-to-day use |
| T16 | Section layout config | `homeConfigSheet`/`sectionEditor` — which categories, tags, scope and fields populate each Tonight section | User decides what this screen shows | Tasks, categories, tags | ok, buried |
| T17 | Position fixer | The Position sheet — nudges `unitsDone` forward or back without touching XP or the grove | "The plan follows you, not the reverse" | Tracks, unit position | ok, buried |

---

## G — Grove

The reward surface. Should answer: *what have I built?*

| ID | Part | What it does | Why it exists | Touches | Status |
|---|---|---|---|---|---|
| G1 | Scene | Same `sceneSVG`/`motes` renderer as Tonight, taller, no cards over it | Visible accumulation | Themes, flora records | ok |
| G2 | Theme picker | Opens the Themes sheet; swaps the CSS variable set live, no reload | Personalisation; future reward/paywall hook | All screens | ok |
| G3 | Growth counts | Counts `W.progress.flora` entries by kind (sprout / tree / legendary) — one is planted per logged night, win or rest | Legible summary of effort | Flora records | ok |
| G4 | Biome list | Built from milestones whose `reward === 'biome'`; unlocked biomes come from `W.progress.biomes`, named by a hardcoded `biomeName()` lookup | Long-arc unlocks | Milestones | unclear — the word means nothing to a new user, and it isn't editable. Own screen wanted |
| G5 | Rewards surface | — | — | missing — rewards live in Hoard, not here, and can't be meaningfully edited |

---

## R — Trail

Currently the weakest tab. Intended as the campaign map: *where have I been, where am I going?* In practice users read it as a task list and expect it to behave like one.

| ID | Part | What it does | Why it exists | Touches | Status |
|---|---|---|---|---|---|
| R1 | Finish-line card | Shows `W.launch`/`W.launchLabel` when set, with a days-out count | The date everything points at | Tracks, world launch date | ok |
| R2 | Category groups | Tasks grouped by `category` into sections, each with a logged/total count | Structure over a long plan | Tasks | ok |
| R3 | Day nodes | One list item per task, ordered by date: date, title, target range, and the result if logged | History and what's ahead | Tasks, logs | ok |
| R4 | Missed-day handling | A past-dated, unlogged task now shows "Missed — needs a decision" (a link into Pace) or "Folded into the plan" once acknowledged, instead of rendering nothing | Should surface a decision when the plan no longer works | Tracks, tasks, dates | ok — fixed, see K1 |
| R5 | Catch-up button | Opens the Pace sheet, now reading the live track engine (`trackStatus`, `openSlots`, `missedTasks`) instead of the dead legacy functions it used to | Redistribute what's left | Tracks | ok — fixed, see K1 |
| R6 | The tab's purpose | — | — | unclear. Decide what Trail *is* before polishing it |

---

## K — Tasks

The data layer, exposed. Should answer: *what's in this project and let me change it.*

| ID | Part | What it does | Why | Touches | Status |
|---|---|---|---|---|---|
| K1 | Track engine | `recomputeTrack()` — on every log and on Redistribute, rewrites future task `min`/`max` (smooth ripple) or future dates (consume / pace ripple) so `remaining` resolves to zero at the anchor. `missedTasks()`/`resolveMissed()` give a missed task an explicit outcome (move to today, fold in, let it go) instead of leaving it un-logged forever | What moves when you log: date holds and amounts move, or amounts hold and the date moves | Tasks, Tonight, Trail, milestones | ok — fixed, see Known defects |
| K2 | Track editor | `trackEditor()` — anchor, ripple, categories, total and comfort pace, in one sheet | Configure anchor, ripple, total, comfort | Tracks | unverified |
| K3 | Search | Filters tasks by title substring | Find anything | Tasks | ok |
| K4 | Filters (category, tag, streak, scope) | Chips combined with AND, read by `filterTasks()` | Narrow a long list | Tasks | ok |
| K5 | Sort | date / title / category / max / min / when-added, `filterTasks()`'s sort param | Order a long list | Tasks | ok |
| K6 | Task rows | `taskRow()` — compact list rendering; opens the editor on tap | Scan and open | Tasks | ok |
| K7 | Task editor | `taskEditor()` — every field in `TASK_FIELDS`; only `title` is required to save | Everything editable; only title required | Tasks, tracks, streak | ok |
| K8 | Task types | A task carries `target`/`streak`/others in `types[]`; `hasType()` gates behaviour — only `target` tasks move `unitsDone` | A task can be several things at once | Tracks, streak, repeats | unverified in real use |
| K9 | Repeat rules | `spawnRepeat()` — after logging, clones the task to its next date per the configured repeat rule | Recurring work without re-entry | Tasks | unverified |
| K10 | New-world flow | `SHEETS.newworld()` — name, unit, currency, theme, start/end, parts as a textarea | Start a project | Worlds, tasks, tracks, themes | **unclear and reading-flavoured — see BRAINSTORM** |

---

## H — Hoard

The wallet and trophy case. Should answer: *what have I earned, and what can I spend it on?*

| ID | Part | What it does | Why | Touches | Status |
|---|---|---|---|---|---|
| H1 | Level and XP | `levelFor(xp)` against the `LEVELS` table | Long arc | XP, levels | ok |
| H2 | Currency | `W.progress.coins`, named per-world by `W.currency`; earned via `PAYOUT` on every log and every completed sprint | Spendable proof of effort | Logging, shop | unclear — never explained, name is configurable but meaning isn't |
| H3 | Loot inventory | `rollLoot()`/`grantLoot()` — a chance per log (scaled by tier) and one guaranteed per milestone; items are cosmetic only | Collection, surprise | Loot table | ok, but loot does nothing yet |
| H4 | Reward shop | A user-defined shelf of `{emoji, name, price}`; buying spends coins and nothing else happens to the reward afterward | Real-world bribes | Currency | unclear — editing is unintuitive; deserves its own screen |
| H5 | Milestones list | `checkMilestones()` fires when `unitsDone` crosses a milestone's `atIndex`; grants coins, sometimes a biome unlock and always legendary loot | Named achievements | Tracks, biomes | ok |
| H6 | Sprint stats | Running totals of `W.progress.sprints`/`sprintMinutes`, incremented by `sprintFace()` | Focus history | Sprints | ok |
| H7 | Settings entry | Opens `SHEETS.settings()` | Everything configurable | All sheets | ok |

---

## S — Settings and system sheets

| ID | Part | What it does | Why | Touches | Status |
|---|---|---|---|---|---|
| S1 | Account | `SHEETS.account()` plus the `Account` object — sign in via Neon Managed Better Auth (Google, or an emailed code); holds the bearer token that `Sync.*` rides on | Sign in, sync, per-person data | Neon auth, sync function | verified end to end — see HANDOFF |
| S2 | Backups | `SHEETS.backups()` — three layers: on-device daily snapshots (`localSnaps`/`writeLocalSnap`), one-tap undo (`stashUndo`), and cloud snapshots once signed in (`Sync.listSnapshots`/`getSnapshot`) | Three layers, restore, undo | Device storage, cloud snapshots | ok on device; cloud path unverified |
| S3 | Import / export | Whole-state JSON: `applyState()` on the way in, a file download on the way out | Data portability | Whole state | ok |
| S4 | Reduce motion | Toggles a `calm` class that the stylesheet reads to disable ambient animation | Accessibility preference | Animation | ok |
| S5 | Theme packs | The same `themes()` sheet used by G2 and the Tonight scene cap | Look | All screens | ok |
| S6 | Worlds list | `SHEETS.worlds()` — switch the active world, or open New World | Switch and create | Worlds | ok |
| S7 | Pace sheet | `SHEETS.pace()` — shows units/days left from the live track engine, lists every missed task with a resolution for each, and the before/after numbers a redistribute would actually produce | Diagnose and redistribute | Tracks | ok — fixed, see K1 |

---

## X — Cross-cutting

These aren't screens. They break everything when they break.

| ID | Concern | Rule | Status |
|---|---|---|---|
| X1 | Local-first storage | Every action saves instantly; app fully works offline and signed out | ok |
| X2 | Sync | Local wins for what you just did; server is how other devices find out | verified end to end — see HANDOFF |
| X3 | Accessibility (WCAG 2.1 AA) | One h1, no skipped headings, named controls, list semantics, 44px targets, colour never alone, dialogs trap focus | ok — keep it that way |
| X4 | Themes | Accent *text* uses `--glow-ink`; decorative fills use `--glow`. Never hardcode | ok |
| X5 | Time and dates | Local device date; "today" drives almost everything | fragile — see K1 and timezone questions |
| X6 | Generic-first | Engine knows worlds/tasks/units/tracks, never books | mostly ok; copy still leans literary |
| X7 | Naming | See NAMING.md before any rename | ok |

---

## Known defects

### K1 — Missing a day does nothing visible *(fixed)*

**Observed:** a reading day was missed on 18 Aug. The chapters for 19 Aug onward stayed identical. Tapping **Catch up** returned "Plan redistributed. Nothing is overdue" — which is both unhelpful and arguably untrue.

**What's actually happening — two separate bugs, not one:**

1. The maths in the live track engine is correct and the effect is genuinely hard to see. `openSlots()` excludes past-dated unlogged tasks, so the missed day's units fold back into `remaining` and get spread across the days that are left. Spreading ~5 extra units across ~67 days changes the displayed rate by 0.07/day, which rounds to zero on screen.
2. **The Pace sheet itself is wired to the wrong data.** `SHEETS.pace()` (opened by both "Catch up" on Trail and "Redistribute the plan" in Settings) computes what it shows from `daysLeft()`, `totalUnits(w)`, `w.progress.unitsDone` and `dayFor()` — all of which read `w.days`/`w.books`, a data structure that's frozen the moment a world is created and never touched again. The button's actual action (`do_replan`) correctly calls the live engine (`recomputeAll` → `recomputeTrack`), but the sheet's diagnostics and its "Plan redistributed. Nothing is overdue." toast are disconnected from that engine entirely — the toast is a fixed string regardless of what happened. The functions this sheet was presumably built against (`replan()`, `syncTasksFromPlan()`) are dead code, confirmed unreferenced anywhere in the app or the tests — see "Removed — dead code" below.

**Why it matters more than the arithmetic.** The design promise is "nothing is ever overdue, the plan follows you." The implementation honours that so quietly — and, for the one screen meant to surface it, incorrectly — that the user can't tell whether the app noticed at all.

**What needs deciding, not just fixing:**
- A missed day should be *acknowledged*: "you missed Tuesday — those 5 chapters are now spread across the 67 days left" with the before/after numbers shown.
- The missed task itself needs a resolution path: absorbed into the plan, moved to today, or explicitly abandoned. Right now it lingers as permanently un-logged.
- When redistribution can't fix it — the required pace crosses what the user called comfortable — the strain warning should fire *here*, from Trail, not only on Tonight.
- "Catch up" should report what changed, or say plainly that nothing needed to change.

**What shipped:**
- `missedTasks(w, tr)` finds every past-dated, unlogged, not-yet-acknowledged task on a track — the exact set `openSlots()` was already silently excluding.
- Trail shows a real status per missed day: "Missed — needs a decision" (a link into Pace) until it's resolved, then "Folded into the plan" or the same "Rested" label a normal rest day gets.
- The Pace sheet (`SHEETS.pace()`) now reads `trackStatus()` live instead of the dead legacy fields, lists every missed task with real before/after numbers, and offers three resolutions per task via `resolveMissed()`: **move to today** (re-enters the plan as an open task), **fold in** (acknowledges it, leaves the redistribution exactly as it already silently happens), **let it go** (logs it as rested — no reward, since nothing was done, and the campaign's unit labels move past it).
- "Redistribute what's left" (`do_replan`) reports the real before/after for today's task, or says plainly that nothing needed to change, instead of the fixed "Plan redistributed. Nothing is overdue." string.
- `strainCard()` now renders on Trail as well as Tonight, so T15 can fire from either screen as intended.
- Test coverage: `test/missed_day_test.cjs`, 23 assertions — detection, all three resolutions, Trail's rendered status, the honest redistribute toast, and that the resolution buttons stay individually named and distinct when more than one day is missed at once.

**Left open, deliberately:** whether "let it go" should reduce the track's total (so the abandoned units stop being owed at all) or continue being silently redistributed like "fold in" does — right now the two are numerically identical and differ only in bookkeeping and labeling. That's a product decision, not a bug; revisit if it matters in practice. Also unaddressed: the Tonight header's "days left" counter (T3) still reads `daysLeft()`, the same kind of frozen-legacy-data pattern this fix removed from the Pace sheet — it hasn't drifted yet for the single-track seed world, but it's the same class of bug waiting to happen once a task's date moves independently of `w.days`.

**Touches:** R4, R5, K1, T15, S7, X5.

### K2 — New-world flow is reading-shaped
Covered in BRAINSTORM under *Project model*. Fields like "what are you counting" and "currency" assume a counting project; "parts" turn out to be milestones but aren't named that; "world" and "theme pack" are jargon. Note: "counting" is one project type among several, not the only one — see BRAINSTORM §3.

### K3 — Rewards, currency, loot and biomes are unexplained
Four reward systems exist and none introduces itself. A new user earns Wyrdmarks without being told what they are, collects loot that does nothing, and unlocks a "biome" with no explanation. Needs a designed reward layer, not more reward types.

---

## Removed — dead code

Found during a full reference-count sweep of `www/index.html` (every top-level function checked for at least one call site outside its own definition). Recorded here so the removal has a paper trail, per the standing rule against dead code.

| Removed | What it was | Why it was dead |
|---|---|---|
| `flatUnits(w)` | Flattened a world's books into one array of unit indexes | Zero call sites anywhere in the app or tests |
| `replan(w)` | An earlier "redistribute the plan" implementation, operating on `w.days` | Superseded by `recomputeTrack`/`recomputeAll` when tracks were built; zero call sites since |
| `syncTasksFromPlan(w)` | Paired with `replan()`, wrote `w.days` changes back onto linked tasks | Same as above — its counterpart, equally dead |
| `Sync.cfg`, `Sync.cfgKey`, `Sync.loadCfg()`, `Sync.saveCfg()`, and the original `Sync.endpoint()`, `Sync.ready()`, `Sync.pull()`, `Sync.push()`, `Sync.reconcile()` | The original passphrase-based sync client (`x-onwego-key` header, a shared secret typed into a settings field) | Fully shadowed by later reassignment once the Neon-Auth, bearer-token `Account`/`Sync` system was built. `loadCfg`/`saveCfg` had zero call sites at all; the others were unreachable — overwritten before boot ever calls them. `Sync.schedulePush()` and the `status`/`lastAt`/`_t` fields were kept; they're still live and used by the current system. |
| The first (passphrase-header) definitions of `Sync.listSnapshots()` and `Sync.getSnapshot()` | Same old system, cloud-snapshot listing | Immediately overwritten a few hundred lines later by the bearer-token versions that are actually used |

---

## QA method

For each part, the test isn't "does it render." It's:

1. **What's the why?** One sentence. If it's hard to write, that's the finding.
2. **Does it do that in the good case?**
3. **Does it do that in the bad case?** Missed the day. Did half. Did triple. Changed their mind. Came back after a week. Started mid-project. Has no dates at all.
4. **Can the user tell it worked?** Silent correctness is a bug in a motivation app.
5. **What does it touch?** Check those parts still behave.
