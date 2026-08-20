import { App } from '../state.js';
import { PAYOUT, daysLeft, fmtDay, levelFor, nextMilestone, streak, today } from '../engine.js';
import { motes, sceneSVG } from '../scene.js';
import { defaultHome, filterTasks } from '../tasks.js';
import { strainCard, tierImpact } from '../tracks.js';
import { esc } from '../ui.js';

export function taskTiers(t, log) {
  const hasNums = t.min || t.max;
  if (!hasNums) {
    const on = !!(log && log.result === 'full');
    return `<div class="tiers" style="grid-template-columns:1fr 1fr">
      <button class="tier" data-log="full" data-task-id="${t.id}" data-units="0" aria-pressed="${on}"
        aria-label="Log ${esc(t.title)} as done, 20 ${esc(App.W.xpName)}${on ? ' — already logged' : ''}">
        <b>Done</b><span class="pay">+20</span></button>
      <button class="tier boss" data-log="boss" data-task-id="${t.id}" data-units="0" aria-pressed="${!!(log && log.result === 'boss')}"
        aria-label="Log ${esc(t.title)} as boss mode, 30 ${esc(App.W.xpName)} and guaranteed loot">
        <b>Boss</b><span class="pay">+30 · loot</span></button></div>`;
  }
  const base = t.max || t.min || 1;
  const amounts = { min: t.min || Math.min(2, base), full: base, boss: base + 3 };
  return `<div class="tiers">${['min','full','boss'].map(k => {
    const p = PAYOUT[k], on = !!(log && log.result === k), amt = amounts[k];
    const name = `${p.label} for ${t.title}: ${amt} ${App.W.unitPlural}, ${p.xp} ${App.W.xpName}${k === 'boss' ? ', guaranteed loot' : ''}${on ? ' — logged' : ''}`;
    const impact = tierImpact(App.W, t, amt);
    return `<button class="tier${k === 'boss' ? ' boss' : ''}" data-log="${k}" data-task-id="${t.id}" data-units="${amt}"
      aria-pressed="${on}" aria-label="${esc(name + (impact ? '. Afterwards: ' + impact : ''))}">
      <b>${p.label.split(' ')[0]}</b><small>${amt} ${esc(App.W.unitPlural)}</small>
      <span class="pay">+${p.xp}${k === 'boss' ? ' · loot' : ''}</span>
      ${impact ? `<span class="impact">${esc(impact)}</span>` : ''}</button>`;
  }).join('')}</div>`;
}

export function taskCard(t, sec, hero) {
  const show = k => (sec.fields || []).includes(k);
  const log = App.W.progress.log[t.id];
  const ms = t.link ? nextMilestone() : null;
  const H = hero ? 'h1' : 'h3';
  const idAttr = hero ? ' id="screenTitle"' : '';
  const starred = (t.tags || []).includes('starred');
  const bits = [];
  if (show('date') && t.date) bits.push(fmtDay(t.date));
  if (show('category') && t.category) bits.push(esc(t.category));
  let out = `<article class="card${hero ? ' quest' : ''}"${hero ? '' : ' style="margin-top:10px"'}>
    ${bits.length || starred ? `<p class="date"><span class="eyebrow">${bits.join(' · ')}</span>
      ${starred ? '<span class="stars"><span aria-hidden="true">★</span><span class="sr-only">Starred</span></span>' : ''}</p>` : ''}
    <${H}${idAttr}${hero ? '' : ' style="font-size:19px;margin-bottom:8px"'}>${esc(t.title || 'Untitled')}</${H}>`;
  if (show('range') && (t.range || t.max)) {
    out += `<p class="target"><b>${esc(t.range || (t.max + ' ' + App.W.unitPlural))}</b>${t.range && t.max ? `<span>· ${t.max} ${esc(App.W.unitPlural)}</span>` : ''}</p>`;
  }
  if (show('tiers')) out += taskTiers(t, log);
  if (show('hook') && t.hook) {
    out += `<div class="bait"><div id="baitSlot_${t.id}">
      <button class="bait-btn" data-bait="${t.id}" aria-expanded="false" aria-controls="baitText_${t.id}">
        <span aria-hidden="true">🔥</span> <span>Peek at the hook</span></button></div></div>`;
  }
  const chips = [];
  if (show('how') && t.how) chips.push(`<span class="chip"><span aria-hidden="true">🎧</span> ${esc(t.how)}</span>`);
  if (show('payoff') && t.payoff) chips.push(`<span class="chip">Payoff: <b>${esc(t.payoff)}</b></span>`);
  if (show('tags') && (t.tags || []).length) chips.push(...t.tags.map(x => `<span class="chip">#${esc(x)}</span>`));
  if (chips.length) out += `<p class="meta">${chips.join('')}</p>`;
  if (show('notes') && t.notes) out += `<p style="margin:12px 0 0;color:var(--muted);font-size:14px">${esc(t.notes)}</p>`;
  if (show('momentum') && ms) {
    const pct = Math.round(Math.min(1, Math.max(0, (App.W.progress.unitsDone - (ms.prevIndex || 0)) / Math.max(1, ms.atIndex - (ms.prevIndex || 0) + 1))) * 100);
    out += `<div class="momentum">
      <p class="row"><span id="msLabel_${t.id}">Progress to ${esc(ms.name)}</span><b>${pct}%</b></p>
      <div class="bar" role="progressbar" aria-labelledby="msLabel_${t.id}" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
    </div>`;
  }
  if (hero) {
    out += `<button class="escape" id="escapeBtn" aria-haspopup="dialog">
      <b><span aria-hidden="true">🧠</span> Attention is garbage right now</b>
      <small>Ten minutes, whatever format works, and you may quit at ten. It still counts, and the streak holds.</small>
    </button>`;
  }
  out += `<p style="margin:14px 0 0"><button class="link" data-task="${t.id}" aria-haspopup="dialog">Edit this task</button></p>`;
  return out + '</article>';
}

