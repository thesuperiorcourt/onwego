import { App } from './state.js';
import { FLORA_FOR, PAYOUT, baitFor, checkMilestones, fmtDay, grantLoot, showDrop, streak, today, unitLabel } from './engine.js';
import { REPEATS, TASK_TYPES, hasType, isMissed, recomputeAll, recomputeTrack, relabelLinked, spawnRepeat, trackBlock, trackFor } from './tracks.js';
import { $, closeSheet, esc, normalizeA11y, openSheet, paint, setErr, toast } from './ui.js';
import { save } from './main.js';

/* ============================================================
   TASKS — the data layer behind every screen.

   A task is deliberately generic: a title and nothing else is
   required. Books, workouts, lessons, chores and job applications
   all fit the same shape, so a world isn't a reading world unless
   you fill it in like one.
   ============================================================ */

export const TASK_FIELDS = [
  { k:'range',       label:'Target',      hint:'What you are aiming at — “Ch. 63–67”, “3 miles”, “Section 2”' },
  { k:'min',         label:'Minimum',     hint:'The smallest amount that still counts', type:'number' },
  { k:'max',         label:'Maximum',     hint:'The full amount you planned', type:'number' },
  { k:'hook',        label:'Hook',        hint:'Why you want to — the bait', long:true },
  { k:'how',         label:'How',         hint:'The approach that works for this one' },
  { k:'payoff',      label:'Payoff',      hint:'What you get out of finishing it' },
  { k:'notes',       label:'Notes',       hint:'Anything else', long:true },
  { k:'category',    label:'Category',    hint:'The big grouping — a book, a course, a room' },
  { k:'subcategory', label:'Subcategory', hint:'The smaller grouping inside it' },
  { k:'tags',        label:'Tags',        hint:'Comma separated' },
  { k:'date',        label:'Date',        hint:'Leave blank for anytime', type:'date' }
];

/* What a home section can show on each card. */
export const SHOW_FIELDS = [
  { k:'range',    label:'Target' },
  { k:'tiers',    label:'Minimum / maximum buttons' },
  { k:'hook',     label:'Hook (hidden until tapped)' },
  { k:'how',      label:'How' },
  { k:'payoff',   label:'Payoff' },
  { k:'notes',    label:'Notes' },
  { k:'date',     label:'Date' },
  { k:'category', label:'Category' },
  { k:'tags',     label:'Tags' },
  { k:'momentum', label:'Progress meter' }
];

export const SORTS = [
  { k:'date',     label:'Date' },
  { k:'title',    label:'Title' },
  { k:'category', label:'Category' },
  { k:'max',      label:'Maximum' },
  { k:'min',      label:'Minimum' },
  { k:'added',    label:'When added' }
];

export const SCOPES = [
  { k:'today',    label:'Today only' },
  { k:'missed',   label:'Missed — not logged, past its date' },
  { k:'upcoming', label:'Today and later' },
  { k:'open',     label:'Anything not logged' },
  { k:'all',      label:'Everything' }
];

export function newTask(over) {
  return Object.assign({
    id: 't' + Date.now().toString(36) + Math.floor(Math.random()*999).toString(36),
    title:'', date:'', category:'', subcategory:'', tags:[], streak:true,
    types:['streak'], repeat:null, planMax:null,
    min:null, max:null, range:'', hook:'', how:'', payoff:'', notes:'',
    link:null, added: Date.now()
  }, over || {});
}
export function defaultHome() {
  return { sections: [
    { id:'s1', name:'Today', categories:[], tags:[], scope:'today', limit:1,
      sort:'date', dir:'asc', fields:['range','tiers','hook','how','momentum'] },
    { id:'s2', name:'Missed', categories:[], tags:[], scope:'missed', limit:5,
      sort:'date', dir:'asc', fields:['range','date'] },
    { id:'s3', name:'Up next', categories:[], tags:[], scope:'upcoming', limit:3,
      sort:'date', dir:'asc', fields:['range','date'] }
  ]};
}

