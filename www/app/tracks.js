import { App } from './state.js';
import { baitFor, bookAt, daysBetween, fmtDay, iso, parseISO, streak, today, totalUnits, unitLabel } from './engine.js';
import { newTask, taskCategories, toggleIn } from './tasks.js';
import { $, closeSheet, esc, openSheet, paint, setErr, toast } from './ui.js';
import { save } from './main.js';

/* ============================================================
   TRACKS — what happens to everything else when you log a result.

   A track owns one or more categories and holds a total to finish.
   One thing about it is pinned down, and logging moves the other:

     anchor 'deadline' → the date holds, the amounts move
     anchor 'pace'     → the amounts hold, the finish date moves
     anchor 'none'     → nothing is rewritten, you just get a forecast

   How the difference lands is a second choice:

     ripple 'smooth'  → spread it evenly over everything left
     ripple 'consume' → amounts stay put, the dates slide
     ripple 'fixed'   → nothing is rewritten; surplus banks as "ahead"
   ============================================================ */

export const TASK_TYPES = [
  { k:'target',    label:'Target',    hint:'Has amounts and moves a track forward' },
  { k:'streak',    label:'Streak',    hint:'Logging it keeps the streak alive' },
  { k:'repeating', label:'Repeating', hint:'Comes back on a schedule' },
  { k:'anytime',   label:'Anytime',   hint:'No date, never late' },
  { k:'milestone', label:'Milestone', hint:'No work — marks a moment' },
  { k:'bonus',     label:'Bonus',     hint:'Earns XP but never changes the pace' }
];

export const REPEATS = [
  { k:'',        label:"Doesn't repeat" },
  { k:'daily',   label:'Every day' },
  { k:'weekdays',label:'Weekdays' },
  { k:'weekly',  label:'Every week' },
  { k:'everyN',  label:'Every N days' }
];

export const ANCHORS = [
  { k:'deadline', label:'The end date holds', hint:'Amounts on future tasks move instead' },
  { k:'pace',     label:'The amount holds',   hint:'The finish date moves instead' },
  { k:'none',     label:'Nothing is pinned',  hint:'Just show me the forecast' }
];

export const RIPPLES = [
  { k:'smooth',  label:'Smooth',  hint:'Spread the difference over everything left' },
  { k:'consume', label:'Consume', hint:'Amounts stay; the dates slide' },
  { k:'fixed',   label:'Fixed',   hint:'Never rewrite — bank it as ahead or behind' }
];

export const addDays = (isoStr, n) => iso(new Date(parseISO(isoStr).getTime() + n * 86400000));

export function hasType(t, k) { return (t.types || []).includes(k); }

export function newTrack(over) {
  return Object.assign({
    id: 'tr' + Date.now().toString(36), name:'New track', categories:[],
    total: 100, mode:'count', anchor:'deadline', endDate:'', pace:5,
    ripple:'smooth', comfort:null, basePace:null
  }, over || {});
}

export function trackTasks(w, tr) {
  return (w.tasks || []).filter(t => hasType(t, 'target') &&
    (!tr.categories.length || tr.categories.includes(t.category)));
}
export function trackFor(w, task) {
  if (!hasType(task, 'target')) return null;
  return (w.tracks || []).find(tr => !tr.categories.length || tr.categories.includes(task.category)) || null;
}
export function trackDone(w, tr) {
  return trackTasks(w, tr).reduce((s,t) => {
    const l = w.progress.log[t.id];
    return s + (l && l.result !== 'skip' ? (l.units || 0) : 0);
  }, 0);
}
export function openSlots(w, tr) {
  const t0 = today();
  return trackTasks(w, tr)
    .filter(t => !w.progress.log[t.id])
    .filter(t => !t.date || t.date >= t0)
    .sort((a,b) => (a.date || '9999') < (b.date || '9999') ? -1 : 1);
}

/* Past-dated, unlogged, not yet acknowledged — openSlots() has already
   excluded these from the future, silently. This is what makes them visible
   again so a missed day gets a decision instead of disappearing. */
