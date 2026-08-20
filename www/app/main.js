/* main.js is the entry point index.html loads, so it's also the natural
   place to wire every module together — hence the long import list below,
   most of which exists only so a test run can reach into named app
   internals the way it always could when everything lived in one script.
   See the test bridge at the bottom of this file. */
import { App } from './state.js';
import { Store } from './store.js';
import { THEMES } from './themes.js';
import { LEVELS, PAYOUT, LOOT, RARITY_W, DEFAULT_SHOP, iso, parseISO, today, fmtDay, fmtLong, daysBetween, unitLabel, bookAt, bookOffset, totalUnits, baitFor, indexDays, dayFor, levelFor, rollLoot, newProgress, makeWorld, campaignPct, streak, nextMilestone, daysLeft, RARITY_LABEL, biomeName, FLORA_FOR, grantLoot, showDrop, checkMilestones, linkMilestones, seedMaasverse } from './engine.js';
import { mulberry, floraSVG, sceneSVG, motes } from './scene.js';
import { TASK_FIELDS, SHOW_FIELDS, SORTS, SCOPES, newTask, defaultHome, isUntouchedOldHome, migrateTasks, taskCategories, taskTags, isLogged, filterTasks, taskRow, renderTaskList, renderTasks, taskEditor, homeConfigSheet, sectionEditor, resolveMissed, logTask, refreshTaskList, toggleIn, readTaskForm } from './tasks.js';
import { TASK_TYPES, REPEATS, ANCHORS, RIPPLES, addDays, hasType, newTrack, trackTasks, trackFor, trackDone, openSlots, isMissed, missedTasks, trackStatus, recomputeTrack, relabelLinked, fitSlotsToDeadline, recomputeAll, tierImpact, spawnRepeat, migrateTracks, trackBlock, strainCard, trackEditor } from './tracks.js';
import { taskTiers, taskCard, renderTonight } from './screens/tonight.js';
import { renderTrail } from './screens/trail.js';
import { renderHoard } from './screens/hoard.js';
import { $, esc, DOCK, normalizeA11y, paint, toast, setErr, FOCUSABLE, closeSheet, mountDialog, openSheet, openDrop, SHEETS, sprintFace } from './ui.js';
import { Sync, AUTH_CONFIG, Account, accountSheet } from './account.js';
import { LOCAL_SNAPS, LEGACY_SNAPS, UNDO_KEY, KEEP_LOCAL, storageHealth, localSnaps, writeLocalSnap, stashUndo, hasUndo, applyState, backupsSheet } from './backups.js';
import { MAASVERSE_CAMPAIGN } from '../seed/campaign.js';

/* ------------------------------ error reports ------------------------------
   Reports a JS error's message, stack and where it happened — nothing about
   what the person was doing, no app state, no task titles. Works signed out,
   since the app has to. Best-effort: a failed report never surfaces to the
   user, and the same error is only sent once per page load so a loop of the
   same failure can't spam the endpoint. */
(function () {
  const seen = new Set();
  let sent = 0;
  function report(message, stack) {
    if (!message || sent >= 20) return;
    const key = message + '|' + (stack || '').slice(0, 200);
    if (seen.has(key)) return;
    seen.add(key); sent++;
    const base = (window.ONWEGO_CONFIG && window.ONWEGO_CONFIG.apiBase) || '';
    try {
      fetch(base + '/api/error', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: String(message).slice(0, 500), stack: stack ? String(stack).slice(0, 2000) : undefined })
      }).catch(() => {});
    } catch (e) {}
  }
  window.addEventListener('error', e => report(e.message, e.error && e.error.stack));
  window.addEventListener('unhandledrejection', e => {
    const r = e.reason;
    report(r && r.message ? r.message : String(r), r && r.stack);
  });
})();

export function save() {
  App.S.updatedAt = Date.now();
  Store.save(App.S);
  /* One on-device snapshot a day, so a bad edit is recoverable offline. */
  if (typeof writeLocalSnap === 'function' && App.S._snapDay !== today()) {
    App.S._snapDay = today();
    writeLocalSnap(JSON.parse(JSON.stringify(App.S)));
  }
  Sync.schedulePush();
}

/* Runs once on load: restore local state (or seed it), paint, then try sync. */
(async function boot() {
  App.S = await Store.load();
  if (!App.S || !App.S.worlds || !App.S.worlds.length) {
    const m = seedMaasverse();
    App.S = { v:1, activeId:m.id, worlds:[m] };
    await Store.save(App.S);
  }
  App.W = App.S.worlds.find(w => w.id === App.S.activeId) || App.S.worlds[0];
  App.S.worlds.forEach(w => { if (!w.days[0] || w.days[0].fromGlobal === undefined) indexDays(w); linkMilestones(w); migrateTasks(w); migrateTracks(w); });
  paint();
  const health = (typeof storageHealth === 'function') ? storageHealth() : { ok:true };
  if (!health.ok) toast('Storage is blocked here — nothing will be saved');
  if (typeof Account !== 'undefined') Account.loadCfg();
  if (Sync.ready()) {
    const pulled = await Sync.reconcile();
    if (pulled) {
      App.S.worlds.forEach(w => { if (!w.days[0] || w.days[0].fromGlobal === undefined) indexDays(w); linkMilestones(w); migrateTasks(w); migrateTracks(w); });
      paint();
    }
  }
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && Sync.ready()) {
      const pulled = await Sync.reconcile();
      if (pulled) { App.S.worlds.forEach(w => linkMilestones(w)); paint(); }
    }
  });
})();

/* Test-only bridge: the test suite used to reach app internals via
   dom.window.eval() when everything lived in one classic script, sharing
   its global scope. Modules don't have a shared global scope, so this
   gives the test harness one, scoped to this file's own imports, and only
   when the harness explicitly asks for it before importing main.js. Never
   installs itself in a real page load. */
if (typeof globalThis !== 'undefined' && globalThis.__ONWEGO_TEST__) {
  window.__onwegoEval = code => eval(code); // eslint-disable-line no-eval
}