/* One-time move: the shipped campaign becomes editable task records. */
/* An untouched shipped layout gets the current default transparently — a
   customised one never does, so nobody's edits get overwritten underneath
   them. Identified by shape, not a version flag: the exact two sections
   defaultHome() used to hand out, nothing added or renamed. */
export function isUntouchedOldHome(home) {
  const s = (home || {}).sections || [];
  return s.length === 2 && s[0] && s[0].id === 's1' && s[1] && s[1].id === 's2'
    && s[1].name === 'Coming up' && s[1].scope === 'upcoming';
}
export function migrateTasks(w) {
  if (!w.home) w.home = defaultHome();
  else if (isUntouchedOldHome(w.home)) w.home = defaultHome();
  if (w.tasks) return;
  w.tasks = (w.days || []).map(d => {
    const bait = baitFor(w, d.fromGlobal, d.toGlobal);
    const bk = w.books.find(b => b.id === d.book) || {};
    const from = unitLabel(w, d.fromGlobal), to = unitLabel(w, d.toGlobal);
    const tags = [];
    if (Math.max(bait.s, d.stars || 0) >= 2) tags.push('starred');
    return newTask({
      id: 't_' + d.date,
      title: d.title, date: d.date,
      category: bk.title || '', subcategory: bk.realm || '',
      tags, streak: true, types: ['target','streak'], planMax: d.goal || null,
      min: d.minWin || null, max: d.goal || null,
      range: from + (from !== to ? ' – ' + to : ''),
      hook: bait.t,
      how: (d.mode || '') + (d.speed && d.speed !== '—' ? ' · ' + d.speed : ''),
      payoff: '', notes: '',
      link: { book: d.book, from: d.fromGlobal, to: d.toGlobal }
    });
  });
  /* Carry over anything already logged by date. */
  const old = w.progress.log || {};
  const moved = {};
  Object.keys(old).forEach(k => {
    const t = w.tasks.find(x => x.date === k);
    moved[t ? t.id : k] = Object.assign({ date:k }, old[k]);
  });
  w.progress.log = moved;
}

export function taskCategories(w) {
  return [...new Set((w.tasks || []).map(t => t.category).filter(Boolean))];
}
export function taskTags(w) {
  return [...new Set([].concat(...(w.tasks || []).map(t => t.tags || [])))].filter(Boolean);
}
export function isLogged(w, t) { const l = w.progress.log[t.id]; return !!(l && l.result !== 'skip'); }

export function filterTasks(w, o) {
  const t0 = today();
  let list = (w.tasks || []).slice();
  if (o.q) {
    const q = o.q.toLowerCase();
    list = list.filter(t => [t.title,t.category,t.subcategory,t.hook,t.how,t.payoff,t.notes,t.range]
      .concat(t.tags || []).join(' ').toLowerCase().includes(q));
  }
  if (o.categories && o.categories.length) list = list.filter(t => o.categories.includes(t.category));
  if (o.tags && o.tags.length) list = list.filter(t => (t.tags || []).some(x => o.tags.includes(x)));
  if (o.streakOnly) list = list.filter(t => t.streak);
  if (o.scope === 'today')    list = list.filter(t => t.date === t0);
  if (o.scope === 'missed')   list = list.filter(t => isMissed(w, t));
  if (o.scope === 'upcoming') list = list.filter(t => !t.date || t.date >= t0);
  if (o.scope === 'open')     list = list.filter(t => !isLogged(w, t));
  if (o.scope === 'done')     list = list.filter(t => isLogged(w, t));
  const dir = o.dir === 'desc' ? -1 : 1;
  const key = o.sort || 'date';
  list.sort((a,b) => {
    let x = a[key], y = b[key];
    if (key === 'min' || key === 'max' || key === 'added') { x = x || 0; y = y || 0; return (x - y) * dir; }
    x = (x || '').toString().toLowerCase(); y = (y || '').toString().toLowerCase();
    if (key === 'date') { if (!x) return 1; if (!y) return -1; }
    return x < y ? -dir : x > y ? dir : 0;
  });
  return list;
}
/* ------------------------------ Tasks screen ------------------------------ */