export function isMissed(w, t) {
  const t0 = today();
  return !w.progress.log[t.id] && !t.missedAck && !!t.date && t.date < t0;
}
export function missedTasks(w, tr) {
  return trackTasks(w, tr).filter(t => isMissed(w, t)).sort((a,b) => (a.date < b.date ? -1 : 1));
}

/* Everything the Today screen and the Tracks list need to say out loud. */
export function trackStatus(w, tr) {
  const done = trackDone(w, tr);
  const remaining = Math.max(0, tr.total - done);
  const slots = openSlots(w, tr);
  const perSlot = slots.length ? remaining / slots.length : 0;
  const pace = tr.anchor === 'pace' ? (tr.pace || 1) : perSlot;
  const daysNeeded = pace > 0 ? Math.ceil(remaining / pace) : 0;
  const active = slots.filter(t => (t.max || 0) > 0);
  const tail = active.length ? active : slots;
  const projectedEnd = tr.anchor === 'pace'
    ? (remaining ? addDays(today(), Math.max(0, daysNeeded - 1)) : today())
    : (tail.length ? tail[tail.length - 1].date : tr.endDate);
  const comfort = tr.comfort || (tr.basePace ? tr.basePace * 1.6 : null);
  return {
    done, remaining, slots: slots.length, perSlot, projectedEnd,
    pct: tr.total ? Math.min(100, Math.round(done / tr.total * 100)) : 0,
    strained: !!(comfort && tr.anchor === 'deadline' && perSlot > comfort),
    comfort
  };
}

/* Rewrite the future. Called after every log, and by Redistribute. */
export function recomputeTrack(w, tr) {
  if (tr.ripple === 'fixed' || tr.anchor === 'none') { relabelLinked(w, tr); return; }
  const slots = openSlots(w, tr);
  if (!slots.length) return;
  const remaining = Math.max(0, tr.total - trackDone(w, tr));

  if (tr.anchor === 'deadline' && tr.ripple === 'smooth') {
    /* Same dates, new amounts. */
    let acc = 0, given = 0;
    const per = remaining / slots.length;
    slots.forEach((t, i) => {
      acc += per;
      let take = Math.round(acc) - given;
      if (i === slots.length - 1) take = remaining - given;
      take = Math.max(0, take);
      given += take;
      t.max = take;
      t.min = take ? Math.min(2, take) : 0;
    });
  } else {
    /* Amounts hold; the dates slide. Used by consume, and by pace anchors. */
    const amount = tr.anchor === 'pace' ? Math.max(1, tr.pace || 1) : null;
    let left = remaining, cursor = today(), i = 0;
    while (left > 0) {
      let t = slots[i];
      if (!t) {
        t = newTask({ title: tr.name + ' — next', category: tr.categories[0] || '',
                      types:['target','streak'], streak:true, auto:true });
        w.tasks.push(t);
        slots.push(t);
      }
      const take = Math.min(left, amount || t.planMax || t.max || 1);
      t.max = take;
      t.min = Math.min(2, take);
      t.date = cursor;
      cursor = addDays(cursor, 1);
      left -= take;
      i++;
      if (i > 2000) break;   /* safety */
    }
    /* Anything past the finish is surplus — getting ahead removed it. */
    slots.slice(i).forEach(t => {
      if (t.link || t.auto) { t.archived = true; t.date = ''; }
      else { t.max = 0; t.min = 0; }
    });
    w.tasks = w.tasks.filter(t => !t.archived);
  }
  relabelLinked(w, tr);
}

/* Campaign tasks carry unit positions, so their targets are re-labelled
   ("Ch. 63 – Ch. 67") and their hook re-pulled from the chapter bands. */
