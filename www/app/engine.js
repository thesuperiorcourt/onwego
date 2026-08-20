import { App } from './state.js';
import { migrateTasks } from './tasks.js';
import { migrateTracks } from './tracks.js';
import { esc, openDrop } from './ui.js';
import { save } from './main.js';
import { MAASVERSE_CAMPAIGN } from '../seed/campaign.js';

/* ------------------------------ progression ------------------------------- */
export const LEVELS = [
  { at:0,   name:'Page One' },      { at:60,  name:'Kindling' },
  { at:150, name:'Wanderer' },      { at:280, name:'Marked' },
  { at:450, name:'Gatewalker' },    { at:660, name:'Stormcaller' },
  { at:920, name:'Fireheart' },     { at:1230,name:'Oathkeeper' },
  { at:1600,name:'Worldwalker' },   { at:2030,name:'Starborn' },
  { at:2520,name:'Godslayer' },     { at:3080,name:'The One Who Finished' }
];

export const PAYOUT = {
  min:  { xp:10, coins:5,  label:'Minimum win', sub:'A little. Still counts.',   lootChance:0    },
  full: { xp:20, coins:12, label:'Full clear',  sub:"Today's whole target",      lootChance:0.35 },
  boss: { xp:30, coins:20, label:'Boss mode',   sub:'You kept going',            lootChance:1    }
};

export const LOOT = [
  { g:'🕯️', n:'Guttering Candle',   r:'common' },   { g:'🪶', n:'Inked Quill',       r:'common' },
  { g:'🍂', n:'Pressed Leaf',       r:'common' },   { g:'🔑', n:'Small Brass Key',    r:'common' },
  { g:'🫙', n:'Jar of Nothing',     r:'common' },   { g:'🧭', n:'Off Compass',        r:'common' },
  { g:'🍄', n:'Glowcap',            r:'rare' },     { g:'🪺', n:'Abandoned Nest',     r:'rare' },
  { g:'💧', n:'Vial of Rain',       r:'rare' },     { g:'🗝️', n:'Gate Key',          r:'rare' },
  { g:'🪞', n:'Honest Mirror',      r:'epic' },     { g:'🜲', n:'Wyrdmark',           r:'epic' },
  { g:'🦴', n:'Something Old',      r:'epic' },     { g:'👑', n:'Crown of Ash',       r:'legendary' },
  { g:'🌟', n:'Fallen Star',        r:'legendary' },{ g:'🐉', n:'Wyvern Scale',       r:'legendary' }
];
export const RARITY_W = { common:0.55, rare:0.29, epic:0.13, legendary:0.03 };