export function taskRow(t) {
  const l = App.W.progress.log[t.id];
  const bits = [];
  if (t.range) bits.push(esc(t.range));
  if (t.min || t.max) bits.push(`${t.min || 0}–${t.max || t.min}`);
  if (t.date) bits.push(fmtDay(t.date));
  if (t.category) bits.push(esc(t.category));
  return `<li><button class="row-item" data-task="${t.id}" aria-label="Edit ${esc(t.title)}${l ? ', logged' : ''}">
    <span class="g" aria-hidden="true">${l ? '✅' : t.streak ? '🔥' : '○'}</span>
    <span class="t"><b>${esc(t.title || 'Untitled')}</b>
      <small>${bits.join(' · ') || 'No details yet'}${l ? ' · ' + (l.result === 'skip' ? 'Rested' : PAYOUT[l.result].label) : ''}</small></span>
    <span aria-hidden="true" style="color:var(--muted)">›</span></button></li>`;
}

export function renderTaskList() {
  const list = filterTasks(App.W, App.taskUI);
  if (!list.length) {
    return `<p class="empty"><b>Nothing matches</b>Clear the search or filters, or add a task.</p>`;
  }
  return `<p class="eyebrow" id="taskCount">${list.length} of ${(App.W.tasks||[]).length} tasks</p>
    <ul class="shelf" role="list" aria-labelledby="taskCount">${list.map(taskRow).join('')}</ul>`;
}
export function renderTasks() {
  const cats = taskCategories(App.W), tags = taskTags(App.W);
  const activeFilters = App.taskUI.categories.length + App.taskUI.tags.length + (App.taskUI.streakOnly ? 1 : 0) + (App.taskUI.scope !== 'all' ? 1 : 0);
  return `<div class="wrap" style="padding-top:calc(20px + var(--safe-t))">
    <div class="sec-head" style="margin-bottom:12px">
      <h1 class="page-title" id="screenTitle">Tasks</h1>
      <button class="link" data-task="new" aria-haspopup="dialog">Add a task</button>
    </div>
    <p style="margin:0 0 14px;color:var(--muted);font-size:14px">Everything in ${esc(App.W.name)} lives here. Edit anything — the other screens follow.</p>
    ${trackBlock()}
    <h2 style="font-size:19px;margin:26px 0 10px">All tasks</h2>

    <label class="f" for="taskSearch"><span>Search</span></label>
    <input id="taskSearch" type="search" value="${esc(App.taskUI.q)}" placeholder="Title, hook, notes, tags…"
      autocomplete="off" style="margin-bottom:12px">

    <div style="display:flex;gap:8px;margin-bottom:12px">
      <div style="flex:1">
        <label class="f" for="taskSort"><span>Sort by</span></label>
        <select id="taskSort">${SORTS.map(s => `<option value="${s.k}"${App.taskUI.sort===s.k?' selected':''}>${s.label}</option>`).join('')}</select>
      </div>
      <div style="flex:1">
        <label class="f" for="taskDir"><span>Order</span></label>
        <select id="taskDir">
          <option value="asc"${App.taskUI.dir==='asc'?' selected':''}>First to last</option>
          <option value="desc"${App.taskUI.dir==='desc'?' selected':''}>Last to first</option>
        </select>
      </div>
    </div>

    <div class="sec-head" style="margin-bottom:10px">
      <h2 style="font-size:17px">Filters${activeFilters ? ` (${activeFilters} on)` : ''}</h2>
      ${activeFilters ? '<button class="link" id="clearFilters">Clear all</button>' : ''}
    </div>
    <div style="margin-bottom:8px">
      <label class="f" for="taskScope"><span>Show</span></label>
      <select id="taskScope">
        <option value="all"${App.taskUI.scope==='all'?' selected':''}>Everything</option>
        ${SCOPES.filter(s=>s.k!=='all').map(s => `<option value="${s.k}"${App.taskUI.scope===s.k?' selected':''}>${s.label}</option>`).join('')}
        <option value="done"${App.taskUI.scope==='done'?' selected':''}>Already logged</option>
      </select>
    </div>
    ${cats.length ? `<fieldset style="border:0;padding:0;margin:0 0 10px">
      <legend class="eyebrow" style="padding:0;margin-bottom:7px">Categories</legend>
      <div class="meta" style="margin-top:0">${cats.map(c => `<button class="chip" data-filtercat="${esc(c)}"
        aria-pressed="${App.taskUI.categories.includes(c)}">${esc(c)}</button>`).join('')}</div></fieldset>` : ''}
    ${tags.length ? `<fieldset style="border:0;padding:0;margin:0 0 10px">
      <legend class="eyebrow" style="padding:0;margin-bottom:7px">Tags</legend>
      <div class="meta" style="margin-top:0">${tags.map(c => `<button class="chip" data-filtertag="${esc(c)}"
        aria-pressed="${App.taskUI.tags.includes(c)}">${esc(c)}</button>`).join('')}</div></fieldset>` : ''}
    <div class="meta" style="margin-bottom:18px"><button class="chip" id="filterStreak" aria-pressed="${App.taskUI.streakOnly}">Streak tasks only</button></div>

    <div id="taskList">${renderTaskList()}</div>
  </div>`;
}

