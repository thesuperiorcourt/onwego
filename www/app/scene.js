import { App } from './state.js';
import { THEMES } from './themes.js';
import { campaignPct } from './engine.js';

/* seeded noise so the sky and the grove look the same every time you open it */
export function mulberry(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ------------------------------ the scene --------------------------------- */
export function floraSVG(f, th, x, y, seed, scale) {
  const r = mulberry(seed);
  const c = th.canopy[Math.floor(r() * th.canopy.length)];
  const s = (scale || 1) * (f.kind === 'legendary' ? 1.6 : f.kind === 'bloom' ? 1.15 : f.kind === 'tree' ? 1 : .62);
  const g = [];
  g.push(`<g transform="translate(${x} ${y}) scale(${s.toFixed(2)})">`);
  if (f.kind === 'sprout') {
    g.push(`<path d="M0 0 L0 -13" stroke="${th.trunk}" stroke-width="2.4" stroke-linecap="round"/>`);
    g.push(`<ellipse cx="-5" cy="-12" rx="6" ry="3.4" fill="${c}" transform="rotate(-24 -5 -12)"/>`);
    g.push(`<ellipse cx="5" cy="-15" rx="6" ry="3.4" fill="${c}" transform="rotate(24 5 -15)"/>`);
  } else {
    const h = 22 + r() * 8;
    g.push(`<path d="M0 0 L0 ${-h}" stroke="${th.trunk}" stroke-width="3.4" stroke-linecap="round"/>`);
    if (f.kind === 'legendary') g.push(`<circle cx="0" cy="${-h - 12}" r="26" fill="${th.bloomDot}" opacity=".18"/>`);
    g.push(`<circle cx="0" cy="${-h - 10}" r="13" fill="${c}"/>`);
    g.push(`<circle cx="-10" cy="${-h - 3}" r="9.5" fill="${c}" opacity=".92"/>`);
    g.push(`<circle cx="10" cy="${-h - 4}" r="9" fill="${c}" opacity=".92"/>`);
    if (f.kind === 'bloom' || f.kind === 'legendary') {
      for (let i = 0; i < (f.kind === 'legendary' ? 7 : 4); i++) {
        g.push(`<circle cx="${(r()*26-13).toFixed(1)}" cy="${(-h-14+r()*16).toFixed(1)}" r="2.1" fill="${th.bloomDot}"/>`);
      }
    }
    if (f.kind === 'legendary') g.push(`<path d="M0 ${-h-27} l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="${th.bloomDot}"/>`);
  }
  g.push('</g>');
  return g.join('');
}

export function sceneSVG(opts) {
  const th = THEMES[App.W.theme] || THEMES.midnight;
  const pct = campaignPct();
  const flora = (App.W.progress.flora || []).slice(-(opts.max || 16));
  const H = 300, GY = 232;
  const p = [];
  p.push(`<svg viewBox="0 0 400 ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">`);
  p.push(`<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${th.vars['--sky-1']}"/>
      <stop offset="55%" stop-color="${th.vars['--sky-2']}"/>
      <stop offset="100%" stop-color="${th.vars['--sky-3']}"/>
    </linearGradient>
    <radialGradient id="halo"><stop offset="0%" stop-color="${th.vars['--glow']}" stop-opacity=".55"/><stop offset="100%" stop-color="${th.vars['--glow']}" stop-opacity="0"/></radialGradient>
  </defs>`);
  p.push(`<rect width="400" height="${H}" fill="url(#sky)"/>`);

  const r = mulberry(9421);
  for (let i = 0; i < th.sky.stars; i++) {
    const x = r() * 400, y = r() * (GY - 60), rad = r() * 1.3 + .5, o = (.35 + r() * .6).toFixed(2);
    p.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" fill="${th.vars['--ink']}" opacity="${o}"/>`);
  }
  /* the moon keeps time: new at day one, full on the last day */
  if (th.sky.moon) {
    const mx = 305, my = 62, mr = 26, shift = (pct * 2 - 1) * mr * 2.1;
    p.push(`<circle cx="${mx}" cy="${my}" r="${mr + 26}" fill="url(#halo)"/>`);
    p.push(`<circle cx="${mx}" cy="${my}" r="${mr}" fill="${th.vars['--glow']}"/>`);
    p.push(`<circle cx="${(mx + shift).toFixed(1)}" cy="${my}" r="${mr}" fill="${th.vars['--sky-2']}" opacity="${pct >= .99 ? 0 : .96}"/>`);
    p.push(`<circle cx="${mx}" cy="${my}" r="${mr}" fill="none" stroke="${th.vars['--glow']}" stroke-width="1" opacity=".5"/>`);
  }
  /* the sun rises toward the finish line */
  if (th.sky.sun === 'rising') {
    const sy = GY + 46 - pct * 62;
    p.push(`<circle cx="86" cy="${sy.toFixed(1)}" r="70" fill="url(#halo)" opacity=".7"/>`);
    p.push(`<circle cx="86" cy="${sy.toFixed(1)}" r="24" fill="${th.vars['--glow']}" opacity=".9"/>`);
  } else if (th.sky.sun === 'high') {
    p.push(`<circle cx="312" cy="58" r="64" fill="url(#halo)"/><circle cx="312" cy="58" r="27" fill="${th.vars['--glow']}"/>`);
  } else if (th.sky.sun === 'setting') {
    p.push(`<circle cx="300" cy="176" r="78" fill="url(#halo)"/><circle cx="300" cy="176" r="30" fill="${th.vars['--glow']}" opacity=".92"/>`);
  }
  for (let i = 0; i < th.sky.clouds; i++) {
    const cx = 40 + i * 130 + r() * 40, cy = 50 + r() * 46;
    p.push(`<g opacity=".5" fill="${th.vars['--ink']}"><ellipse cx="${cx}" cy="${cy}" rx="30" ry="12"/><ellipse cx="${cx+20}" cy="${cy-6}" rx="20" ry="11"/><ellipse cx="${cx-20}" cy="${cy-3}" rx="17" ry="9"/></g>`);
  }
  /* land */
  p.push(`<path d="M0 ${GY-16} Q70 ${GY-40} 150 ${GY-18} T400 ${GY-30} L400 ${H} L0 ${H} Z" fill="${th.vars['--ground-2']}" opacity=".85"/>`);
  p.push(`<path d="M0 ${GY} Q110 ${GY-14} 230 ${GY+4} T400 ${GY-6} L400 ${H} L0 ${H} Z" fill="${th.vars['--ground']}"/>`);

  flora.forEach((f, i) => {
    const rr = mulberry(f.seed || i * 977);
    const x = 24 + ((i * 47 + (f.seed || 0) % 23) % 356);
    const y = GY + 6 + rr() * 34;
    p.push(floraSVG(f, th, x, y, f.seed || i * 331, .82 + rr() * .3));
  });
  p.push('</svg>');
  return p.join('');
}

export function motes() {
  const th = THEMES[App.W.theme] || THEMES.midnight;
  const calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm) return '';
  const r = mulberry(77);
  let out = '';
  for (let i = 0; i < 9; i++) {
    const size = (2 + r() * 3).toFixed(1), left = (r() * 100).toFixed(1),
          top = (55 + r() * 40).toFixed(1), dur = (6 + r() * 8).toFixed(1), del = (r() * 8).toFixed(1);
    const color = th.sky.motes === 'bubble' ? th.vars['--leaf'] : th.sky.motes === 'petal' ? th.vars['--bloom'] : th.vars['--glow'];
    out += `<i class="mote" style="width:${size}px;height:${size}px;left:${left}%;top:${top}%;animation-duration:${dur}s;animation-delay:${del}s;background:${color}"></i>`;
  }
  return out;
}