export function relabelLinked(w, tr) {
  const linked = trackTasks(w, tr).filter(t => t.link).sort((a,b) => (a.date||'9999') < (b.date||'9999') ? -1 : 1);
  if (!linked.length) return;
  let cursor = 0;
  linked.forEach(t => {
    const l = w.progress.log[t.id];
    const amount = l ? (l.units || 0) : (t.max || 0);
    const from = cursor, to = Math.max(cursor, cursor + amount - 1);
    t.link = { book: t.link.book, from, to };
    if (amount > 0) {
      const a = unitLabel(w, from), b = unitLabel(w, to);
      t.range = a + (a !== b ? ' – ' + b : '');
      if (!t.hookEdited) t.hook = baitFor(w, from, to).t;
      const bk = bookAt(w, from);
      if (bk) t.category = bk.title;
    }
    cursor += amount;
  });
  w.progress.unitsDone = Math.min(totalUnits(w), linked.reduce((s,t) => {
    const l = w.progress.log[t.id];
    return s + (l && l.result !== 'skip' ? (l.units || 0) : 0);
  }, 0));
}

/* One session per day between today and the deadline: adds days when the
   finish moves out, so a longer runway actually lightens each day. */
export function fitSlotsToDeadline(w, tr) {
  if (tr.anchor !== 'deadline' || !tr.endDate) return;
  const t0 = today();
  const days = Math.max(1, daysBetween(t0, tr.endDate) + 1);
  const slots = openSlots(w, tr);
  for (let i = slots.length; i < days; i++) {
    const t = newTask({ title: tr.name + ' — session', category: tr.categories[0] || '',
                        types:['target','streak'], streak:true, auto:true });
    w.tasks.push(t); slots.push(t);
  }
  slots.forEach((t, i) => { t.date = addDays(t0, Math.min(i, days - 1)); });
}

export function recomputeAll(w) { (w.tracks || []).forEach(tr => recomputeTrack(w, tr)); }

/* What each button would do to the plan — shown on the button itself. */
export function tierImpact(w, task, amount) {
  const tr = trackFor(w, task);
  if (!tr || tr.ripple === 'fixed' || tr.anchor === 'none') return '';
  const already = w.progress.log[task.id];
  const doneAfter = trackDone(w, tr) - (already ? (already.units || 0) : 0) + amount;
  const remaining = Math.max(0, tr.total - doneAfter);
  if (!remaining) return 'finishes it';
  if (tr.anchor === 'pace' || tr.ripple === 'consume') {
    const per = tr.anchor === 'pace' ? Math.max(1, tr.pace || 1) : (task.planMax || task.max || 1);
    return 'ends ' + fmtDay(addDays(today(), Math.max(0, Math.ceil(remaining / per) - 1)));
  }
  const others = openSlots(w, tr).filter(t => t.id !== task.id).length;
  if (!others) return 'last one';
  const per = remaining / others;
  /* Spread over many days the difference is small, so show enough decimals
     that the three buttons actually read differently. */
  return per.toFixed(others > 12 ? 2 : 1) + '/day left';
}

/* Repeating tasks lay their own next egg when logged. */
export function spawnRepeat(w, task) {
  if (!hasType(task, 'repeating') || !task.repeat || !task.repeat.freq || !task.date) return null;
  const r = task.repeat;
  let next;
  if (r.freq === 'daily') next = addDays(task.date, 1);
  else if (r.freq === 'weekly') next = addDays(task.date, 7);
  else if (r.freq === 'everyN') next = addDays(task.date, Math.max(1, r.n || 2));
  else if (r.freq === 'weekdays') {
    next = addDays(task.date, 1);
    while ([0,6].includes(parseISO(next).getDay())) next = addDays(next, 1);
  }
  if (!next) return null;
  if ((w.tasks || []).some(t => t.repeatOf === task.id && t.date === next)) return null;
  const copy = newTask(Object.assign({}, task, {
    id: undefined, date: next, repeatOf: task.id, added: Date.now()
  }));
  copy.id = newTask().id;
  w.tasks.push(copy);
  return copy;
}