/* ------------------------------ task editor ------------------------------- */
export function taskEditor(id) {
  const t = id === 'new' ? newTask({ date: today() }) : (App.W.tasks || []).find(x => x.id === id);
  if (!t) return '<h2>Task not found</h2>';
  const f = (k) => {
    const def = TASK_FIELDS.find(x => x.k === k);
    const val = k === 'tags' ? (t.tags || []).join(', ') : (t[k] === null || t[k] === undefined ? '' : t[k]);
    const input = def.long
      ? `<textarea id="tf_${k}" rows="3">${esc(val)}</textarea>`
      : `<input id="tf_${k}" type="${def.type || 'text'}"${def.type === 'number' ? ' inputmode="numeric" min="0"' : ''} value="${esc(val)}">`;
    return `<label class="f" for="tf_${k}"><span>${def.label} <span class="hint">— ${esc(def.hint)}</span></span></label>
      ${input}<div style="height:14px"></div>`;
  };
  return `<h2>${id === 'new' ? 'New task' : 'Edit task'}</h2>
    <p class="sub">Only the title is required. Everything else is there if you want it.</p>
    <p class="err" id="formErr" role="alert"></p>
    <input type="hidden" id="tf_id" value="${t.id}">
    <label class="f" for="tf_title"><span>Title <span class="hint">— required</span></span></label>
    <input id="tf_title" value="${esc(t.title)}" required aria-required="true"><div style="height:14px"></div>
    ${['range','min','max','hook','how','payoff','notes','category','subcategory','tags','date'].map(f).join('')}
    <fieldset style="border:0;padding:0;margin:0 0 14px">
      <legend class="f"><span>Types <span class="hint">— a task can be several at once</span></span></legend>
      <div class="meta" style="margin-top:0">${TASK_TYPES.map(x => `<button class="chip" data-type="${x.k}"
        aria-pressed="${(t.types||[]).includes(x.k)}">${x.label}</button>`).join('')}</div>
      <p class="sub" style="margin:8px 0 0">${TASK_TYPES.map(x => `<b>${x.label}</b> — ${x.hint}`).join('<br>')}</p>
    </fieldset>
    <div id="repeatBox"${(t.types||[]).includes('repeating') ? '' : ' hidden'} style="margin-bottom:14px">
      <label class="f" for="tf_repeat"><span>Repeats</span></label>
      <select id="tf_repeat">${REPEATS.map(r => `<option value="${r.k}"${((t.repeat&&t.repeat.freq)||'')===r.k?' selected':''}>${r.label}</option>`).join('')}</select>
      <div style="height:10px"></div>
      <label class="f" for="tf_repeatN"><span>Every how many days <span class="hint">— only for “every N days”</span></span></label>
      <input id="tf_repeatN" type="number" inputmode="numeric" min="1" value="${(t.repeat && t.repeat.n) || 2}">
    </div>
    <button class="btn" id="tf_save">${id === 'new' ? 'Add task' : 'Save changes'}</button>
    ${(() => {
      const log = App.W.progress.log[t.id];
      if (!log) return '';
      const label = log.result === 'skip' ? 'Rested' : (PAYOUT[log.result] || {}).label || log.result;
      return `<button class="btn line" id="tf_unlog">Undo this log — logged ${esc(fmtDay(log.date))} as ${esc(label)}</button>`;
    })()}
    ${id === 'new' ? '' : `<button class="btn line" id="tf_delete">Delete this task</button>`}`;
}
/* --------------------------- home layout config --------------------------- */
export function homeConfigSheet() {
  const secs = (App.W.home || defaultHome()).sections;
  return `<h2>What shows on Today</h2>
    <p class="sub">Build as many sections as you want. Each one picks its own categories, fields, count and order.</p>
    <ul class="shelf">
      ${secs.map((s,i) => `<li><button class="row-item" data-section="${s.id}" aria-haspopup="dialog"
        aria-label="Edit section ${esc(s.name)}">
        <span class="g" aria-hidden="true">▤</span>
        <span class="t"><b>${esc(s.name)}</b><small>${(s.categories||[]).length ? esc(s.categories.join(', ')) : 'All categories'} · ${(SCOPES.find(x=>x.k===s.scope)||{}).label} · ${s.limit} shown · ${(SORTS.find(x=>x.k===s.sort)||{}).label} ${s.dir === 'desc' ? '↓' : '↑'}</small></span>
        <span aria-hidden="true" style="color:var(--muted)">›</span></button></li>`).join('')}
    </ul>
    <button class="btn" style="margin-top:14px" data-section="new">Add a section</button>`;
}

