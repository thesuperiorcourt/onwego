# Changelog

Resolved work, newest first. `HANDOFF.md` holds what's still open; this is where finished items go so HANDOFF doesn't accumulate stale checkmarks. Dated by when it shipped, not by feature area — see `PARTS.md` for current status per part.

---

## 2026-08-19

**Row-level security armed.** `DATABASE_URL` now connects as `onwego_api`, a restricted role created by `db/rls_role.sql`, instead of the owner role. The `app_state_own`/`app_snapshot_own` policies in `db/schema.sql` existed since the schema was written but were never actually enforced — the owner role bypasses RLS regardless of policy. `netlify/functions/sync.mjs` now scopes every query inside a transaction that sets `app.user_id` first (a `scoped()` helper), which is what lets the policies fire instead of seeing an empty session setting. Verified live: a full write (state insert, snapshot insert, `prune_snapshots`) succeeded after the cutover, exercising every grant the new role has.

**Live auth handshake confirmed.** Signed in on the deployed site and watched it work, rather than trusting the client code was correct because it matched Neon's docs: the session survived the Google redirect and persisted across visits, `GET /api/sync` returned real data repeatedly, and `POST /api/sync` returned a real `{"ok":true,"updatedAt":...,"snapshot":...}` body — proof the write lands in Postgres, not just that the function reports success. Still unverified: the email-code sign-in path (only Google tried live) and Safari specifically (checked in Chromium).

**Added `VISION.md`.** The v3 product vision — a far more complete picture of the PM layer, the game layer, and how they connect than what was in `BRAINSTORM.md`. Kept as its own versioned document rather than merged in, and pointed to prominently from the top of both `HANDOFF.md` and `BRAINSTORM.md`.

**`www/index.html` split into ES modules.** The client was a single ~3200-line inline script; it's now `www/app/main.js` plus one module per seam (`store`, `themes`, `engine`, `tasks`, `tracks`, `scene`, `ui`, `account`, `backups`, `screens/*`), with the Maasverse campaign isolated in `www/seed/campaign.js` so removing it before launch is a deletion, not surgery. Behavior verified unchanged by running the full test suite before and after. Surfaced and fixed a few real bugs along the way: a couple of missing imports the extraction tooling's regex couldn't catch cleanly, one `dataset.view` corruption from the same tooling, a circular-import ordering issue in `ui.js`, and a vendored-SDK import path that was only correct when the code lived at the `www/` root.

**Missed-task resolution added to Today.** The three resolutions the Pace sheet already offered (move to today, fold in, let it go) now also live directly on Today's Missed section cards, with a small neutral note explaining why they're there — no detour through Timeline or Pace required.

**Garden folded into Rewards.** Five tabs became four (Today / Timeline / Tasks / Rewards); `renderGrove()` merged into `renderHoard()`. README's "Turn on sync" section was rewritten — it still described the old passphrase/Netlify-Blobs sync system, which no longer exists in the code.

**K1 fixed — missed days now redistribute visibly.** A reading day going by unlogged used to leave the plan looking untouched and "Catch up" claimed nothing was overdue, which was both unhelpful and untrue. Timeline now shows a real status per missed day ("Missed — needs a decision" until resolved, then "Folded into the plan" or "Rested"); the Pace sheet reads the live track engine (`trackStatus`, `openSlots`, `missedTasks`) instead of the dead legacy fields it was disconnected from; and a Missed section now sits on Today itself, ahead of Up next. Tab names normalized off night-specific framing in the same pass: Tonight → Today, Trail → Timeline, Hoard → Rewards, Grove folded into Rewards, "Coming up" → "Up next".

**Self-hosted the fonts and auth SDK; wired up error monitoring.** Figtree and Fraunces, and the Neon auth client, no longer load from a CDN. Client and function errors now funnel to Sentry via `netlify/functions/lib/report.mjs` — not yet active in production, since `SENTRY_DSN` isn't set (still tracked in HANDOFF's open items).

**Account deletion built.** Two-tap delete in Settings → Account erases the cloud copy and, once `NEON_API_KEY`/`NEON_PROJECT_ID`/`NEON_BRANCH_ID` are set in Netlify, the login itself — not yet set, so live deletion currently erases data but leaves the login behind (still tracked in HANDOFF's open items).

**Fixed the sync function leaking stack traces on database init failure**, and removed dead code from the legacy passphrase-based sync system (`replan()`, `syncTasksFromPlan()`, the original `Sync.pull`/`push`/`reconcile` — all fully shadowed once the Neon-Auth bearer-token system was built, confirmed unreferenced anywhere in the app or tests).
