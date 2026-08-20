const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(require('path').join(__dirname,'..','www','index.html'),'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/'});
const {window}=dom; const d=window.document;
window.addEventListener('error',e=>console.log('PAGE ERROR:',e.message));
const P=(c,m)=>console.log((c?'PASS':'FAIL')+' — '+m);
setTimeout(()=>{
  // structure
  P(d.querySelectorAll('h1').length===1,'exactly one h1 ('+d.querySelectorAll('h1').length+')');
  P(!!d.querySelector('main#main'),'main landmark');
  P(!!d.querySelector('nav[aria-label]'),'labelled nav');
  P(!!d.querySelector('a.skip'),'skip link');
  P(d.title.startsWith('Today'),'page title: '+d.title);
  P(!!d.querySelector('[role=status][aria-live]'),'live region');
  P(d.querySelector('.dock [aria-current="page"]').textContent.includes('Today'),'dock marks current');
  // headings never skip
  const hs=[...d.querySelectorAll('h1,h2,h3,h4')].map(h=>+h.tagName[1]);
  let ok=true,prev=hs[0]; hs.forEach(l=>{if(l>prev+1)ok=false;prev=l});
  P(ok,'heading levels never skip: '+hs.join(','));
  // names on controls
  const unnamed=[...d.querySelectorAll('button')].filter(b=>{
    const t=(b.getAttribute('aria-label')||b.textContent||'').replace(/[\s\u200b]/g,'');
    return t.length<2;});
  P(unnamed.length===0,'every button has a name (unnamed: '+unnamed.length+')');
  // emoji hidden from AT
  const bare=[...d.querySelectorAll('.g')].filter(e=>e.getAttribute('aria-hidden')!=='true');
  P(bare.length===0,'decorative emoji hidden ('+bare.length+' exposed)');
  // progressbars
  const pb=[...d.querySelectorAll('[role=progressbar]')];
  P(pb.length>=2 && pb.every(b=>b.hasAttribute('aria-valuenow')&&b.hasAttribute('aria-labelledby')),'progress bars expose value ('+pb.length+')');
  // tiers
  P([...d.querySelectorAll('.tier')].every(t=>t.hasAttribute('aria-pressed')&&t.getAttribute('aria-label').length>10),'tier buttons pressed-state + label');
  // bait toggle
  const bait=d.querySelector('[data-bait]');
  P(bait.getAttribute('aria-expanded')==='false','bait collapsed initially');
  bait.click();
  P(!!d.querySelector('.bait-open'),'bait expands in place');
  // dialog semantics + focus
  d.querySelector('[data-view=hoard]').click();
  P(d.activeElement===d.querySelector('#screenTitle'),'focus moves to screen title on nav');
  const opener=d.querySelector('[data-sheet=settings]'); opener.click();
  const dlg=d.querySelector('.sheet');
  P(dlg.getAttribute('role')==='dialog'&&dlg.getAttribute('aria-modal')==='true','sheet is a modal dialog');
  P(dlg.getAttribute('aria-labelledby')==='dialogTitle'&&!!dlg.querySelector('#dialogTitle'),'dialog labelled by its heading');
  P(d.activeElement===dlg.querySelector('#dialogTitle'),'focus moves into dialog');
  P(!!dlg.querySelector('[data-close]'),'dialog has a close button');
  // escape closes + returns focus
  d.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  P(!d.querySelector('.sheet'),'Escape closes the dialog');
  P(d.activeElement===opener,'focus returns to the opener');
  // motion toggle
  d.querySelector('[data-sheet=settings]').click();
  const calm=d.querySelector('#calmToggle');
  P(calm.getAttribute('aria-pressed')==='false','reduce-motion switch present, off');
  calm.click();
  setTimeout(()=>{
    P(d.documentElement.classList.contains('calm'),'reduce motion applies a class');
    P(d.querySelector('#live').textContent.length>0,'announcement written to live region');
    // theme swatches
    d.querySelector('[data-close]').click();
    d.querySelector('[data-view=hoard]').click();
    d.querySelector('[data-sheet=themes]').click();
    const sw=[...d.querySelectorAll('.sw')];
    P(sw.length===5&&sw.every(s=>s.hasAttribute('aria-pressed')&&s.getAttribute('aria-label')),'theme swatches labelled + pressed');
    P(sw.filter(s=>s.getAttribute('aria-pressed')==='true').length===1,'one theme marked selected');
    // loot rarity not colour-only
    d.querySelector('[data-close]').click();
    d.querySelector('[data-view=trail]').click();
    const today=d.querySelector('.node.today');
    P(today && /Today|Full clear|Minimum|Boss/.test(today.textContent),'today node states its status in words, not just a coloured dot');
    console.log('\n--- done ---');
  },80);
},700);