export function sectionEditor(id) {
  const home = App.W.home || defaultHome();
  const s = id === 'new'
    ? { id:'s' + Date.now().toString(36), name:'New section', categories:[], tags:[], scope:'today', limit:3, sort:'date', dir:'asc', fields:['range','tiers'] }
    : home.sections.find(x => x.id === id);
  if (!s) return '<h2>Section not found</h2>';
  window._draft = JSON.parse(JSON.stringify(s));
  const cats = taskCategories(App.W), tags = taskTags(App.W);
  return `<h2>${id === 'new' ? 'New section' : 'Edit section'}</h2>
    <p class="sub">Leave categories empty to include all of them.</p>
    <p class="err" id="formErr" role="alert"></p>
    <input type="hidden" id="sf_id" value="${s.id}">
    <label class="f" for="sf_name"><span>Section heading</span></label>
    <input id="sf_name" value="${esc(s.name)}"><div style="height:14px"></div>

    ${cats.length ? `<fieldset style="border:0;padding:0;margin:0 0 14px">
      <legend class="f"><span>Categories</span></legend>
      <div class="meta" style="margin-top:0">${cats.map(c => `<button class="chip" data-seccat="${esc(c)}"
        aria-pressed="${(s.categories||[]).includes(c)}">${esc(c)}</button>`).join('')}</div></fieldset>` : ''}
    ${tags.length ? `<fieldset style="border:0;padding:0;margin:0 0 14px">
      <legend class="f"><span>Tags</span></legend>
      <div class="meta" style="margin-top:0">${tags.map(c => `<button class="chip" data-sectag="${esc(c)}"
        aria-pressed="${(s.tags||[]).includes(c)}">${esc(c)}</button>`).join('')}</div></fieldset>` : ''}

    <label class="f" for="sf_scope"><span>Which tasks</span></label>
    <select id="sf_scope">${SCOPES.map(x => `<option value="${x.k}"${s.scope===x.k?' selected':''}>${x.label}</option>`).join('')}</select>
    <div style="height:14px"></div>
    <label class="f" for="sf_limit"><span>How many to show</span></label>
    <input id="sf_limit" type="number" inputmode="numeric" min="1" max="20" value="${s.limit}"><div style="height:14px"></div>
    <div style="display:flex;gap:10px">
      <div style="flex:1"><label class="f" for="sf_sort"><span>Sort by</span></label>
        <select id="sf_sort">${SORTS.map(x => `<option value="${x.k}"${s.sort===x.k?' selected':''}>${x.label}</option>`).join('')}</select></div>
      <div style="flex:1"><label class="f" for="sf_dir"><span>Order</span></label>
        <select id="sf_dir"><option value="asc"${s.dir==='asc'?' selected':''}>First to last</option>
          <option value="desc"${s.dir==='desc'?' selected':''}>Last to first</option></select></div>
    </div>
    <fieldset style="border:0;padding:0;margin:14px 0">
      <legend class="f"><span>Fields to show on each card</span></legend>
      <div class="meta" style="margin-top:0">${SHOW_FIELDS.map(x => `<button class="chip" data-secfield="${x.k}"
        aria-pressed="${(s.fields||[]).includes(x.k)}">${x.label}</button>`).join('')}</div>
    </fieldset>
    <button class="btn" id="sf_save">${id === 'new' ? 'Add section' : 'Save section'}</button>
    ${id === 'new' || home.sections.length < 2 ? '' : '<button class="btn line" id="sf_delete">Remove this section</button>'}`;
}
/* A missed task gets an outcome instead of lingering. None of the three
   grant XP, currency or loot — nothing was actually done — but each one
   stops it sitting there un-logged and invisible forever.
     today — re-enters the plan as an open task, attempted today
     fold  — left exactly as the plan already silently handles it: still
             pending, still counted in what's left, just acknowledged
     skip  — logged as rested, the same non-punitive result the escape
             hatch uses; the campaign's unit labels move past it        */
