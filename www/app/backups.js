import { App } from './state.js';
import { fmtDay, indexDays, linkMilestones, today } from './engine.js';
import { migrateTasks } from './tasks.js';
import { migrateTracks } from './tracks.js';
import { $, closeSheet, esc, normalizeA11y, paint, setErr, toast } from './ui.js';
import { Sync } from './account.js';
import { save } from './main.js';

/* ============================================================
   BACKUPS — three layers, because one is not a backup.

   1. This device   every change, immediately (browser storage)
   2. On-device history  a rolling few days, to undo a bad edit
   3. The cloud     a dated snapshot per day, kept for a month,
                    only if sync is on
   Plus a file you can download and put anywhere you like.
   ============================================================ */

export const LOCAL_SNAPS = 'onwego.snaps';
export const LEGACY_SNAPS = 'questline.snaps';
export const UNDO_KEY = 'onwego.undo';
export const KEEP_LOCAL = 5;

/* Does storage actually work here? Private browsing and a full disk both
   fail silently otherwise, and a tracker that forgets is worse than none. */
export function storageHealth() {
  try {
    localStorage.setItem('onwego.probe', '1');
    localStorage.removeItem('onwego.probe');
    return { ok: true };
  } catch (e) {
    return { ok: false, why: 'This browser is blocking local storage — private browsing usually does. Nothing will be remembered after you close the tab.' };
  }
}

export function localSnaps() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SNAPS))
        || JSON.parse(localStorage.getItem(LEGACY_SNAPS))
        || {};
  } catch (e) { return {}; }
}
export function writeLocalSnap(state) {
  try {
    const snaps = localSnaps();
    const stamp = today();
    snaps[stamp] = state;
    Object.keys(snaps).sort().slice(0, Math.max(0, Object.keys(snaps).length - KEEP_LOCAL))
      .forEach(k => delete snaps[k]);
    localStorage.setItem(LOCAL_SNAPS, JSON.stringify(snaps));
  } catch (e) { /* out of room — the live save still matters more */ }
}
export function stashUndo() {
  try { localStorage.setItem(UNDO_KEY, JSON.stringify(App.S)); } catch (e) {}
}
export function hasUndo() {
  try { return !!localStorage.getItem(UNDO_KEY); } catch (e) { return false; }
}

export function applyState(data, note) {
  if (!data || !Array.isArray(data.worlds)) { setErr('That backup is not readable.'); return false; }
  stashUndo();
  App.S = data;
  App.W = App.S.worlds.find(w => w.id === App.S.activeId) || App.S.worlds[0];
  App.S.worlds.forEach(w => {
    if (!w.days || !w.days[0] || w.days[0].fromGlobal === undefined) { if (w.days) indexDays(w); }
    linkMilestones(w); migrateTasks(w); migrateTracks(w);
  });
  save(); closeSheet(); App.view = 'tonight'; paint();
  toast(note || 'Restored');
  return true;
}

