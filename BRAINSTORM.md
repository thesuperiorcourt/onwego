# BRAINSTORM

Ideas, direction and open questions. Not a task list — PARTS.md and HANDOFF.md hold the work. This is where the thinking lives so it doesn't get lost between sessions.

Sections are by **category**, not by tab, because most of these cut across screens. Each idea keeps enough detail to be actionable later; nothing here is decided until it moves into HANDOFF.

---

## 1. Product direction

**The pitch.** If Monday is your workweek project manager, On We Go is your Saturday morning cartoons. Video-game Asana. Fantasy Life IRL. The point is to make productivity *fun*, not to make a task list with a progress bar bolted on.

**The core loop should be the same shape as an idle/incremental game**: almost no setup friction, immediate gratification, constant upgrades, visible transformation, very little dead time.

**What this is not.** Not a habit tracker with streak guilt. Not a decorating game where the burden is arranging furniture. Not a checklist.

---

## 2. Gamification

The heart of the product, and the part that will take longest to get right. Not the core system — the core is projects and pacing — but the reason anyone stays.

### Layered progression
The spine everything hangs from: upgrades, loot, skill trees, prestige. Effort compounds visibly. Manual work should evolve into automation — the "earn your way out of grunt work" arc that idle games do so well. In a productivity context, automation can mean *permission*: the app granting you the right to skip, batch, or auto-complete something you've proven you can do.

### Depth to aim at
Many upgrades (think in the hundreds, not the dozens). Equipment or loadout combinations. Secrets. Jackpots. Deckbuilding-adjacent strategy where choices interact. New mechanics between areas so the game changes as you go, rather than the same loop with bigger numbers.

### Structure metaphors worth stealing
Treat each new project like a business: staff, products, expansions, ingredients, production lines. Familiar job loops. Buy and sell loot, rewards and resources. Clear gear upgrades. Visible environmental progress.

### Proof of work — the load-bearing idea
Everything above collapses if rewards are free. **You have to actually do the thing.** Open the book and type the first sentence of the next chapter. Take the walk. Photograph the sent email. Screenshot the call you made.

- Difficulty should scale by choice — some people want the honour system, some want the receipt.
- Proof needs storage (photos, text snippets) and must be accounted for in backups and sync. This has real cost and privacy implications; decide early whether proof is stored or verified-then-discarded.
- Proof is also the anti-cheat for any future social or competitive layer.

### Optional depth, for people who want it
Backstories, characters, exploration, design and decoration — for narrative momentum and personality. Consequential choices. Mini-games. Strictly optional: the setup burden must stay near zero for people who just want to get through their week.

### Design constraints for all of the above
- No friction between opening the app and playing.
- No dead time.
- The reward layer must introduce itself. Four unexplained currencies is worse than one explained one.
- Nothing punishes. Difficulty is opt-in; failure is never humiliating.

---

## 3. Project model

Currently the new-project flow assumes you're counting your way through a book. It should feel like a project management tool that happens to be a game.

**Naming and framing**
- "New World" → just **New**. "World" is jargon; normalise for a general audience.
- "Theme pack" → **theme**. (Themes as unlockable rewards or paid content is a good future hook.)
- "Parts" turned out to mean **milestones** — name them that, and make them optional.
- "Biome" means nothing to a new user. Needs a real word and a real explanation of what it does.

**Fields to rethink**
- *What are you counting* — assumes counting. Counting should be a project **type**, with a hint that it suits books or a collection of things. Plenty of projects are just a list of work.
- *Currency* — unclear what it is or does. Maybe a boolean first ("track a currency?") with an optional name second.
- *Dates* — currently one start and one end. Real projects have no dates, or unknown dates, or phases, or repeats, or seasons. Needs a proper date model.
- *Milestones* — nice, especially tied to unlocks. Optional.

**Worth studying:** what Asana, Monday and Notion expose at project level — templates, phases, dependencies, custom fields, views, statuses, owners. Take what fits a single-player game; leave the enterprise ceremony.

---

## 4. UI and navigation

Overall structure is unclear. Full customisation is the goal, but the *default* has to be normalised and simple — a new user should understand the app before they configure it.

- Decide what each tab is for in one sentence, then make the tab prove it. Trail especially (see PARTS R6).
- Rewards and biomes deserve their own screen, not a corner of Hoard.
- Things that are tappable should look tappable (PARTS T2, T3).
- Configuration is buried; discovery is poor.
- Fewer concepts, better explained, beats more concepts.

---

## 5. Production readiness

Moved to its own document — see `PRODUCTION.md`. It covers legal and compliance, the third-party inventory, security gaps, subscription design, operations, and the four decisions that are expensive to reverse (data model, proof-of-work media storage, bundle identifier, payment provider).

Two things from it worth carrying in your head while designing anything here:

- **Don't paywall progression.** Cosmetics, capacity and convenience can be sold. Advancement can't — locking a skill tree behind money turns earned achievement into a purchase and poisons the mechanic.
- **Proof-of-work is the expensive idea.** Decide whether proof is stored or verified-and-discarded before building it. Discarding is cheaper, more private, and still works.

## 6. Naming and rebrand

The app will likely be renamed again before launch. See NAMING.md for every place a name appears and the checklist for changing it.

---

## 7. Platform

- **TestFlight** matters early — not just to distribute, but to find out what the App Store side demands before it's expensive to discover.
- Sign in with Apple isn't offered by the current auth provider; it becomes a requirement for public release alongside Google sign-in.
- Native capabilities worth considering later: notifications, widgets, Shortcuts, Live Activities for a running sprint.

---

## 8. House style

**Talk to agents as colleagues.** Prompts and docs address whoever is working on this — developer, designer, whoever — as a member of the team. No coy phrasing, no theatrical AI framing.

**Scrub AI and agent language from the project itself.** Not to hide that AI was used — that gets disclosed honestly — but because product copy, code comments and docs should read as a team's work, not as a transcript of tool use.

**Voice in the UI:** deadpan, specific, never chirpy. "Attention is garbage tonight" is the register. Some existing copy leans literary ("the hook", "bait") and should be checked against a general audience.