export function resolveMissed(w, task, choice) {
  const tr = trackFor(w, task);
  if (choice === 'today') {
    task.date = today();
  } else if (choice === 'skip') {
    w.progress.log[task.id] = { result:'skip', units:0, xp:0, coins:0, date:task.date, at:Date.now() };
  } else {
    task.missedAck = true;
  }
  if (tr) recomputeTrack(w, tr);
}

/* Reverses one task's logged result — the units/xp/coins it granted and the
   flora it planted — without touching anything else. Shared by re-logging
   (log something else instead) and unlogging (log nothing instead). Clamped
   at zero, same as everywhere else reward math runs backward: it can't
   claw back coins already spent on a reward, which is a real, unsolved
   edge case — see BRAINSTORM.md's economy section. */
function reverseLog(taskId) {
  const prev = App.W.progress.log[taskId];
  if (!prev) return;
  App.W.progress.unitsDone = Math.max(0, App.W.progress.unitsDone - (prev.units || 0));
  App.W.progress.xp = Math.max(0, App.W.progress.xp - prev.xp);
  App.W.progress.coins = Math.max(0, App.W.progress.coins - prev.coins);
  App.W.progress.flora = App.W.progress.flora.filter(f => f.task !== taskId || f.milestone);
}

/* Clears a task back to unlogged — the opposite of logTask(). Used when a
   result was recorded in error, for any date, not just today. */
export function unlogTask(taskId) {
  if (!App.W.progress.log[taskId]) return;
  reverseLog(taskId);
  delete App.W.progress.log[taskId];
  const task = (App.W.tasks || []).find(x => x.id === taskId);
  const tr = task ? trackFor(App.W, task) : null;
  if (tr) recomputeTrack(App.W, tr);
  save(); paint();
}

export function logTask(taskId, kind, units) {
  const task = (App.W.tasks || []).find(x => x.id === taskId);
  if (!task) return;
  const when = task.date || today();
  reverseLog(taskId);  /* re-logging replaces the earlier result, never punishes */
  const p = PAYOUT[kind];
  /* Target tasks move their track forward; everything else is XP only. */
  units = hasType(task, 'target') ? Math.max(0, units) : 0;
  App.W.progress.log[taskId] = { result:kind, units, xp:p.xp, coins:p.coins, date:when, at:Date.now() };
  App.W.progress.unitsDone += units;
  App.W.progress.xp += p.xp;
  App.W.progress.coins += p.coins;
  App.W.progress.flora.push({ kind:FLORA_FOR[kind], date:when, task:taskId, seed:Math.floor(Math.random()*99999) });

  spawnRepeat(App.W, task);
  const tr = trackFor(App.W, task);
  if (tr) recomputeTrack(App.W, tr); else relabelLinked(App.W, { categories: [] });
  const found = checkMilestones();
  const drop = (!found && Math.random() < p.lootChance) ? grantLoot() : null;
  save(); paint();
  if (!found && drop) showDrop(drop);
  else if (!found) toast(`+${p.xp} ${App.W.xpName} · +${p.coins} ${App.W.currency}`);
}
/* ============================================================
   TASK INTERACTIONS
   Search, filters, the editor, and the Today layout builder.
   ============================================================ */

