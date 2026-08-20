const { bootApp } = require('./_lib/boot.cjs');
const P=(c,m)=>console.log((c?'PASS':'FAIL')+' — '+m);
const audit=(d,w)=>{
  const hs=[...d.querySelectorAll('h1,h2,h3,h4')].map(h=>+h.tagName[1]);
  let ok=true,prev=hs[0];hs.forEach(l=>{if(l>prev+1)ok=false;prev=l});
  P(d.querySelectorAll('h1').length===1,w+': one h1');
  P(ok,w+': headings ok ('+hs.join(',')+')');
  P([...d.querySelectorAll('button')].every(b=>((b.getAttribute('aria-label')||b.textContent||'').replace(/\s/g,'')).length>1),w+': buttons named');
  const inputs=[...d.querySelectorAll('input:not([type=hidden]),select,textarea')];
  P(inputs.every(i=>i.id&&d.querySelector('label[for="'+i.id+'"]')),w+': inputs labelled');
  P([...d.querySelectorAll('.g')].every(e=>e.getAttribute('aria-hidden')==='true'),w+': emoji hidden');
};

(async () => {
  const { document: d, G } = await bootApp();
  // tier impact must reach a screen reader too
  const t=d.querySelector('.tier.boss');
  P(/Afterwards:/.test(t.getAttribute('aria-label')),'tier label states the consequence: '+t.getAttribute('aria-label').slice(-40));
  d.querySelector('[data-view=tasks]').click(); audit(d,'Tasks with tracks');
  const bar=d.querySelector('.row-item .bar');
  P(bar&&bar.getAttribute('role')==='progressbar'&&bar.hasAttribute('aria-label'),'track progress bar exposed');
  d.querySelector('[data-track]:not([data-track="new"])').click(); audit(d,'Track editor');
  P([...d.querySelectorAll('[data-anchor],[data-ripple]')].every(b=>b.hasAttribute('aria-pressed')),'anchor and ripple choices expose pressed state');
  d.querySelector('[data-close]').click();
  G("App.W.tracks[0].comfort=2; recomputeTrack(App.W,App.W.tracks[0]);");
  d.querySelector('[data-view=tonight]').click(); audit(d,'Tonight with warning');
  P(d.querySelectorAll('[data-strain]').length===3,'warning offers three named buttons');
  d.querySelector('[data-view=tasks]').click();
  d.querySelector('#taskList [data-task]').click(); audit(d,'Task editor with types');
  P([...d.querySelectorAll('[data-type]')].every(b=>b.hasAttribute('aria-pressed')),'type chips expose pressed state');
  P(!!d.querySelector('#repeatBox'),'repeat controls present');
  process.exit(0);
})();
