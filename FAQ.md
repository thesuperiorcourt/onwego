# FAQ

Questions a user would actually ask, organized by category. Will eventually live in the app's own Settings — write answers in that voice (deadpan, specific, never chirpy — see `HANDOFF.md`'s non-negotiable #6) even here, so moving them later is a copy-paste, not a rewrite.

**Status marks:**
- ✅ **Answered** — verified against the actual code or tested behavior, not guessed.
- 🟡 **Needs answer** — a real question worth having ready, but the honest answer needs checking, deciding, or building first. Come back to these before launch.

---

## Accounts and sign-in

**If I sign in with Google, then later try to sign in with just my email — do I get a second account, or does it recognize me?** 🟡
This needs checking, not assuming, before it ships as a real answer. What's known: Neon Managed Better Auth handles both Google and email-code sign-in, and the app's own code (`www/app/account.js`) treats whichever session comes back as *the* signed-in account — it doesn't do its own email-matching or account-linking logic. Whether Better Auth links a Google sign-in and an email-code sign-in that share the same address into one account, or creates two separate ones, is Neon's behavior to verify directly (create a Google account, sign out, try the same email via the code path, see what comes back) rather than infer from this app's code. Verify before launch — this is exactly the kind of thing a real user will hit and be confused by if it's wrong.

**Do I need an account at all?** ✅
No. The app is local-first — logging a task, building a project, everything works fully offline and signed out. An account only adds sync across devices and cloud backups. Sign out at any time and the device keeps everything it had.

**What happens to my data if I delete my account?** ✅
Your cloud data (`app_state`, every snapshot) is erased immediately. The login itself is also removed, so the email can be used to sign up fresh later as a new account. Anything already saved locally on a device that was offline at the time isn't reached by deletion — it stays on that device until the app itself is deleted there. See `PRODUCTION.md`'s account deletion section for the exact mechanics.

**Is my data private? Who can see it?** ✅ (partial — full privacy policy still to come)
Each account's data is isolated at the database level (row-level security, not just the app trusting itself to filter correctly — see `CHANGELOG.md`, 2026-08-19). Nothing is sold, and nothing is used for advertising. A full privacy policy — the legally binding version of this answer — doesn't exist yet; see `PRODUCTION.md`'s legal section for what's still needed before public launch.

**What happens to my progress if I switch devices?** ✅
Sign in with the same account on the new device. It pulls your cloud copy down. If the new device already had unsynced local progress of its own (rare — usually only the very first sign-in on a fresh device), whichever side has the newer timestamp wins; nothing is silently merged or lost, see `CHANGELOG.md`'s sign-in verification entry for how this was checked.

---

## Tasks, tracks and progress

**Can I undo a task I logged by mistake?** ✅
Yes — open the task, "Undo this log." Works for any date, not just today, and reverses the XP/currency/units it granted. Settings also has "Undo today's log" as a quick bulk version for anything logged today specifically.

**If I undo a log, but I already spent the currency it gave me on something in the rewards shop — what happens?** 🟡
Right now: the currency is subtracted (clamped at zero, so your balance won't go negative), but the reward you bought with it stays bought. The reward and the currency that paid for it silently decouple. This is a known, real gap — see `BRAINSTORM.md`'s "Undoing a reward, after the fact" for the full shape of the problem and why it's not a quick fix.

**What happens if I miss a day?** ✅
Nothing is marked overdue or red. A missed day shows up on both Today (a dedicated Missed section) and Timeline, with a real choice: move it to today, fold it into the plan without logging it, or let it go. See `PARTS.md` K1 for the full mechanics.

**Does missing a day reset my streak?** ✅
Not in the sense of a dramatic reset or lost history — but a streak specifically counts *consecutive* logged days ending today, so a gap does mean the number you see is smaller than before the gap. Nothing is punished, nothing announces the miss, and logging today starts building the count again immediately, same as any other day.

**What's the difference between the Timeline tab and the Tasks tab? They seem to show the same things.** 🟡
Genuinely not resolved yet — see `BRAINSTORM.md`'s "Tasks and Timeline overlap" section. The working direction is that Timeline becomes the one task-list view (carrying over Tasks' filtering and editing), with what's now the Tasks tab reframed as Tracks (projects), but this hasn't shipped.

**Can I use this for something other than reading?** ✅
Yes — that's the actual point. The reading campaign that ships by default is example seed content, not the product; the engine has no idea what a "book" or "chapter" is, only worlds, tasks, units and dates. A kitchen remodel, a training block, a job hunt all fit the same mechanics. See README's "About the reading data" section.

---

## Rewards and the economy

**Can I ever run out of ways to spend my currency, or run out of currency to spend?** 🟡
Not decided or checked against real use yet — see `BRAINSTORM.md`'s "Does everyone actually earn enough to spend it?" The reward shop's default prices were tuned against a near-daily reading campaign; whether that holds up for a project with only a handful of tasks total, or one with no deadline at all, hasn't been verified.

---

## Data, backups and export

**Can I export my data?** ✅
Yes — Settings → Backups → download a copy, a full JSON file of everything. Cloud snapshots (one per day, kept 30 days) and on-device history (last 5 days) are also there if you need to undo further back than the last action.

**Can I bulk-edit my tasks in a spreadsheet, then bring them back in?** 🟡
Not built. A CSV round trip is a real idea, not yet designed past the concept stage — see `BRAINSTORM.md`'s note under the Project model section for the shape of the problem (mainly: how references to a category or track survive a spreadsheet round trip).

---

## Cost and the business side

**Is this free? Will it always be free?** 🟡
No pricing has been decided or built yet. The working principle (see `PRODUCTION.md`'s Subscription design and `COSTS.md`) is that sync and the core logging loop stay free regardless of what premium ends up being — an app that forgets your work unless you pay isn't one worth trusting. What's actually behind a paywall, if anything, isn't decided.