export function refreshTaskList(announce) {
  const box = $('taskList');
  if (!box) return;
  box.innerHTML = renderTaskList();
  normalizeA11y(box);
  /* Announce the count, not the whole list — a live region wrapped around
     seventy rows reads all seventy of them. */
  if (announce !== false) {
    const n = box.querySelectorAll('[data-task]').length;
    toast(n === 0 ? 'No tasks match' : n + (n === 1 ? ' task' : ' tasks') + ' shown');
  }
}
export function toggleIn(arr, val) {
  const i = arr.indexOf(val);
  if (i < 0) arr.push(val); else arr.splice(i, 1);
  return arr;
}
export function readTaskForm() {
  const g = k => { const el = $('tf_' + k); return el ? el.value.trim() : ''; };
  const num = k => { const v = g(k); return v === '' ? null : Math.max(0, parseFloat(v) || 0); };
  return {
    title: g('title'), range: g('range'), min: num('min'), max: num('max'),
    hook: g('hook'), how: g('how'), payoff: g('payoff'), notes: g('notes'),
    category: g('category'), subcategory: g('subcategory'),
    tags: g('tags').split(',').map(s => s.trim()).filter(Boolean),
    date: g('date'),
    types: [...document.querySelectorAll('[data-type][aria-pressed="true"]')].map(b => b.dataset.type),
    repeat: (() => {
      const f = $('tf_repeat') ? $('tf_repeat').value : '';
      return f ? { freq:f, n: Math.max(1, parseInt(($('tf_repeatN') || {}).value, 10) || 2) } : null;
    })()
  };
}
document.addEventListener('input', e => {
  if (e.target.id === 'taskSearch') {
    App.taskUI.q = e.target.value;
    clearTimeout(window._searchT);
    window._searchT = setTimeout(refreshTaskList, 400);
  }
});