export function renderTonight() {
  const lv = levelFor(App.W.progress.xp);
  const ms = nextMilestone();
  const home = App.W.home || defaultHome();
  let heroUsed = false;
  let body = '';

  home.sections.forEach((sec, si) => {
    const list = filterTasks(App.W, {
      categories: sec.categories, tags: sec.tags, scope: sec.scope,
      sort: sec.sort, dir: sec.dir
    }).slice(0, Math.max(1, sec.limit || 1));
    if (!list.length) {
      body += `<section class="sec" aria-labelledby="sec${si}">
        <div class="sec-head"><h2 id="sec${si}">${esc(sec.name)}</h2></div>
        <p class="empty"><b>Nothing here right now</b>Add a task, or widen this section in Today's layout.</p></section>`;
      return;
    }
    if (!heroUsed) {
      heroUsed = true;
      body += taskCard(list[0], sec, true);
      const rest = list.slice(1);
      if (rest.length) {
        body += `<section class="sec" aria-labelledby="sec${si}">
          <div class="sec-head"><h2 id="sec${si}">${esc(sec.name)}</h2></div>
          ${rest.map(t => taskCard(t, sec, false)).join('')}</section>`;
      }
    } else {
      body += `<section class="sec" aria-labelledby="sec${si}">
        <div class="sec-head"><h2 id="sec${si}">${esc(sec.name)}</h2></div>
        ${list.map(t => taskCard(t, sec, false)).join('')}</section>`;
    }
  });

  if (!heroUsed) {
    body = `<div class="card quest"><p class="eyebrow">${fmtDay(today())}</p>
      <h1 id="screenTitle">Nothing scheduled</h1>
      <p style="margin:0;color:var(--muted)">Add a task in the Tasks tab, or change what this screen pulls in.</p></div>` + body;
  }

  const lvPct = Math.round(lv.pct * 100);
  return `
    <div class="scene">${sceneSVG({max:16})}${motes()}<div class="veil"></div>
      <div class="scene-cap">
        <button class="worldbtn" data-sheet="worlds" aria-haspopup="dialog">
          <span class="sr-only">Change world. Current world:</span><b>${esc(App.W.name)}</b><span aria-hidden="true">▾</span></button>
        <button class="counter" data-sheet="pace" aria-haspopup="dialog">
          <span class="sr-only">Pace and catch-up.</span><b>${daysLeft()}</b><small>days left</small></button>
      </div>
    </div>
    <div class="wrap">
      ${body}
      ${strainCard()}
      <div class="sec">
        <button class="sprint" id="sprintBtn" aria-haspopup="dialog">
          <span class="g" aria-hidden="true">⚔️</span>
          <span style="flex:1"><b>Ten-minute sprint</b><small>Set the timer, work, collect what drops.</small></span>
          <span aria-hidden="true" style="color:var(--muted)">›</span>
        </button>
      </div>
      <section class="sec" aria-labelledby="standingH">
        <h2 class="sr-only" id="standingH">Where you stand</h2>
        <div class="grid2">
          <p class="stat"><b>${streak()}</b><small>day streak</small></p>
          <p class="stat"><b>${App.W.progress.coins}</b><small>${esc(App.W.currency)}</small></p>
        </div>
        <div class="momentum" style="margin-top:12px">
          <p class="row"><span id="lvLabel">${esc(lv.name)} · level ${lv.n}</span><b>${App.W.progress.xp} ${esc(App.W.xpName)}</b></p>
          <div class="bar" role="progressbar" aria-labelledby="lvLabel" aria-valuenow="${lvPct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${lvPct}%"></i></div>
        </div>
      </section>
      ${ms ? `<section class="sec" aria-labelledby="shinyH"><div class="card" style="border-color:var(--edge-strong)">
        <p class="eyebrow">Next shiny thing</p>
        <h2 id="shinyH" style="margin:6px 0">${esc(ms.name)}</h2>
        <p style="margin:0;color:var(--muted);font-size:14px">${esc(ms.blurb)}</p>
        <p style="margin:10px 0 0;font-size:13.5px;color:var(--glow-ink)">${Math.max(0, ms.atIndex - App.W.progress.unitsDone + 1)} ${esc(App.W.unitPlural)} away${ms.reward === 'biome' ? ' · unlocks a new biome' : ms.reward === 'legendary' ? ' · plants a legendary tree' : ''}</p>
      </div></section>` : ''}
      <div class="sec">
        <button class="btn line" data-sheet="home" aria-haspopup="dialog">Choose what shows on this screen</button>
        <button class="btn line" data-sheet="position" aria-haspopup="dialog">Not where the plan thinks you are? Fix your place</button>
      </div>
    </div>`;
}