export const DEFAULT_SHOP = [
  { g:'☕', n:'Fancy coffee',            c:25  },
  { g:'🎮', n:'Guilt-free gaming night', c:50  },
  { g:'🍬', n:'Silly little treat',      c:75  },
  { g:'🎁', n:'Something new',           c:150 },
  { g:'🏆', n:'Campaign boss reward',    c:250 }
];
/* --------------------------------- dates ---------------------------------- */
export const iso = d => d.toISOString().slice(0,10);
export const parseISO = s => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); };
export const today = () => iso(new Date(Date.now() - new Date().getTimezoneOffset()*60000));
export const fmtDay = s => parseISO(s).toLocaleDateString(undefined,{ month:'short', day:'numeric' }).toUpperCase();
export const fmtLong = s => parseISO(s).toLocaleDateString(undefined,{ weekday:'long', month:'long', day:'numeric' });
export const daysBetween = (a,b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
/* ------------------------------ world engine -------------------------------
   A world is a campaign of ordered units (chapters, episodes, lessons…)
   spread across dates. Everything else — bait, milestones, the grove — hangs
   off the unit index, so falling behind never invalidates the story.        */

export function unitLabel(w, globalIdx) {
  let n = globalIdx;
  for (const b of w.books) {
    if (n < b.units) {
      if (b.labels) return b.labels[n];
      if (n === 0 && b.first) return b.first;
      if (n === b.units - 1 && b.last) return b.last;
      return (w.unit || 'unit') + ' ' + (n + 1);
    }
    n -= b.units;
  }
  return '—';
}
export function bookAt(w, globalIdx) {
  let n = globalIdx;
  for (const b of w.books) { if (n < b.units) return b; n -= b.units; }
  return w.books[w.books.length - 1];
}
export function bookOffset(w, bookId) {
  let n = 0;
  for (const b of w.books) { if (b.id === bookId) return n; n += b.units; }
  return 0;
}
export function totalUnits(w) { return w.books.reduce((s,b) => s + b.units, 0); }

export function baitFor(w, fromGlobal, toGlobal) {
  const bk = bookAt(w, fromGlobal), off = bookOffset(w, bk.id);
  const a = fromGlobal - off, z = toGlobal - off;
  let best = null;
  (w.baits || []).forEach(band => {
    if (band.b !== bk.id) return;
    if (z < band.a || a > band.z) return;
    if (!best || band.s > best.s) best = band;
  });
  return best || { t:'Distance night. No cliff, no wall — just pages behind you.', s:0 };
}

/* Attach global unit indexes to the shipped plan (first run only). */
export function indexDays(w) {
  let cursor = 0;
  w.days.forEach(d => {
    d.fromGlobal = cursor;
    d.toGlobal = cursor + d.goal - 1;
    cursor += d.goal;
  });
}

export function dayFor(w, date) { return w.days.find(d => d.date === date) || null; }
export function levelFor(xp) {
  let idx = 0;
  LEVELS.forEach((l, i) => { if (xp >= l.at) idx = i; });
  const next = LEVELS[idx + 1];
  return {
    n: idx + 1, name: LEVELS[idx].name, at: LEVELS[idx].at,
    nextAt: next ? next.at : null,
    pct: next ? (xp - LEVELS[idx].at) / (next.at - LEVELS[idx].at) : 1
  };
}

export function rollLoot(guaranteedRarity) {
  let rarity = guaranteedRarity;
  if (!rarity) {
    const roll = Math.random(); let acc = 0;
    for (const [r, w] of Object.entries(RARITY_W)) { acc += w; if (roll <= acc) { rarity = r; break; } }
    rarity = rarity || 'common';
  }
  const pool = LOOT.filter(l => l.r === rarity);
  const item = pool[Math.floor(Math.random() * pool.length)];
  return { ...item, at: Date.now() };
}
/* --------------------------- world construction --------------------------- */
export function newProgress() {
  return { unitsDone:0, xp:0, coins:0, log:{}, loot:[], flora:[], biomes:[], achieved:[],
           shop: DEFAULT_SHOP.map(s => ({...s})), claimed:[], sprints:0, sprintMinutes:0 };
}

export function makeWorld(spec) {
  /* spec: {name, unit, unitPlural, currency, theme, start, end, launch, launchLabel, parts:[{name,units}]} */
  const id = 'w' + Date.now().toString(36);
  const books = spec.parts.map((p, i) => ({
    id: 'p' + i, title: p.name, short: p.name.slice(0, 3).toUpperCase(),
    realm: p.name, units: p.units
  }));
  const dates = [];
  for (let d = parseISO(spec.start); iso(d) <= spec.end; d.setDate(d.getDate() + 1)) dates.push(iso(d));
  const total = books.reduce((s,b) => s + b.units, 0);
  const per = total / dates.length;
  const titles = ['OPENING MOVE','FIND THE RHYTHM','KEEP THE THREAD','QUIET PROGRESS','THE MIDDLE IS THE TRAP',
                  'PAST HALFWAY','MOMENTUM','THE TURN','CLOSING IN','FINAL APPROACH','LAST STRETCH','FINISH IT'];
  let cursor = 0, acc = 0;
  const days = dates.map((date, i) => {
    acc += per;
    let take = Math.round(acc) - cursor;
    if (i === dates.length - 1) take = total - cursor;
    const from = cursor; cursor += take;
    let acc2 = 0, bid = books[0].id;
    for (const b of books) { if (from < acc2 + b.units) { bid = b.id; break; } acc2 += b.units; }
    return { date, book: bid, title: titles[i % titles.length], goal: take,
             minWin: Math.min(2, take), stars: 0, mode: 'Whatever works', speed: '—' };
  });
  const baits = [];
  books.forEach(b => {
    const marks = [0, .12, .3, .5, .72, .9, 1];
    const texts = [
      ['Opening stretch. Only job: get back into it.', 1],
      ['The setup stops being setup here.', 0],
      ['Rhythm section. Distance covered, nothing dramatic.', 0],
      ['Midpoint. The pile behind you is bigger than the pile ahead.', 1],
      ['This is the part that goes fast.', 1],
      ['Final approach. You already know you\'re finishing.', 3]
    ];
    for (let i = 0; i < marks.length - 1; i++) {
      const a = Math.floor(marks[i]*b.units), z = Math.max(a, Math.floor(marks[i+1]*b.units) - 1);
      baits.push({ b:b.id, a, z, t:texts[i][0], s:texts[i][1] });
    }
  });
  const BIOMES = ['gatefield','lunathion','eternal','beneath','grove'];
  const milestones = books.map((b, i) => ({
    id: 'ms' + i, book: b.id, atUnit: 'end', atIndex: b.units - 1,
    name: b.title + ' — done', blurb: 'One more finished thing.',
    reward: i === books.length - 1 ? 'legendary' : 'biome', biome: BIOMES[i % BIOMES.length], icon:'crown'
  }));
  return {
    id, name: spec.name, tagline: spec.tagline || '', unit: spec.unit || 'chapter',
    unitPlural: spec.unitPlural || (spec.unit ? spec.unit + 's' : 'chapters'),
    currency: spec.currency || 'Coins', xpName: 'XP', theme: spec.theme || 'meadow',
    start: spec.start, end: spec.end, launch: spec.launch || '', launchLabel: spec.launchLabel || '',
    books, days, baits, milestones, progress: newProgress()
  };
}
/* ------------------------------- derived ---------------------------------- */
export function campaignPct() { return Math.min(1, App.W.progress.unitsDone / totalUnits(App.W)); }
export function streak() {
  /* A streak day is any day something streak-eligible was logged. Skipping
     never zeroes it — it just stops adding. */
  const days = new Set();
  Object.keys(App.W.progress.log).forEach(id => {
    const l = App.W.progress.log[id];
    if (!l || l.result === 'skip') return;
    const task = (App.W.tasks || []).find(t => t.id === id);
    if (task && task.streak === false) return;
    days.add(l.date || id);
  });
  let n = 0, d = today();
  if (!days.has(d)) d = iso(new Date(parseISO(d).getTime() - 86400000));
  while (days.has(d)) { n++; d = iso(new Date(parseISO(d).getTime() - 86400000)); }
  return n;
}
export function nextMilestone() {
  const done = App.W.progress.unitsDone;
  return (App.W.milestones || []).map(m => ({...m})).filter(m => m.atIndex >= done)
    .sort((a,b) => a.atIndex - b.atIndex)[0] || null;
}
export function daysLeft() {
  const t = today();
  return Math.max(0, App.W.days.filter(d => d.date >= t).length);
}
/* ============================================================
   SCREENS
   Rules followed here:
   · one <h1> per screen, headings never skip a level
   · every control has a text name; emoji are decoration only
   · state is never carried by colour alone — there is always a word
   · progress bars expose their value to assistive tech
   ============================================================ */

export const RARITY_LABEL = { common:'Common', rare:'Rare', epic:'Epic', legendary:'Legendary' };
export function biomeName(id) {
  return ({ gatefield:'The Gate Field', lunathion:'Neon Quarter', eternal:'The Eternal Terrace',
            beneath:'Beneath', grove:'The Deep Grove' })[id] || 'New ground';
}

export function grantLoot(rarity) {
  const item = rollLoot(rarity);
  App.W.progress.loot.push(item);
  return item;
}
export function showDrop(item) {
  openDrop(`<span class="g" aria-hidden="true">${item.g}</span>
    <p class="rarity">${RARITY_LABEL[item.r]} loot</p>
    <h2>${esc(item.n)}</h2>
    <p>Dropped into your rewards.</p>
    <button class="btn" data-close="1">Take it</button>`);
}
export function checkMilestones() {
  const done = App.W.progress.unitsDone;
  const hit = (App.W.milestones || []).filter(m => !App.W.progress.achieved.includes(m.id) && m.atIndex <= done - 1);
  if (!hit.length) return null;
  let last = null;
  hit.forEach(m => {
    App.W.progress.achieved.push(m.id);
    App.W.progress.coins += 25;
    if (m.reward === 'biome' && m.biome && !App.W.progress.biomes.includes(m.biome)) App.W.progress.biomes.push(m.biome);
    if (m.reward === 'legendary' || m.reward === 'biome') {
      App.W.progress.flora.push({ kind:'legendary', date:today(), seed:Math.floor(Math.random()*99999), milestone:m.id });
    }
    last = m;
  });
  const item = grantLoot('legendary');
  save();
  setTimeout(() => openDrop(`<span class="g" aria-hidden="true">${last.reward === 'biome' ? '🏞️' : '🌳'}</span>
    <p class="rarity">Milestone reached</p>
    <h2>${esc(last.name)}</h2>
    <p>${esc(last.blurb)}</p>
    <p style="color:var(--glow-ink);font-size:13.5px;margin:-6px 0 18px">
      ${last.reward === 'biome' ? biomeName(last.biome) + ' unlocked' : 'A legendary tree takes root'} · +25 ${esc(App.W.currency)} · ${esc(item.n)} added to your rewards</p>
    <button class="btn" data-close="1">See the rewards</button>`), 260);
  return last;
}
/* -------------------------------- boot ------------------------------------ */
export function linkMilestones(w) {
  (w.milestones || []).forEach(m => {
    if (typeof m.atIndex === 'number') return;
    const off = bookOffset(w, m.book), bk = w.books.find(b => b.id === m.book);
    if (!bk) { m.atIndex = 0; return; }
    let found = bk.units - 1;
    for (let i = 0; i < bk.units; i++) if (unitLabel(w, off + i) === m.atUnit) { found = i; break; }
    m.atIndex = off + found;
  });
  let prev = 0;
  (w.milestones || []).sort((a,b) => a.atIndex - b.atIndex).forEach(m => { m.prevIndex = prev; prev = m.atIndex + 1; });
}

export function seedMaasverse() {
  const w = JSON.parse(JSON.stringify(MAASVERSE_CAMPAIGN));
  w.progress = newProgress();
  w.progress.shop = DEFAULT_SHOP.map(s => ({...s}));
  indexDays(w); linkMilestones(w); migrateTasks(w); migrateTracks(w);
  return w;
}
/* ------------------------------- logging ---------------------------------- */
export const FLORA_FOR = { min:'sprout', full:'tree', boss:'bloom' };