export function backupsSheet() {
  const health = storageHealth();
  const snaps = localSnaps();
  const localList = Object.keys(snaps).sort().reverse();
  const lastSaved = App.S.updatedAt ? new Date(App.S.updatedAt).toLocaleString() : 'not yet';
  const syncing = Sync.ready();
  return `<h2>Backups</h2>
    <p class="sub">Where your data is, and how to get it back.</p>
    <p class="err" id="formErr" role="alert">${health.ok ? '' : esc(health.why)}</p>

    <ul class="shelf" role="list">
      <li class="row-item"><span class="g" aria-hidden="true">📱</span>
        <span class="t"><b>This device</b><small>Saved automatically on every change. Last save: ${esc(lastSaved)}.</small></span></li>
      <li class="row-item"><span class="g" aria-hidden="true">🕓</span>
        <span class="t"><b>On-device history</b><small>${localList.length ? localList.length + ' day' + (localList.length === 1 ? '' : 's') + ' kept: ' + localList.map(fmtDay).join(', ') : 'Starts building from today'}</small></span></li>
      <li class="row-item ${syncing ? '' : 'locked'}"><span class="g" aria-hidden="true">☁️</span>
        <span class="t"><b>Cloud snapshots</b><small>${syncing ? 'One per day, kept for 30 days' : 'Off — sign in to get these'}</small></span></li>
    </ul>

    <button class="btn" style="margin-top:16px" id="bk_export">Download a copy now</button>
    ${syncing ? '<button class="btn ghost" id="bk_push">Back up to the cloud now</button>' : '<button class="btn ghost" data-sheet="account" aria-haspopup="dialog">Sign in for cloud backups</button>'}
    <button class="btn line" data-sheet="import" aria-haspopup="dialog">Restore from a downloaded file</button>
    ${hasUndo() ? '<button class="btn line" id="bk_undo">Undo the last restore</button>' : ''}

    ${localList.length ? `<h3 style="font-size:17px;margin:22px 0 8px">Restore from this device</h3>
      <ul class="shelf" role="list">${localList.map(k => `<li><button class="row-item" data-localsnap="${k}">
        <span class="g" aria-hidden="true">↩︎</span>
        <span class="t"><b>${fmtDay(k)}</b><small>Saved on this device</small></span></button></li>`).join('')}</ul>` : ''}

    ${syncing ? `<h3 style="font-size:17px;margin:22px 0 8px">Restore from the cloud</h3>
      <div id="cloudSnaps"><button class="btn line" id="bk_list">Show cloud snapshots</button></div>` : ''}

    <p class="sub" style="margin-top:20px">A restore never deletes anything straight away — the version you had is kept so you can undo it once.</p>`;
}
document.addEventListener('click', e => {
  const el = e.target.closest('#bk_export,#bk_push,#bk_list,#bk_undo,[data-localsnap],[data-cloudsnap]');
  if (!el) return;

  if (el.id === 'bk_export') {
    try {
      const blob = new Blob([JSON.stringify(App.S, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `onwego-${today()}.json`;
      a.click();
      toast('Copy downloaded — keep it in Files or Drive');
    } catch (err) { setErr('Could not create the file here. Try from the web version.'); }
    return;
  }
  if (el.id === 'bk_push') {
    toast('Backing up…');
    Sync.push(App.S).then(() => toast('Backed up to the cloud'))
                .catch(() => setErr("Couldn't reach the server. Your device copy is untouched."));
    return;
  }
  if (el.id === 'bk_list') {
    const box = $('cloudSnaps');
    box.textContent = 'Loading…';
    Sync.listSnapshots().then(list => {
      box.innerHTML = list.length
        ? `<ul class="shelf" role="list">${list.map(s => `<li><button class="row-item" data-cloudsnap="${esc(s)}">
            <span class="g" aria-hidden="true">☁️</span>
            <span class="t"><b>${fmtDay(s)}</b><small>Cloud snapshot</small></span></button></li>`).join('')}</ul>`
        : '<p class="empty"><b>No snapshots yet</b>One is written the first time this device syncs.</p>';
      normalizeA11y(box);
    }).catch(() => { box.innerHTML = '<p class="err">Could not reach the server.</p>'; });
    return;
  }
  if (el.dataset.localsnap) {
    if (el.dataset.armed !== '1') {
      el.dataset.armed = '1';
      el.querySelector('.t small').textContent = 'Tap again to restore this version';
      toast('Tap again to confirm the restore');
      return;
    }
    applyState(localSnaps()[el.dataset.localsnap], 'Restored from ' + fmtDay(el.dataset.localsnap));
    return;
  }
  if (el.dataset.cloudsnap) {
    if (el.dataset.armed !== '1') {
      el.dataset.armed = '1';
      el.querySelector('.t small').textContent = 'Tap again to restore this version';
      toast('Tap again to confirm the restore');
      return;
    }
    const stamp = el.dataset.cloudsnap;
    toast('Fetching…');
    Sync.getSnapshot(stamp)
      .then(data => applyState(data, 'Restored from ' + fmtDay(stamp)))
      .catch(() => setErr('Could not fetch that snapshot.'));
    return;
  }
  if (el.id === 'bk_undo') {
    let prev = null;
    try { prev = JSON.parse(localStorage.getItem(UNDO_KEY)); } catch (err) {}
    if (!prev) { setErr('Nothing to undo.'); return; }
    try { localStorage.removeItem(UNDO_KEY); } catch (err) {}
    applyState(prev, 'Restore undone');
    return;
  }
});