/* On first run the shipped campaign becomes one deadline-anchored track. */
export function migrateTracks(w) {
  (w.tasks || []).forEach(t => {
    if (!t.types) t.types = t.link ? ['target','streak'] : (t.streak ? ['streak'] : []);
    if (t.link && !t.types.includes('target')) t.types.push('target');
    if (t.planMax === undefined) t.planMax = t.max || null;
  });
  if (w.tracks) return;
  const linked = (w.tasks || []).filter(t => t.link);
  if (!linked.length) { w.tracks = []; return; }
  const total = totalUnits(w);
  w.tracks = [ newTrack({
    id: 'tr_main', name: w.name + ' campaign',
    categories: [...new Set(linked.map(t => t.category).filter(Boolean))],
    total, mode:'count', anchor:'deadline',
    endDate: w.end || linked[linked.length - 1].date,
    pace: Math.round(total / Math.max(1, linked.length)),
    ripple:'smooth',
    basePace: total / Math.max(1, linked.length)
  }) ];
}
/* ============================================================
   TRACK UI — the Tracks block, the editor, and the honest warning
   ============================================================ */

export function trackBlock() {
  const trs = App.W.tracks || [];
  if (!trs.length) {
    return `<section class="sec" aria-labelledby="trH">
      <div class="sec-head"><h2 id="trH">Tracks</h2><button class="link" data-track="new" aria-haspopup="dialog">Add a track</button></div>
      <p class="empty"><b>No tracks yet</b>A track holds a total to finish and decides what moves when you log — the amounts, or the date.</p>
    </section>`;
  }
  return `<section class="sec" aria-labelledby="trH">
    <div class="sec-head"><h2 id="trH">Tracks</h2><button class="link" data-track="new" aria-haspopup="dialog">Add a track</button></div>
    <ul class="shelf">
      ${trs.map(tr => {
        const st = trackStatus(App.W, tr);
        const anchor = tr.anchor === 'deadline' ? 'Ends ' + (tr.endDate ? fmtDay(tr.endDate) : '—')
                     : tr.anchor === 'pace' ? tr.pace + '/day' : 'Forecast only';
        const proj = st.projectedEnd ? 'projected ' + fmtDay(st.projectedEnd) : 'no date';
        return `<li><button class="row-item" data-track="${tr.id}" aria-haspopup="dialog"
          aria-label="Edit track ${esc(tr.name)}. ${st.pct} percent done, ${st.remaining} left, ${proj}">
          <span class="g" aria-hidden="true">${st.strained ? '⚠️' : '◎'}</span>
          <span class="t"><b>${esc(tr.name)}</b>
            <small>${st.done} of ${tr.total}${tr.mode === 'percent' ? '%' : ''} · ${anchor} · ${proj}${st.strained ? ' · needs a look' : ''}</small>
            <span class="bar" role="progressbar" aria-valuenow="${st.pct}" aria-valuemin="0" aria-valuemax="100"
              aria-label="${esc(tr.name)} progress"><i style="width:${st.pct}%"></i></span></span>
          <span aria-hidden="true" style="color:var(--muted)">›</span></button></li>`;
      }).join('')}
    </ul>
  </section>`;
}

/* The honest warning: when a deadline-anchored track starts demanding more
   per day than you said was comfortable, say so and offer the three ways out. */
export function strainCard() {
  const tr = (App.W.tracks || []).find(t => trackStatus(App.W, t).strained);
  if (!tr) return '';
  const st = trackStatus(App.W, tr);
  const needDays = Math.ceil(st.remaining / Math.max(0.5, st.comfort));
  const newEnd = addDays(today(), Math.max(0, needDays - 1));
  return `<section class="sec" aria-labelledby="strainH">
    <div class="card" style="border-color:var(--bloom-ink)">
      <p class="eyebrow">Worth knowing</p>
      <h2 id="strainH" style="margin:6px 0">${esc(tr.name)} now needs ${st.perSlot.toFixed(1)} a day</h2>
      <p style="margin:0 0 14px;color:var(--muted);font-size:14px">That's above the ${st.comfort.toFixed(1)} a day you called comfortable. Nothing is broken and nothing is late — but a plan that quietly demands more than you can do is how a plan turns into something you avoid. Three ways out:</p>
      <button class="btn ghost" data-strain="date" data-track-id="${tr.id}" data-new-end="${newEnd}">Move the finish to ${fmtDay(newEnd)}</button>
      <button class="btn ghost" data-strain="trim" data-track-id="${tr.id}">Trim the scope to what fits</button>
      <button class="btn line" data-strain="keep" data-track-id="${tr.id}">Leave it — I want the pressure</button>
    </div>
  </section>`;
}

