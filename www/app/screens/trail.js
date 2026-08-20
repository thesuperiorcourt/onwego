import { App } from '../state.js';
import { PAYOUT, daysBetween, fmtDay, fmtLong, today } from '../engine.js';
import { filterTasks, isLogged } from '../tasks.js';
import { isMissed, strainCard } from '../tracks.js';
import { esc } from '../ui.js';

export function renderTrail() {
  const t = today();
  const groups = {};
  filterTasks(App.W, { sort:'date', dir:'asc', scope:'all' }).forEach(task => {
    const k = task.category || 'Everything else';
    (groups[k] = groups[k] || []).push(task);
  });
  let out = '';
  Object.keys(groups).forEach((cat, gi) => {
    const list = groups[cat];
    const doneN = list.filter(x => isLogged(App.W, x)).length;
    out += `<section aria-labelledby="realm${gi}">
      <div class="realm-head">
        <h2 id="realm${gi}">${esc(cat)}</h2>
        <small>${list.length} tasks · ${doneN} logged${list[0].date ? ' · from ' + fmtDay(list[0].date) : ''}</small>
      </div><ol class="trail">`;
    list.forEach(task => {
      const log = App.W.progress.log[task.id];
      const isToday = task.date === t;
      const isMissed = !log && !isToday && task.date && task.date < t;
      const isDone = !!(log && log.result !== 'skip');
      out += `<li class="node ${isDone ? 'done' : ''} ${isToday ? 'today' : ''} ${isMissed ? 'missed' : ''}">
        <p class="d">${task.date ? fmtDay(task.date) : 'Anytime'}${(task.tags||[]).includes('starred') ? ' · <span aria-hidden="true" style="color:var(--glow-ink)">★</span><span class="sr-only">starred</span>' : ''}</p>
        <h3>${esc(task.title)}</h3>
        ${task.range ? `<p>${esc(task.range)}</p>` : ''}
        ${log ? `<p class="res">${log.result === 'skip' ? 'Rested' : PAYOUT[log.result].label} · +${log.xp || 0} ${esc(App.W.xpName)}</p>`
              : isToday ? `<p class="res now">Today — not logged yet</p>`
              : isMissed ? (task.missedAck
                  ? `<p class="res">Folded into the plan</p>`
                  : `<p class="res"><button class="link" data-sheet="pace" aria-haspopup="dialog">Missed — needs a decision</button></p>`)
              : ''}
      </li>`;
    });
    out += '</ol></section>';
  });
  return `<div class="wrap" style="padding-top:calc(20px + var(--safe-t))">
    <div class="sec-head" style="margin-bottom:14px">
      <h1 class="page-title" id="screenTitle">The timeline</h1>
      <button class="link" data-sheet="pace" aria-haspopup="dialog">Catch up</button>
    </div>
    ${App.W.launch ? `<div class="card" style="margin-bottom:6px;border-color:var(--edge-strong)">
      <p class="eyebrow">Finish line</p>
      <h2 style="margin:5px 0 3px">${esc(App.W.launchLabel || 'Launch day')}</h2>
      <p style="margin:0;color:var(--muted);font-size:14px">${fmtLong(App.W.launch)} · ${daysBetween(today(), App.W.launch)} days out</p>
    </div>` : ''}
    ${strainCard()}
    ${out}</div>`;
}
