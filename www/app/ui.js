import { App } from './state.js';
import { THEMES } from './themes.js';
import { bookAt, checkMilestones, fmtDay, grantLoot, indexDays, linkMilestones, makeWorld, showDrop, today, totalUnits, unitLabel } from './engine.js';
import { homeConfigSheet, logTask, migrateTasks, renderTasks, resolveMissed, unlogTask } from './tasks.js';
import { migrateTracks, missedTasks, openSlots, recomputeAll, trackStatus } from './tracks.js';
import { renderTonight } from './screens/tonight.js';
import { renderTrail } from './screens/trail.js';
import { renderHoard } from './screens/hoard.js';
import { Account, accountSheet } from './account.js';
import { applyState, backupsSheet } from './backups.js';
import { save } from './main.js';

export const $ = id => document.getElementById(id);
export const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* --------------------------------- shell ---------------------------------- */
export const DOCK = [
  { id:'tonight', g:'🌙', label:'Today' },
  { id:'trail',   g:'🗺️', label:'Timeline' },
  { id:'tasks',   g:'▤',  label:'Tasks' },
  { id:'hoard',   g:'✨', label:'Rewards' }
];

/* Lists with their bullets removed lose list semantics in Safari + VoiceOver,
   and the three win buttons should read as one group. Applied after every
   render so no template can forget it. */
export function normalizeA11y(root) {
  root.querySelectorAll('ul.shelf,ol.trail,ul.loot-grid,ul.swatches,ul.tasklist')
      .forEach(l => l.setAttribute('role', 'list'));
  root.querySelectorAll('.tiers').forEach(t => {
    if (!t.getAttribute('role')) {
      t.setAttribute('role', 'group');
      t.setAttribute('aria-label', 'How much you got done');
    }
  });
}

export function paint() {
  const th = THEMES[App.W.theme] || THEMES.midnight;
  Object.entries(th.vars).forEach(([k,v]) => document.documentElement.style.setProperty(k, v));
  document.documentElement.classList.toggle('calm', !!(App.S.prefs && App.S.prefs.calm));
  document.querySelector('meta[name=theme-color]').setAttribute('content', th.vars['--sky-1']);

  const html = { tonight:renderTonight, trail:renderTrail, tasks:renderTasks, hoard:renderHoard }[App.view]();
  const label = (DOCK.find(d => d.id === App.view) || {}).label || 'On We Go';
  document.title = label + ' · On We Go';
  $('main').innerHTML = `<section class="screen" aria-labelledby="screenTitle">${html}</section>`;
  $('dock').innerHTML = DOCK.map(d => `<button data-view="${d.id}"${App.view === d.id ? ' aria-current="page"' : ''}>
    <span class="g" aria-hidden="true">${d.g}</span>${d.label}</button>`).join('');
  normalizeA11y($('main'));
}
export function toast(msg) {
  const live = $('live');
  live.innerHTML = '';
  const el = document.createElement('p');
  el.className = 'toast'; el.textContent = msg;
  live.appendChild(el);
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => { if (el.parentNode) el.remove(); }, 4000);
}
export function setErr(msg) {
  const e = $('formErr'); if (e) e.textContent = msg;
  toast(msg);
}
export const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

export function closeSheet(restore) {
  const had = document.querySelector('.sheet,.drop');
  document.querySelectorAll('.veilbg,.sheet,.drop').forEach(n => n.remove());
  if (window._timer) { clearInterval(window._timer); window._timer = null; }
  window._paused = false;
  if (had && restore !== false && App.lastFocus && document.contains(App.lastFocus)) App.lastFocus.focus();
  App.lastFocus = null;
}

export function mountDialog(node, cls) {
  node.setAttribute('role', cls === 'drop' ? 'alertdialog' : 'dialog');
  node.setAttribute('aria-modal', 'true');
  node.setAttribute('aria-labelledby', 'dialogTitle');
  document.body.appendChild(node);
  const first = node.querySelector('#dialogTitle') || node.querySelector(FOCUSABLE);
  if (first) first.focus();
}

/* Tab stays inside the open dialog; Escape closes it. */
document.addEventListener('keydown', e => {
  const dlg = document.querySelector('.sheet,.drop');
  if (!dlg) return;
  if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
  if (e.key !== 'Tab') return;
  const items = [...dlg.querySelectorAll(FOCUSABLE)].filter(n => n.offsetParent !== null || n === document.activeElement);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && (document.activeElement === first || document.activeElement === dlg || !dlg.contains(document.activeElement))) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
});

