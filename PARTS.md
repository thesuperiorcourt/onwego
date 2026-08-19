# PARTS — the component register

Every part of the app that can be reviewed, assigned, tested or flagged. Not just tabs: the pieces inside them, what each is *supposed* to do, and what it touches elsewhere.

**How to use this.** Each part has an ID. Use the ID when flagging a bug, assigning work, or writing a test. When you change a part, check its **Touches** column — that's where breakage shows up. Status values: `ok` (works and has been tested), `unverified` (built, never confirmed against real use), `broken`, `unclear` (works but the user can't tell what it's for), `missing`.

The **Why** column matters more than the rest. If a part can't justify its why in one sentence, it's a candidate for removal, not polish.

---

## T — Tonight

The default screen. Should answer one question: *what am I doing right now, and why would I want to?*

| ID | Part | Why it exists | Touches | Status |
|---|---|---|---|---|
| T1 | Illustrated scene | Makes it a place, not a list. Moon tracks campaign progress; sun rises toward the finish | Themes, world progress, grove contents | ok |
| T2 | World switcher (top left) | Move between projects | Worlds, all screens | unclear — reads as a label, not a control |
| T3 | Days-left counter (top right) | Ambient time pressure; opens Pace | Tracks, dates | unclear — opens Pace but doesn't look tappable |
| T4 | Hero card | The one thing to do now | Tasks, sections config | ok |
| T5 | Win tiers (min / full / boss) | Three ways to succeed so a bad night still counts | Tasks, tracks, XP, currency, loot, grove, streak | ok |
| T6 | Tier impact captions | Shows the consequence of each choice before choosing | Tracks | ok, but invisible when rounding hides the difference — see K1 |
| T7 | Hook reveal | Turns motivation into a small reward | Tasks (hook field), bait bands in seed data | ok — wording is literary, see BRAINSTORM |
| T8 | Meta chips (how / position) | Context without clutter | Tasks | ok |
| T9 | Momentum meter | Progress toward the next milestone | Tracks, milestones | ok |
| T10 | Escape hatch ("attention is garbage") | Removes the all-or-nothing trap | Sprint timer | ok |
| T11 | Sprint button | Timed focus, rewards on completion | XP, currency, loot | ok |
| T12 | Standing stats (streak, currency) | Ambient progress | Streak logic, currency | ok |
| T13 | Level bar | Long arc progression | XP, levels | ok |
| T14 | Next milestone card | Something to aim at | Milestones, biomes | ok |
| T15 | Strain warning | Says out loud when the plan stopped being possible, offers three real choices | Tracks, dates, tasks | unverified in real use — see K1 |
| T16 | Section layout config | User decides what this screen shows | Tasks, categories, tags | ok, buried |
| T17 | Position fixer | "The plan follows you, not the reverse" | Tracks, unit position | ok, buried |

---

## G — Grove

The reward surface. Should answer: *what have I built?*

| ID | Part | Why it exists | Touches | Status |
|---|---|---|---|---|
| G1 | Scene | Visible accumulation | Themes, flora records | ok |
| G2 | Theme picker | Personalisation; future reward/paywall hook | All screens | ok |
| G3 | Growth counts | Legible summary of effort | Flora records | ok |
| G4 | Biome list | Long-arc unlocks | Milestones | unclear — the word means nothing to a new user, and it isn't editable. Own screen wanted |
| G5 | Rewards surface | — | — | missing — rewards live in Hoard, not here, and can't be meaningfully edited |

---

## R — Trail

Currently the weakest tab. Intended as the campaign map: *where have I been, where am I going?* In practice users read it as a task list and expect it to behave like one.

| ID | Part | Why it exists | Touches | Status |
|---|---|---|---|---|
| R1 | Finish-line card | The date everything points at | Tracks, world launch date | ok |
| R2 | Category groups | Structure over a long plan | Tasks | ok |
| R3 | Day nodes | History and what's ahead | Tasks, logs | ok |
| R4 | Missed-day handling | Should surface a decision when the plan no longer works | Tracks, tasks, dates | **broken — see K1** |
| R5 | Catch-up button | Redistribute what's left | Tracks | **broken in effect — see K1** |
| R6 | The tab's purpose | — | — | unclear. Decide what Trail *is* before polishing it |

---

## K — Tasks

The data layer, exposed. Should answer: *what's in this project and let me change it.*

| ID | Part | Why | Touches | Status |
|---|---|---|---|---|
| K1 | Track engine | What moves when you log: date holds and amounts move, or amounts hold and the date moves | Tasks, Tonight, Trail, milestones | **broken in practice — see Known defects** |
| K2 | Track editor | Configure anchor, ripple, total, comfort | Tracks | unverified |
| K3 | Search | Find anything | Tasks | ok |
| K4 | Filters (category, tag, streak, scope) | Narrow a long list | Tasks | ok |
| K5 | Sort | Order a long list | Tasks | ok |
| K6 | Task rows | Scan and open | Tasks | ok |
| K7 | Task editor | Everything editable; only title required | Tasks, tracks, streak | ok |
| K8 | Task types | A task can be several things at once | Tracks, streak, repeats | unverified in real use |
| K9 | Repeat rules | Recurring work without re-entry | Tasks | unverified |
| K10 | New-world flow | Start a project | Worlds, tasks, tracks, themes | **unclear and reading-flavoured — see BRAINSTORM** |