document.addEventListener('change', e => {
  const id = e.target.id;
  if (id === 'taskSort')  { App.taskUI.sort = e.target.value; refreshTaskList(); }
  if (id === 'taskDir')   { App.taskUI.dir = e.target.value; refreshTaskList(); }
  if (id === 'taskScope') { App.taskUI.scope = e.target.value; refreshTaskList(); }
});
document.addEventListener('click', e => {
  const el = e.target.closest('[data-task],[data-section],[data-filtercat],[data-filtertag],[data-seccat],[data-sectag],[data-secfield],#filterStreak,#clearFilters,#tf_save,#tf_delete,#tf_unlog,#tf_streak,#sf_save,#sf_delete');
  if (!el) return;

  /* ---- filters on the Tasks tab ---- */
  if (el.dataset.filtercat !== undefined) {
    toggleIn(App.taskUI.categories, el.dataset.filtercat);
    el.setAttribute('aria-pressed', String(App.taskUI.categories.includes(el.dataset.filtercat)));
    refreshTaskList(); return;
  }
  if (el.dataset.filtertag !== undefined) {
    toggleIn(App.taskUI.tags, el.dataset.filtertag);
    el.setAttribute('aria-pressed', String(App.taskUI.tags.includes(el.dataset.filtertag)));
    refreshTaskList(); return;
  }
  if (el.id === 'filterStreak') {
    App.taskUI.streakOnly = !App.taskUI.streakOnly;
    el.setAttribute('aria-pressed', String(App.taskUI.streakOnly));
    refreshTaskList(); return;
  }
  if (el.id === 'clearFilters') {
    App.taskUI = { q:'', categories:[], tags:[], streakOnly:false, scope:'all', sort:App.taskUI.sort, dir:App.taskUI.dir };
    paint(); toast('Filters cleared'); return;
  }

  /* ---- the task editor ---- */
  if (el.dataset.task !== undefined) { openSheet(taskEditor(el.dataset.task), el); return; }

  if (el.id === 'tf_save') {
    const vals = readTaskForm();
    if (!vals.title) { setErr('A task needs a title. Everything else is optional.'); return; }
    if (vals.min !== null && vals.max !== null && vals.min > vals.max) {
      setErr('The minimum is larger than the maximum — swap them or clear one.'); return;
    }
    const id = $('tf_id').value;
    const streak = vals.types.includes('streak');
    const existing = (App.W.tasks || []).find(x => x.id === id);
    if (existing) {
      const hookChanged = existing.hook !== vals.hook;
      Object.assign(existing, vals, { streak });
      if (hookChanged) existing.hookEdited = true;
      if (existing.planMax == null) existing.planMax = existing.max;
      toast('Saved');
    } else {
      const nt = newTask(Object.assign({ id }, vals, { streak }));
      nt.planMax = nt.max;
      App.W.tasks.push(nt);
      toast('Task added');
    }
    recomputeAll(App.W);
    save(); closeSheet(); paint(); return;
  }
  if (el.id === 'tf_unlog') {
    unlogTask($('tf_id').value);
    closeSheet();
    toast('Log undone — back to unlogged');
    return;
  }
  if (el.id === 'tf_delete') {
    if (el.dataset.armed !== '1') {
      el.dataset.armed = '1';
      el.textContent = 'Tap again to delete for good';
      toast('Tap delete again to confirm');
      return;
    }
    const id = $('tf_id').value;
    App.W.tasks = (App.W.tasks || []).filter(x => x.id !== id);
    delete App.W.progress.log[id];
    save(); closeSheet(); paint(); toast('Task deleted'); return;
  }

  /* ---- Today layout sections ---- */
  if (el.dataset.section !== undefined) { openSheet(sectionEditor(el.dataset.section), el); return; }

  if (el.dataset.seccat !== undefined) {
    toggleIn(window._draft.categories, el.dataset.seccat);
    el.setAttribute('aria-pressed', String(window._draft.categories.includes(el.dataset.seccat))); return;
  }
  if (el.dataset.sectag !== undefined) {
    toggleIn(window._draft.tags, el.dataset.sectag);
    el.setAttribute('aria-pressed', String(window._draft.tags.includes(el.dataset.sectag))); return;
  }
  if (el.dataset.secfield !== undefined) {
    toggleIn(window._draft.fields, el.dataset.secfield);
    el.setAttribute('aria-pressed', String(window._draft.fields.includes(el.dataset.secfield))); return;
  }
  if (el.id === 'sf_save') {
    const d = window._draft;
    d.name = $('sf_name').value.trim() || 'Section';
    d.scope = $('sf_scope').value;
    d.limit = Math.max(1, Math.min(20, parseInt($('sf_limit').value, 10) || 1));
    d.sort = $('sf_sort').value;
    d.dir = $('sf_dir').value;
    if (!d.fields.length) { setErr('Pick at least one field to show.'); return; }
    App.W.home = App.W.home || defaultHome();
    const i = App.W.home.sections.findIndex(x => x.id === d.id);
    if (i >= 0) App.W.home.sections[i] = d; else App.W.home.sections.push(d);
    save(); closeSheet(); paint(); toast(d.name + ' saved'); return;
  }
  if (el.id === 'sf_delete') {
    if (el.dataset.armed !== '1') {
      el.dataset.armed = '1';
      el.textContent = 'Tap again to remove';
      toast('Tap remove again to confirm');
      return;
    }
    const id = $('sf_id').value;
    App.W.home.sections = App.W.home.sections.filter(x => x.id !== id);
    save(); closeSheet(); paint(); toast('Section removed'); return;
  }
});