export function openSheet(html, opener) {
  const keep = opener || (document.activeElement !== document.body ? document.activeElement : null);
  closeSheet(false);
  App.lastFocus = keep;
  const v = document.createElement('div');
  v.className = 'veilbg'; v.onclick = () => closeSheet();
  document.body.appendChild(v);
  const s = document.createElement('div'); s.className = 'sheet';
  s.innerHTML = '<div class="grab" aria-hidden="true"></div>' +
    '<div class="sheet-bar"><span></span><button class="close" data-close="1" aria-label="Close">' +
    '<span aria-hidden="true">\u2715</span></button></div>' +
    html.replace('<h2>', '<h2 id="dialogTitle" tabindex="-1">');
  normalizeA11y(s);
  mountDialog(s, 'sheet');
}

export function openDrop(html) {
  const keep = document.activeElement !== document.body ? document.activeElement : null;
  closeSheet(false);
  App.lastFocus = keep;
  const d = document.createElement('div'); d.className = 'drop';
  d.innerHTML = `<div class="drop-card">${html.replace('<h2>', '<h2 id="dialogTitle" tabindex="-1">')}</div>`;
  d.addEventListener('click', e => { if (e.target === d) closeSheet(); });
  mountDialog(d, 'drop');
}
/* ------------------------------- sheets ----------------------------------- */
export const SHEETS = {
  worlds() {
    return `<h2>Worlds</h2><p class="sub">Each world has its own campaign, grove, currency and theme.</p>
      <ul class="shelf">
        ${App.S.worlds.map(w => `<li><button class="row-item ${w.id === App.W.id ? 'claimed' : ''}" data-world="${w.id}" aria-current="${w.id === App.W.id ? 'true' : 'false'}">
          <span class="g" aria-hidden="true">${w.id === App.W.id ? '📍' : '🌍'}</span>
          <span class="t"><b>${esc(w.name)}</b><small>${w.id === App.W.id ? 'Currently open · ' : ''}${esc(w.tagline || (w.books.length + ' parts'))} · ${THEMES[w.theme].name}</small></span>
        </button></li>`).join('')}
      </ul>
      <button class="btn" style="margin-top:16px" data-sheet="newworld">Build a new world</button>`;
  },
  newworld() {
    return `<h2>New world</h2><p class="sub">Anything with parts and a deadline works: a series, a course, a season, a backlog.</p>
      <p class="err" id="formErr" role="alert"></p>
      <label class="f" for="nw_name"><span>Name</span></label>
      <input id="nw_name" placeholder="Stormlight, or Spanish, or the garage" style="margin-bottom:14px">
      <label class="f" for="nw_unit"><span>What are you counting?</span></label>
      <input id="nw_unit" placeholder="chapter" value="chapter" style="margin-bottom:14px">
      <label class="f" for="nw_cur"><span>Currency name</span></label>
      <input id="nw_cur" placeholder="Coins" value="Coins" style="margin-bottom:14px">
      <label class="f" for="nw_theme"><span>Theme pack</span></label>
      <select id="nw_theme" style="margin-bottom:14px">
        ${Object.entries(THEMES).map(([k,t]) => `<option value="${k}">${t.name} — ${t.blurb}</option>`).join('')}
      </select>
      <div style="display:flex;gap:10px">
        <div style="flex:1"><label class="f" for="nw_start"><span>Start</span></label><input type="date" id="nw_start" value="${today()}"></div>
        <div style="flex:1"><label class="f" for="nw_end"><span>End</span></label><input type="date" id="nw_end"></div>
      </div>
      <label class="f" for="nw_parts"><span>Parts <span class="hint">— one per line, as name, count</span></span></label>
      <textarea id="nw_parts" rows="4" placeholder="Book one, 42&#10;Book two, 38" style="margin-bottom:14px"></textarea>
      <button class="btn" id="nw_go">Create world</button>`;
  },
  themes() {
    return `<h2>Theme packs</h2><p class="sub">The pack paints the sky, the ground and what grows. Change it any time — nothing resets.</p>
      <ul class="swatches">
        ${Object.entries(THEMES).map(([k,t]) => `<li><button class="sw" data-theme="${k}" aria-pressed="${App.W.theme === k}"
          aria-label="${esc(t.name)} — ${esc(t.blurb)}${App.W.theme === k ? '. Currently selected' : ''}"
          style="background:linear-gradient(160deg,${t.vars['--sky-1']},${t.vars['--sky-3']})">
          <span class="dot" aria-hidden="true" style="background:${t.vars['--glow']}"></span>
          ${App.W.theme === k ? '<span class="on" aria-hidden="true">✓</span>' : ''}
          <span class="n">${t.name}</span></button></li>`).join('')}
      </ul>
      <p class="sub" style="margin-top:16px">${Object.values(THEMES).map(t => `<b>${t.name}</b> — ${t.blurb}`).join('<br>')}</p>`;
  },
  pace() {
    const tr = App.W.tracks && App.W.tracks[0];
    if (!tr) {
      return `<h2>Pace</h2><p class="sub">Nothing is pinned down yet — there's no plan to redistribute.</p>
        <button class="btn line" onclick="closeSheet()">Close</button>`;
    }
    const st = trackStatus(App.W, tr);
    const missed = missedTasks(App.W, tr);
    const todaySlot = openSlots(App.W, tr).find(x => x.date === today());
    const before = todaySlot ? (todaySlot.max || 0) : null;
    const after = Math.round(st.perSlot);
    return `<h2>Pace</h2><p class="sub">Falling behind is not a failure state. It's just a number that wants redistributing.</p>
      <div class="grid2">
        <p class="stat"><b>${st.remaining}</b><small>${esc(App.W.unitPlural)} left</small></p>
        <p class="stat"><b>${st.slots}</b><small>days left</small></p>
      </div>
      <p class="stat" style="margin-top:10px"><b>${st.perSlot.toFixed(1)}</b><small>${esc(App.W.unitPlural)} per day from here</small></p>
      ${missed.length ? `<div class="card" style="margin-top:14px;border-color:var(--edge-strong)">
        <p class="eyebrow">${missed.length} missed</p>
        ${missed.map(mt => `<div style="margin-bottom:${mt === missed[missed.length-1] ? '0' : '16px'}">
          <p style="margin:0 0 8px"><b>${esc(mt.title)}</b> — ${fmtDay(mt.date)}${mt.max ? `, ${mt.max} ${esc(App.W.unitPlural)}` : ''}</p>
          <div style="display:flex;gap:8px">
            <button class="btn ghost" data-missed="today" data-task-id="${mt.id}" style="flex:1" aria-label="Move ${esc(mt.title)} to today">Move to today</button>
            <button class="btn ghost" data-missed="fold" data-task-id="${mt.id}" style="flex:1" aria-label="Fold ${esc(mt.title)} into the plan">Fold in</button>
            <button class="btn ghost" data-missed="skip" data-task-id="${mt.id}" style="flex:1" aria-label="Let ${esc(mt.title)} go">Let it go</button>
          </div>
        </div>`).join('')}
      </div>` : ''}
      ${before !== null ? `<p class="sub" style="margin-top:14px">Today's plan currently asks for ${before} ${esc(App.W.unitPlural)}.${before !== after ? ` Redistributing will change that to ${after}.` : ' Redistributing won’t change that — it’s already right.'}</p>` : ''}
      <button class="btn" id="do_replan">Redistribute what's left</button>
      <button class="btn ghost" data-track="${tr.id}" aria-haspopup="dialog">Change what's pinned down</button>
      <button class="btn line" onclick="closeSheet()">Leave the plan alone</button>`;
  },
  position() {
    return `<h2>Where you actually are</h2><p class="sub">The plan follows you, not the other way around.</p>
      <p class="stat" style="text-align:center;margin-bottom:14px">
        <b>${esc(unitLabel(App.W, App.W.progress.unitsDone))}</b><small>${esc(bookAt(App.W, App.W.progress.unitsDone).title)}</small></p>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        ${[-5,-1,1,5].map(n => `<button class="btn ghost" data-nudge="${n}" style="flex:1"
          aria-label="${n > 0 ? 'Move forward ' + n : 'Move back ' + Math.abs(n)} ${esc(App.W.unitPlural)}">${n > 0 ? '+' : ''}${n}</button>`).join('')}
      </div>
      <p class="sub">Moving your place doesn't change XP or the grove. Nothing you've earned is ever taken back.</p>
      <button class="btn line" onclick="closeSheet()">Done</button>`;
  },
  addreward() {
    return `<h2>Add a reward</h2><p class="sub">Real-world bribes. Set the price yourself.</p>
      <p class="err" id="formErr" role="alert"></p>
      <label class="f" for="ar_g"><span>Emoji <span class="hint">(decoration only)</span></span></label>
      <input id="ar_g" value="🎁" maxlength="4" style="margin-bottom:14px">
      <label class="f" for="ar_n"><span>Reward</span></label>
      <input id="ar_n" placeholder="Long bath, no phone" style="margin-bottom:14px">
      <label class="f" for="ar_c"><span>Price in ${esc(App.W.currency)}</span></label>
      <input id="ar_c" type="number" inputmode="numeric" min="1" value="50" style="margin-bottom:14px">
      <button class="btn" id="ar_go">Add to shop</button>`;
  },
  settings() {
    return `<h2>Settings</h2><p class="sub">${esc(App.W.name)} · ${THEMES[App.W.theme].name}</p>
      <div class="shelf">
        <button class="row-item" id="calmToggle" aria-pressed="${!!(App.S.prefs && App.S.prefs.calm)}">
          <span class="g" aria-hidden="true">🌾</span>
          <span class="t"><b>Reduce motion</b><small>${(App.S.prefs && App.S.prefs.calm) ? 'On — drifting light and animation are off' : 'Off — the scene drifts gently'}</small></span></button>
        <button class="row-item" data-sheet="themes" aria-haspopup="dialog"><span class="g" aria-hidden="true">🎨</span><span class="t"><b>Theme pack</b><small>${THEMES[App.W.theme].name} — ${THEMES[App.W.theme].blurb}</small></span></button>
        <button class="row-item" data-sheet="worlds" aria-haspopup="dialog"><span class="g" aria-hidden="true">🌍</span><span class="t"><b>Switch world</b><small>${App.S.worlds.length} saved</small></span></button>
        <button class="row-item" data-sheet="pace" aria-haspopup="dialog"><span class="g" aria-hidden="true">↻</span><span class="t"><b>Redistribute the plan</b><small>Catch up without penalty</small></span></button>
        <button class="row-item" id="clearToday"><span class="g" aria-hidden="true">↩︎</span><span class="t"><b>Undo today's log</b><small>Removes today's result only</small></span></button>
        <button class="row-item" id="doExport"><span class="g" aria-hidden="true">⬇️</span><span class="t"><b>Export everything</b><small>Downloads a JSON backup</small></span></button>
        <button class="row-item" data-sheet="import" aria-haspopup="dialog"><span class="g" aria-hidden="true">⬆️</span><span class="t"><b>Import a backup</b><small>Paste a previous export</small></span></button>
        <button class="row-item" data-sheet="backups" aria-haspopup="dialog"><span class="g" aria-hidden="true">🗄️</span>
          <span class="t"><b>Backups</b><small>Device history, cloud snapshots, and restore</small></span></button>
        <button class="row-item" data-sheet="account" aria-haspopup="dialog"><span class="g" aria-hidden="true">👤</span><span class="t"><b>Account</b><small>${typeof Account === 'undefined' ? 'Sign in to sync' : Account.status === 'signedIn' ? 'Signed in as ' + esc((Account.user && (Account.user.email || Account.user.name)) || 'you') : Account.status === 'unconfigured' ? 'Not set up yet' : 'Not signed in — this device only'}</small></span></button>
      </div>`;
  },
  import() {
    return `<h2>Import</h2><p class="sub">Paste an export. This replaces everything currently saved.</p>
      <p class="err" id="formErr" role="alert"></p>
      <label class="f" for="imp"><span>Backup JSON</span></label>
      <textarea id="imp" rows="6" style="margin-bottom:14px"></textarea>
      <button class="btn" id="imp_go">Replace my data</button>`;
  },

  home() { return homeConfigSheet(); },
  sprint() {
    return `<h2>Sprint</h2><p class="sub">Read until it rings. You may quit when it rings. That is the whole deal.</p>
      <div style="display:flex;gap:8px">
        ${[10,15,25].map(m => `<button class="btn ghost" data-sprint="${m}" style="flex:1" aria-label="Start a ${m} minute sprint">${m} min</button>`).join('')}
      </div>`;
  },
  backups() { return backupsSheet(); },
  account() { return accountSheet(); }
};

export function sprintFace(mins) {
  const total = mins * 60;
  openSheet(`<h2 style="text-align:center">${mins}-minute sprint</h2>
    <div class="timer-face">
      <svg class="ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle class="bg" cx="50" cy="50" r="44"></circle>
        <circle class="fg" id="ring" cx="50" cy="50" r="44" stroke-dasharray="276.5" stroke-dashoffset="0"></circle>
      </svg>
      <p class="t" id="clock" aria-hidden="true">${mins}:00</p>
    </div>
    <p class="sr-only" id="timerNote">${mins} minute sprint running. You can pause or stop at any time, and nothing is lost either way.</p>
    <button class="btn ghost" id="pauseSprint" aria-pressed="false">Pause</button>
    <button class="btn line" id="stopSprint">Stop — nothing lost</button>`);
  let left = total;
  const tick = () => {
    if (window._paused) return;
    left--;
    const m = Math.floor(left / 60), s = String(left % 60).padStart(2, '0');
    const clock = $('clock'); if (!clock) { clearInterval(window._timer); return; }
    clock.textContent = `${m}:${s}`;
    $('ring').setAttribute('stroke-dashoffset', String(276.5 * (1 - left / total)));
    if (left <= 0) {
      clearInterval(window._timer); window._timer = null;
      App.W.progress.sprints = (App.W.progress.sprints || 0) + 1;
      App.W.progress.sprintMinutes = (App.W.progress.sprintMinutes || 0) + mins;
      const xp = mins, coins = Math.round(mins / 2);
      App.W.progress.xp += xp; App.W.progress.coins += coins;
      const drop = Math.random() < (mins >= 25 ? .55 : .3) ? grantLoot() : null;
      save(); paint();
      if (drop) showDrop(drop); else { closeSheet(); toast(`Sprint complete. Plus ${xp} ${App.W.xpName} and ${coins} ${App.W.currency}.`); }
      try { navigator.vibrate && navigator.vibrate([120,60,120]); } catch (e) {}
    }
  };
  window._timer = setInterval(tick, 1000);
}
/* -------------------------------- events ---------------------------------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-view],[data-gotoall],[data-sheet],[data-log],[data-missed],[data-theme],[data-world],[data-buy],[data-nudge],[data-sprint],[data-bait],#escapeBtn,#sprintBtn,#do_replan,#nw_go,#ar_go,#imp_go,#clearToday,#doExport,#stopSprint,#pauseSprint,#calmToggle,[data-close]');
  if (!el) return;

  if (el.dataset.close) { closeSheet(); return; }
  if (el.dataset.gotoall) {
    App.view = 'tasks'; App.taskUI.scope = el.dataset.gotoall; paint();
    try { window.scrollTo(0,0); } catch (err) {}
    const h = document.querySelector('#screenTitle'); if (h) { h.setAttribute('tabindex','-1'); h.focus(); }
    return;
  }
  if (el.dataset.view) {
    App.view = el.dataset.view; paint();
    try { window.scrollTo(0,0); } catch (err) {}
    const h = document.querySelector('#screenTitle'); if (h) { h.setAttribute('tabindex','-1'); h.focus(); }
    return;
  }
  if (el.dataset.sheet) { openSheet(SHEETS[el.dataset.sheet](), el); return; }

  if (el.dataset.log) { logTask(el.dataset.taskId, el.dataset.log, parseInt(el.dataset.units, 10) || 0); return; }

  if (el.dataset.bait) {
    const t = (App.W.tasks || []).find(x => x.id === el.dataset.bait);
    if (!t) return;
    el.setAttribute('aria-expanded', 'true');
    $('baitSlot_' + t.id).innerHTML = `<div class="bait-open" id="baitText_${t.id}" tabindex="-1">
      <p class="eyebrow" style="margin:0 0 6px">The hook</p><p>${esc(t.hook)}</p></div>`;
    $('baitText_' + t.id).focus();
    return;
  }
  if (el.id === 'escapeBtn' || el.id === 'sprintBtn') { openSheet(SHEETS.sprint(), el); return; }
  if (el.id === 'pauseSprint') {
    window._paused = !window._paused;
    el.setAttribute('aria-pressed', String(!!window._paused));
    el.textContent = window._paused ? 'Resume' : 'Pause';
    toast(window._paused ? 'Sprint paused' : 'Sprint running');
    return;
  }
  if (el.id === 'calmToggle') {
    App.S.prefs = App.S.prefs || {};
    App.S.prefs.calm = !App.S.prefs.calm;
    save(); paint();
    openSheet(SHEETS.settings());
    toast(App.S.prefs.calm ? 'Motion reduced' : 'Motion back on');
    return;
  }
  if (el.dataset.sprint) { sprintFace(parseInt(el.dataset.sprint, 10)); return; }
  if (el.id === 'stopSprint') { closeSheet(); toast('Stopped. Streak untouched.'); return; }

  if (el.dataset.theme) { App.W.theme = el.dataset.theme; save(); closeSheet(); paint(); toast(THEMES[App.W.theme].name + ' theme applied'); return; }
  if (el.dataset.world) { App.S.activeId = el.dataset.world; App.W = App.S.worlds.find(w => w.id === App.S.activeId); save(); closeSheet(); App.view='tonight'; paint(); toast('Switched to ' + App.W.name); return; }

  if (el.dataset.buy) {
    const i = +el.dataset.buy, item = App.W.progress.shop[i];
    if (App.W.progress.coins < item.c) { toast(`${item.c - App.W.progress.coins} more ${App.W.currency}`); return; }
    App.W.progress.coins -= item.c;
    App.W.progress.claimed.push({ n:item.n, at:Date.now() });
    save(); paint(); toast(`Redeemed: ${item.n}. Go get it.`); return;
  }
  if (el.dataset.nudge) {
    const n = +el.dataset.nudge;
    App.W.progress.unitsDone = Math.max(0, Math.min(totalUnits(App.W), App.W.progress.unitsDone + n));
    checkMilestones(); save(); paint(); openSheet(SHEETS.position()); return;
  }
  if (el.id === 'do_replan') {
    const tr = App.W.tracks && App.W.tracks[0];
    const before = tr ? ((openSlots(App.W, tr).find(x => x.date === today()) || {}).max || 0) : null;
    recomputeAll(App.W);
    const after = tr ? ((openSlots(App.W, tr).find(x => x.date === today()) || {}).max || 0) : null;
    save(); closeSheet(); paint();
    toast(before !== null && before !== after
      ? `Redistributed — today now asks for ${after} ${App.W.unitPlural}`
      : 'Already up to date. Nothing needed to change.');
    return;
  }
  if (el.dataset.missed) {
    const task = (App.W.tasks || []).find(x => x.id === el.dataset.taskId);
    if (task) {
      resolveMissed(App.W, task, el.dataset.missed);
      save();
      toast(el.dataset.missed === 'today' ? 'Moved to today'
          : el.dataset.missed === 'skip' ? 'Let go — nothing lost'
          : 'Folded into the plan');
    }
    closeSheet(); paint();
    return;
  }

  if (el.id === 'nw_go') {
    const parts = $('nw_parts').value.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
      const m = l.split(','); return { name:(m[0]||'Part').trim(), units:Math.max(1, parseInt(m[1],10) || 10) };
    });
    const name = $('nw_name').value.trim(), start = $('nw_start').value, end = $('nw_end').value;
    if (!name || !start || !end || !parts.length) { setErr('Add a name, both dates, and at least one part.'); return; }
    if (end < start) { setErr('The end date has to come after the start date.'); return; }
    const w = makeWorld({ name, unit:$('nw_unit').value.trim() || 'chapter', currency:$('nw_cur').value.trim() || 'Coins',
                          theme:$('nw_theme').value, start, end, parts });
    indexDays(w); linkMilestones(w); migrateTasks(w); migrateTracks(w);
    App.S.worlds.push(w); App.S.activeId = w.id; App.W = w;
    save(); closeSheet(); App.view = 'tonight'; paint(); toast(`${name} begins.`); return;
  }
  if (el.id === 'ar_go') {
    const n = $('ar_n').value.trim(); if (!n) { setErr('Give the reward a name.'); return; }
    App.W.progress.shop.push({ g:$('ar_g').value || '🎁', n, c:Math.max(1, parseInt($('ar_c').value,10) || 25) });
    save(); closeSheet(); paint(); return;
  }
  if (el.id === 'clearToday') {
    const t = today();
    const ids = Object.keys(App.W.progress.log).filter(k => (App.W.progress.log[k].date || k) === t);
    if (!ids.length) { toast('Nothing logged today'); return; }
    ids.forEach(id => unlogTask(id));
    closeSheet(); toast('Today cleared.'); return;
  }
  if (el.id === 'doExport') {
    const blob = new Blob([JSON.stringify(App.S, null, 2)], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `onwego-${today()}.json`; a.click();
    closeSheet(); toast('Backup downloaded'); return;
  }
  if (el.id === 'imp_go') {
    try {
      const data = JSON.parse($('imp').value);
      if (!data.worlds) throw new Error('bad');
      applyState(data, 'Imported');
    } catch (err) { setErr("That doesn't look like an On We Go backup."); }
    return;
  }
});
