import { App } from '../state.js';
import { THEMES } from '../themes.js';
import { RARITY_LABEL, biomeName, levelFor } from '../engine.js';
import { motes, sceneSVG } from '../scene.js';
import { esc } from '../ui.js';

export function renderHoard() {
  const lv = levelFor(App.W.progress.xp);
  const lvPct = Math.round(lv.pct * 100);
  const loot = (App.W.progress.loot || []).slice().reverse();
  const counts = {};
  loot.forEach(l => { counts[l.n] = counts[l.n] || { ...l, c:0 }; counts[l.n].c++; });
  const items = Object.values(counts);
  const achieved = App.W.progress.achieved || [];
  const flora = App.W.progress.flora || [];
  const biomes = [{ id:'home', name:'The Starting Wood', unlocked:true, by:'' }].concat(
    (App.W.milestones || []).filter(m => m.reward === 'biome').map(m => ({
      id: m.biome, name: biomeName(m.biome), unlocked: (App.W.progress.biomes||[]).includes(m.biome), by: m.name
    })));
  const open = biomes.filter(b => b.unlocked).length;
  return `
    <div class="scene" style="height:38vh">${sceneSVG({max:24})}${motes()}<div class="veil"></div>
      <div class="scene-cap"><button class="worldbtn" data-sheet="themes" aria-haspopup="dialog">
        <span aria-hidden="true">🎨</span><span class="sr-only">Change theme pack. Current pack:</span><b>${THEMES[App.W.theme].name}</b><span aria-hidden="true">▾</span></button></div>
    </div>
    <div class="wrap" style="padding-top:14px">
    <div class="sec-head" style="margin-bottom:14px">
      <h1 class="page-title" id="screenTitle">The rewards</h1>
      <button class="link" data-sheet="settings" aria-haspopup="dialog">Settings</button>
    </div>
    <section class="card" aria-labelledby="lvH">
      <p class="eyebrow">${esc(lv.name)}</p>
      <h2 id="lvH" style="font-size:32px;margin:6px 0 10px">Level ${lv.n}</h2>
      <div class="bar" role="progressbar" aria-labelledby="lvH" aria-valuenow="${lvPct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${lvPct}%"></i></div>
      <p class="row" style="display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin:7px 0 0">
        <span>${App.W.progress.xp} ${esc(App.W.xpName)}</span>${lv.nextAt ? `<span>${lv.nextAt - App.W.progress.xp} to the next level</span>` : '<span>Top level</span>'}
      </p>
      <div class="grid2" style="margin-top:14px">
        <p class="stat"><b>${App.W.progress.coins}</b><small>${esc(App.W.currency)}</small></p>
        <p class="stat"><b>${App.W.progress.unitsDone}</b><small>${esc(App.W.unitPlural)} read</small></p>
      </div>
    </section>
    <section class="sec" aria-labelledby="growH">
      <div class="sec-head"><h2 id="growH">Garden</h2><span class="eyebrow">${flora.length} ${flora.length === 1 ? 'thing' : 'things'} growing</span></div>
      <p style="margin:0 0 10px;color:var(--muted);font-size:14.5px">Every logged day plants something. Nothing here wilts, dies, or gets taken away — including on the days you skip.</p>
      <p class="meta">
        <span class="chip"><span aria-hidden="true">🌱</span> <b>${flora.filter(f=>f.kind==='sprout').length}</b> sprouts</span>
        <span class="chip"><span aria-hidden="true">🌳</span> <b>${flora.filter(f=>f.kind==='tree'||f.kind==='bloom').length}</b> trees</span>
        <span class="chip"><span aria-hidden="true">✨</span> <b>${flora.filter(f=>f.kind==='legendary').length}</b> legendary</span>
      </p>
    </section>
    <section class="sec" aria-labelledby="biomeH">
      <div class="sec-head"><h2 id="biomeH">Biomes</h2><span class="eyebrow">${open} of ${biomes.length} open</span></div>
      <ul class="shelf">
        ${biomes.map(b => `<li class="row-item ${b.unlocked ? '' : 'locked'}">
          <span class="g" aria-hidden="true">${b.unlocked ? '🏞️' : '🌫️'}</span>
          <span class="t"><b>${esc(b.name)}</b><small>${b.unlocked ? 'Open' : 'Locked — unlocks at ' + esc(b.by || 'a milestone')}</small></span>
        </li>`).join('')}
      </ul>
    </section>
    <section class="sec" aria-labelledby="lootH">
      <div class="sec-head"><h2 id="lootH">Loot</h2><span class="eyebrow">${loot.length} items</span></div>
      ${items.length ? `<ul class="loot-grid">${items.map(l => `<li class="loot ${l.r}">
        <span class="g" aria-hidden="true">${l.g}</span><span class="n">${esc(l.n)}</span>
        <small>${RARITY_LABEL[l.r]}${l.c > 1 ? ' ×' + l.c : ''}</small></li>`).join('')}</ul>`
      : `<p class="empty"><b>Nothing yet</b>Boss mode always drops something. Full clears drop about a third of the time.</p>`}
    </section>
    <section class="sec" aria-labelledby="shopH">
      <div class="sec-head"><h2 id="shopH">Reward shop</h2><button class="link" data-sheet="addreward" aria-haspopup="dialog">Add a reward</button></div>
      <ul class="shelf">
        ${App.W.progress.shop.map((s,i) => {
          const can = App.W.progress.coins >= s.c;
          const name = `${s.n}, ${s.c} ${App.W.currency}. ${can ? 'Ready to redeem' : (s.c - App.W.progress.coins) + ' more needed'}`;
          return `<li><button class="row-item ${can ? '' : 'locked'}" data-buy="${i}" aria-label="${esc(name)}">
            <span class="g" aria-hidden="true">${s.g}</span>
            <span class="t"><b>${esc(s.n)}</b><small>${can ? 'Ready to redeem' : (s.c - App.W.progress.coins) + ' more ' + esc(App.W.currency)}</small></span>
            <span class="price" aria-hidden="true">${s.c}</span></button></li>`;
        }).join('')}
      </ul>
    </section>
    <section class="sec" aria-labelledby="msH">
      <div class="sec-head"><h2 id="msH">Milestones</h2><span class="eyebrow">${achieved.length} of ${(App.W.milestones||[]).length} earned</span></div>
      <ul class="shelf">
        ${(App.W.milestones||[]).map(m => {
          const got = achieved.includes(m.id);
          const where = m.atUnit === 'end' ? 'the end of ' + ((App.W.books.find(b=>b.id===m.book)||{}).title || 'this part') : m.atUnit;
          return `<li class="row-item ach ${got ? 'got' : 'locked'}">
            <span class="g" aria-hidden="true">${got ? '🏅' : '🔒'}</span>
            <span class="t"><b>${esc(m.name)}</b><small>${got ? 'Earned — ' + esc(m.blurb) : 'Locked — at ' + esc(where)}</small></span>
          </li>`;
        }).join('')}
      </ul>
    </section>
    <section class="sec" aria-labelledby="focusH">
      <h2 class="sr-only" id="focusH">Focus sessions</h2>
      <div class="grid2">
        <p class="stat"><b>${App.W.progress.sprints || 0}</b><small>sprints run</small></p>
        <p class="stat"><b>${App.W.progress.sprintMinutes || 0}</b><small>focus minutes</small></p>
      </div>
    </section>
  </div>`;
}
