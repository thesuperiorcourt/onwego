# COSTS — the money-and-legal non-negotiable

**Before building anything with a cost attached — money, an ongoing legal obligation, or your own time/energy invested in something you might not actually want — stop and tell the owner what it costs, including what it could cost later.** This is non-negotiable #8 in `HANDOFF.md`; this file is where the reasoning and the checklist live so the rule doesn't become a slogan.

This isn't about avoiding cost. It's about the owner deciding with the real number in front of her, not discovering it after the fact — and about surfacing costs that are invisible today because usage is low, but won't stay invisible.

---

## The rule, precisely

Before implementing (not just designing) anything that:

- costs real money now, even a small amount,
- **could** cost money later even if it's free today (usage-based pricing, a free tier with a ceiling, a service that changes its pricing),
- creates a recurring or scaling cost (per-user, per-request, per-GB, per-email, per-API-call),
- creates a legal obligation (a privacy policy claim, a compliance requirement, a contract, a subscription term), or
- asks the owner to invest significant time or energy into something whose value is still unproven,

**stop and say so before writing the code**, not after. State:

1. What it costs today, at current (near-zero) usage.
2. What it costs at realistic future scale — 100 users, 1,000 users, whatever the honest next order of magnitude is for this feature specifically.
3. Whether the cost is fixed, per-user, or usage-based — that distinction is the whole ballgame for whether growth is good news or a bill.
4. Whether there's a free or cheaper alternative, and what's given up by taking it.
5. Whether the cost can be delayed — built later, when it's actually needed, rather than now.

This applies even to things that feel small. A $9/month API key doesn't feel like a decision. Twelve of those do. Tonight's Netlify credit overrun (see `STACK.md`) is the concrete example of exactly this: free-tier usage that felt costless turned into a forced upgrade, discovered only after the fact rather than flagged in advance. That's the failure mode this file exists to prevent from happening with money or legal exposure instead of build credits.

---

## What's already true here (don't re-derive it, just apply it)

These principles are already settled in this project's docs — this section exists so this file states them explicitly under the cost banner, not to introduce new ones. See `HANDOFF.md` and `PRODUCTION.md` for the full context behind each.

**One-way doors vs two-way doors** (`HANDOFF.md`). Spend real evaluation time on decisions that are expensive to reverse — a storage provider, a data model, a payment provider. A routine change later doesn't need this level of ceremony.

**Don't paywall progression** (`PRODUCTION.md`). Cosmetics, capacity and convenience can be sold. Advancement can't — locking a skill tree or a milestone behind money turns earned achievement into a purchase and poisons the mechanic this whole app is built on.

**Subscription changes never destroy or hide data.** If someone lapses, their history stays visible; only new premium-only creation is restricted. See `PRODUCTION.md`'s Subscription design section for the full free/premium sketch.

**Sync stays free.** An app that forgets your work unless you pay isn't trustworthy, and trust is the whole basis of a productivity tool.

---

## Paywall tone, when there is one

Not yet built, but worth having the register settled before it is, so it isn't improvised under launch pressure:

- Warm and low-pressure. *"Unlock richer worlds with Premium"* over *"Upgrade now!"*
- Never interrupts active work — no upgrade prompt mid-task, mid-log, mid-anything the user is in the middle of doing.
- Dismissible, always.
- No countdown timers, no guilt language, no dark patterns.
- Contextual to what the user was just trying to do, not a generic banner.

---

## Legal and compliance — pointer, not a duplicate

`PRODUCTION.md`'s "Legal, compliance and business" section is the actual source of truth for what's required before public launch (privacy policy, ToS, GDPR/CCPA, business identity, support contacts) and `PRODUCTION.md`'s "Third-party services inventory" tracks what each provider touches. Don't duplicate that table here — update it there, and this file just carries the standing rule that triggers a look at it: **any new third-party service gets a row in that inventory in the same commit that adds it**, not sometime later.

One addition worth stating plainly, since it wasn't explicit before: **legal documents should be reviewed by a qualified attorney before public launch**, not just internally drafted and shipped. Drafting them well in advance of launch is still worth doing — it forces the data-handling questions to get answered honestly — but "we wrote it" isn't the same bar as "it's been reviewed."

---

## Specific cost-scaling risks already known for this project

Pulled forward from `STACK.md`'s "Cost triggers to watch" so they're visible under this banner too, not because they need two homes long-term:

- **Netlify function invocations** — a sync-on-every-change app burns through the free tier faster than a static site does. Already proven true tonight, not hypothetical.
- **Neon compute hours** — free tier suspends when idle; fine for personal use, worth watching if usage becomes constant across many accounts.
- **Media storage, if proof-of-work photos are ever stored** — the only cost line here that grows with every user, forever, rather than being a fixed or one-time cost. The strongest argument for verify-and-discard over storing (see `PRODUCTION.md` §5).
- **Any future AI/LLM API integration** — flagged as an open question in `BRAINSTORM.md` rather than decided; whichever way it's built (the owner's own API key vs. bring-your-own-key vs. a free tier that runs out), the cost-and-who-pays question needs answering before it ships, not after someone's already using it.
- **RevenueCat's 1%** — only kicks in above $2,500/month tracked revenue, and by then it's a good problem to have, not a launch blocker.

---

## When this file itself needs a look

Whenever a new paid service is added, whenever a free-tier ceiling gets hit (like tonight), or whenever the subscription/paywall design actually gets built rather than sketched. Otherwise it doesn't need proactive revisiting — see `HANDOFF.md`'s doc-audit cadence for the general rule.