---

## H — Hoard

The wallet and trophy case. Should answer: *what have I earned, and what can I spend it on?*

| ID | Part | Why | Touches | Status |
|---|---|---|---|---|
| H1 | Level and XP | Long arc | XP, levels | ok |
| H2 | Currency | Spendable proof of effort | Logging, shop | unclear — never explained, name is configurable but meaning isn't |
| H3 | Loot inventory | Collection, surprise | Loot table | ok, but loot does nothing yet |
| H4 | Reward shop | Real-world bribes | Currency | unclear — editing is unintuitive; deserves its own screen |
| H5 | Milestones list | Named achievements | Tracks, biomes | ok |
| H6 | Sprint stats | Focus history | Sprints | ok |
| H7 | Settings entry | Everything configurable | All sheets | ok |

---

## S — Settings and system sheets

| ID | Part | Why | Touches | Status |
|---|---|---|---|---|
| S1 | Account | Sign in, sync, per-person data | Neon auth, sync function | **unverified end to end** |
| S2 | Backups | Three layers, restore, undo | Device storage, cloud snapshots | ok on device; cloud path unverified |
| S3 | Import / export | Data portability | Whole state | ok |
| S4 | Reduce motion | Accessibility preference | Animation | ok |
| S5 | Theme packs | Look | All screens | ok |
| S6 | Worlds list | Switch and create | Worlds | ok |
| S7 | Pace sheet | Diagnose and redistribute | Tracks | see K1 |

---

## X — Cross-cutting

These aren't screens. They break everything when they break.

| ID | Concern | Rule | Status |
|---|---|---|---|
| X1 | Local-first storage | Every action saves instantly; app fully works offline and signed out | ok |
| X2 | Sync | Local wins for what you just did; server is how other devices find out | unverified live |
| X3 | Accessibility (WCAG 2.1 AA) | One h1, no skipped headings, named controls, list semantics, 44px targets, colour never alone, dialogs trap focus | ok — keep it that way |
| X4 | Themes | Accent *text* uses `--glow-ink`; decorative fills use `--glow`. Never hardcode | ok |
| X5 | Time and dates | Local device date; "today" drives almost everything | fragile — see K1 and timezone questions |
| X6 | Generic-first | Engine knows worlds/tasks/units/tracks, never books | mostly ok; copy still leans literary |
| X7 | Naming | See NAMING.md before any rename | ok |

---

## Known defects

### K1 — Missing a day does nothing visible *(highest priority)*

**Observed:** a reading day was missed on 18 Aug. The chapters for 19 Aug onward stayed identical. Tapping **Catch up** returned "Plan redistributed. Nothing is overdue" — which is both unhelpful and arguably untrue.

**What's actually happening.** The maths is correct and the effect is invisible. `openSlots()` excludes past-dated unlogged tasks, so the missed day's units fold back into `remaining` and get spread across the days that are left. But spreading ~5 extra units across ~67 days changes each day by 0.07, which rounds to zero. So nothing on screen moves, and the user is told nothing happened.

**Why it matters more than the arithmetic.** The design promise is "nothing is ever overdue, the plan follows you." The implementation honours that so quietly that the user can't tell whether the app noticed. A promise the user can't perceive isn't a feature.

**What needs deciding, not just fixing:**
- A missed day should be *acknowledged*: "you missed Tuesday — those 5 chapters are now spread across the 67 days left" with the before/after numbers shown.
- The missed task itself needs a resolution path: absorbed into the plan, moved to today, or explicitly abandoned. Right now it lingers as permanently un-logged.
- When redistribution can't fix it — the required pace crosses what the user called comfortable — the strain warning should fire *here*, from Trail, not only on Tonight.
- "Catch up" should report what changed, or say plainly that nothing needed to change.

**Touches:** R4, R5, K1, T15, S7, X5.

### K2 — New-world flow is reading-shaped
Covered in BRAINSTORM under *Project model*. Fields like "what are you counting" and "currency" assume a counting project; "parts" turn out to be milestones but aren't named that; "world" and "theme pack" are jargon.

### K3 — Rewards, currency, loot and biomes are unexplained
Four reward systems exist and none introduces itself. A new user earns Wyrdmarks without being told what they are, collects loot that does nothing, and unlocks a "biome" with no explanation. Needs a designed reward layer, not more reward types.

---

## QA method

For each part, the test isn't "does it render." It's:

1. **What's the why?** One sentence. If it's hard to write, that's the finding.
2. **Does it do that in the good case?**
3. **Does it do that in the bad case?** Missed the day. Did half. Did triple. Changed their mind. Came back after a week. Started mid-project. Has no dates at all.
4. **Can the user tell it worked?** Silent correctness is a bug in a motivation app.
5. **What does it touch?** Check those parts still behave.