export function trackEditor(id) {
  const isNew = id === 'new';
  const tr = isNew ? newTrack({ endDate: addDays(today(), 30), categories: [] })
                   : (App.W.tracks || []).find(x => x.id === id);
  if (!tr) return '<h2>Track not found</h2>';
  window._trackDraft = JSON.parse(JSON.stringify(tr));
  const cats = taskCategories(App.W);
  const st = isNew ? null : trackStatus(App.W, tr);
  return `<h2>${isNew ? 'New track' : esc(tr.name)}</h2>
    <p class="sub">A track decides what happens to everything else when you log a result.</p>
    <p class="err" id="formErr" role="alert"></p>
    <input type="hidden" id="kf_id" value="${tr.id}">
    ${st ? `<p class="stat" style="margin-bottom:14px"><b>${st.done} of ${tr.total}</b>
      <small>${st.remaining} left · ${st.slots} sessions open · ${st.perSlot.toFixed(1)} a day from here</small></p>` : ''}

    <label class="f" for="kf_name"><span>Name</span></label>
    <input id="kf_name" value="${esc(tr.name)}"><div style="height:14px"></div>

    ${cats.length ? `<fieldset style="border:0;padding:0;margin:0 0 14px">
      <legend class="f"><span>Categories it covers <span class="hint">— empty means all</span></span></legend>
      <div class="meta" style="margin-top:0">${cats.map(c => `<button class="chip" data-trackcat="${esc(c)}"
        aria-pressed="${tr.categories.includes(c)}">${esc(c)}</button>`).join('')}</div></fieldset>` : ''}

    <div style="display:flex;gap:10px">
      <div style="flex:1"><label class="f" for="kf_total"><span>Total to finish</span></label>
        <input id="kf_total" type="number" inputmode="numeric" min="1" value="${tr.total}"></div>
      <div style="flex:1"><label class="f" for="kf_mode"><span>Counted as</span></label>
        <select id="kf_mode"><option value="count"${tr.mode==='count'?' selected':''}>A number</option>
          <option value="percent"${tr.mode==='percent'?' selected':''}>Per cent</option></select></div>
    </div>
    <div style="height:14px"></div>

    <fieldset style="border:0;padding:0;margin:0 0 14px">
      <legend class="f"><span>What's pinned down</span></legend>
      <div class="shelf">${ANCHORS.map(a => `<button class="row-item" data-anchor="${a.k}" aria-pressed="${tr.anchor===a.k}">
        <span class="g" aria-hidden="true">${a.k === 'deadline' ? '📅' : a.k === 'pace' ? '⏱️' : '👁️'}</span>
        <span class="t"><b>${a.label}</b><small>${a.hint}</small></span></button>`).join('')}</div>
    </fieldset>

    <div style="display:flex;gap:10px">
      <div style="flex:1"><label class="f" for="kf_end"><span>Finish by</span></label>
        <input id="kf_end" type="date" value="${esc(tr.endDate || '')}"></div>
      <div style="flex:1"><label class="f" for="kf_pace"><span>Amount per day</span></label>
        <input id="kf_pace" type="number" inputmode="numeric" min="1" value="${tr.pace || 1}"></div>
    </div>
    <p class="sub" style="margin:6px 0 14px">Whichever one your anchor doesn't pin gets recalculated for you.</p>

    <fieldset style="border:0;padding:0;margin:0 0 14px">
      <legend class="f"><span>How a result ripples</span></legend>
      <div class="shelf">${RIPPLES.map(r => `<button class="row-item" data-ripple="${r.k}" aria-pressed="${tr.ripple===r.k}">
        <span class="g" aria-hidden="true">${r.k === 'smooth' ? '〜' : r.k === 'consume' ? '⇥' : '⊙'}</span>
        <span class="t"><b>${r.label}</b><small>${r.hint}</small></span></button>`).join('')}</div>
    </fieldset>

    <label class="f" for="kf_comfort"><span>Comfortable maximum per day <span class="hint">— blank uses 1.6× your starting pace</span></span></label>
    <input id="kf_comfort" type="number" inputmode="decimal" min="0" step="0.5" value="${tr.comfort || ''}"><div style="height:14px"></div>

    <button class="btn" id="kf_save">${isNew ? 'Create track' : 'Save track'}</button>
    ${isNew ? '' : '<button class="btn line" id="kf_delete">Delete this track</button>'}`;
}
/* ------------------------------ handlers ---------------------------------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-track],[data-trackcat],[data-anchor],[data-ripple],[data-strain],[data-type],[data-repeat],#kf_save,#kf_delete');
  if (!el) return;

  if (el.dataset.track !== undefined) { openSheet(trackEditor(el.dataset.track), el); return; }

  if (el.dataset.trackcat !== undefined) {
    toggleIn(window._trackDraft.categories, el.dataset.trackcat);
    el.setAttribute('aria-pressed', String(window._trackDraft.categories.includes(el.dataset.trackcat))); return;
  }
  if (el.dataset.anchor) {
    window._trackDraft.anchor = el.dataset.anchor;
    [...document.querySelectorAll('[data-anchor]')].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.anchor === el.dataset.anchor)));
    return;
  }
  if (el.dataset.ripple) {
    window._trackDraft.ripple = el.dataset.ripple;
    [...document.querySelectorAll('[data-ripple]')].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ripple === el.dataset.ripple)));
    return;
  }
  if (el.id === 'kf_save') {
    const d = window._trackDraft;
    d.name = $('kf_name').value.trim() || 'Track';
    d.total = Math.max(1, parseFloat($('kf_total').value) || 1);
    d.mode = $('kf_mode').value;
    d.endDate = $('kf_end').value;
    d.pace = Math.max(1, parseFloat($('kf_pace').value) || 1);
    const c = $('kf_comfort').value.trim();
    d.comfort = c === '' ? null : Math.max(0.5, parseFloat(c));
    if (d.anchor === 'deadline' && !d.endDate) { setErr('A deadline-anchored track needs a finish date.'); return; }
    if (!d.basePace) d.basePace = d.pace;
    App.W.tracks = App.W.tracks || [];
    const i = App.W.tracks.findIndex(x => x.id === d.id);
    if (i >= 0) App.W.tracks[i] = d; else App.W.tracks.push(d);
    if (d.anchor === 'deadline') fitSlotsToDeadline(App.W, d);
    recomputeTrack(App.W, d);
    save(); closeSheet(); paint(); toast(d.name + ' saved');
    return;
  }
  if (el.id === 'kf_delete') {
    if (el.dataset.armed !== '1') { el.dataset.armed = '1'; el.textContent = 'Tap again to delete'; toast('Tap delete again to confirm'); return; }
    App.W.tracks = (App.W.tracks || []).filter(x => x.id !== $('kf_id').value);
    save(); closeSheet(); paint(); toast('Track deleted — tasks kept'); return;
  }

  /* the three ways out of a strained plan */
  if (el.dataset.strain) {
    const tr = (App.W.tracks || []).find(x => x.id === el.dataset.trackId);
    if (!tr) return;
    const st = trackStatus(App.W, tr);
    if (el.dataset.strain === 'date') {
      tr.endDate = el.dataset.newEnd;
      fitSlotsToDeadline(App.W, tr);
      recomputeTrack(App.W, tr);
      toast('Finish moved to ' + fmtDay(tr.endDate));
    } else if (el.dataset.strain === 'trim') {
      tr.total = Math.round(st.done + st.comfort * st.slots);
      recomputeTrack(App.W, tr);
      toast('Scope trimmed to ' + tr.total + ' — still a finish');
    } else {
      tr.comfort = Math.ceil(st.perSlot) + 1;
      toast('Left as is. No more warnings at this pace.');
    }
    save(); paint(); return;
  }

  /* task types + repeat rule, inside the task editor */
  if (el.dataset.type) {
    const on = el.getAttribute('aria-pressed') !== 'true';
    el.setAttribute('aria-pressed', String(on));
    const box = $('repeatBox');
    if (box) box.hidden = !document.querySelector('[data-type="repeating"][aria-pressed="true"]');
    return;
  }
});
