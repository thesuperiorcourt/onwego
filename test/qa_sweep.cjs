/* Click every control on every screen and report anything that throws,
   plus structural checks automated tools can actually catch. */
const { bootApp } = require('./_lib/boot.cjs');

(async () => {
  const errs=[];
  const { dom, document: d, G } = await bootApp();
  const window = dom.window;
  window.addEventListener('error',e=>errs.push(e.message));
  const issues=[];
  const flag=(m)=>issues.push(m);

  function audit(where){
    // lists that have had their bullets removed lose list semantics in Safari+VoiceOver
    [...d.querySelectorAll('ul,ol')].forEach(l=>{
      const cls=l.className||'';
      if(/shelf|trail|loot-grid|swatches/.test(cls) && l.getAttribute('role')!=='list')
        flag(where+': <'+l.tagName.toLowerCase()+' class="'+cls+'"> needs role="list"');
    });
    // interactive chips must be a decent tap target
    [...d.querySelectorAll('button.chip')].forEach(b=>{
      if(!b.dataset.checkedSize){ b.dataset.checkedSize='1';
        const st=window.getComputedStyle(b);
        const h=parseFloat(st.minHeight)||0;
        if(h<44) flag(where+': button.chip min-height '+st.minHeight+' (<44px)');
      }
    });
    // grouped radio-ish controls should announce as a group
    [...d.querySelectorAll('.tiers')].forEach(t=>{
      if(!t.getAttribute('role')) flag(where+': .tiers has no group role');
    });
    // live regions that wrap large content announce far too much
    [...d.querySelectorAll('[aria-live]')].forEach(n=>{
      if(n.id!=='live' && n.textContent.length>200) flag(where+': aria-live region "'+n.id+'" wraps '+n.textContent.length+' chars');
    });
  }

  const views=['tonight','trail','tasks','hoard'];
  views.forEach(v=>{
    d.querySelector('[data-view='+v+']').click();
    audit(v);
    const h1=d.querySelectorAll('h1').length;
    if(h1!==1) flag(v+': '+h1+' h1 elements');
    const hs=[...d.querySelectorAll('h1,h2,h3,h4')].map(h=>+h.tagName[1]);
    let prev=hs[0]; hs.forEach(l=>{ if(l>prev+1) flag(v+': heading jumps '+prev+'->'+l); prev=l; });
    [...d.querySelectorAll('button')].forEach(b=>{
      const n=(b.getAttribute('aria-label')||b.textContent||'').replace(/\s/g,'');
      if(n.length<2) flag(v+': unnamed button '+b.outerHTML.slice(0,60));
    });
    [...d.querySelectorAll('input:not([type=hidden]),select,textarea')].forEach(i=>{
      if(!i.id||!d.querySelector('label[for="'+i.id+'"]')) flag(v+': unlabelled field '+(i.id||i.type));
    });
  });
  // open every sheet and audit it
  d.querySelector('[data-view=tonight]').click();
  const sheets=['worlds','newworld','themes','pace','position','addreward','settings','import','account','home','sprint'];
  sheets.forEach(s=>{
    try{
      G("openSheet(SHEETS['"+s+"']())");
      audit('sheet:'+s);
      const dlg=d.querySelector('.sheet');
      if(!dlg) return flag('sheet:'+s+' did not open');
      if(dlg.getAttribute('role')!=='dialog') flag('sheet:'+s+': not role=dialog');
      if(!dlg.querySelector('#dialogTitle')) flag('sheet:'+s+': no labelled title');
      [...dlg.querySelectorAll('input:not([type=hidden]),select,textarea')].forEach(i=>{
        if(!i.id||!dlg.querySelector('label[for="'+i.id+'"]')) flag('sheet:'+s+': unlabelled field '+(i.id||i.type));
      });
      G("closeSheet()");
    }catch(e){ flag('sheet:'+s+' threw '+e.message); }
  });
  // editors
  [['task editor',"openSheet(taskEditor(App.W.tasks[0].id))"],
   ['new task',"openSheet(taskEditor('new'))"],
   ['track editor',"openSheet(trackEditor(App.W.tracks[0].id))"],
   ['new track',"openSheet(trackEditor('new'))"],
   ['section editor',"openSheet(sectionEditor(App.W.home.sections[0].id))"]].forEach(([name,code])=>{
     try{ G(code); audit(name);
       const dlg=d.querySelector('.sheet');
       [...dlg.querySelectorAll('input:not([type=hidden]),select,textarea')].forEach(i=>{
         if(!i.id||!dlg.querySelector('label[for="'+i.id+'"]')) flag(name+': unlabelled field '+(i.id||i.type));
       });
       G("closeSheet()");
     }catch(e){ flag(name+' threw '+e.message); }
   });

  console.log('runtime errors: '+errs.length);
  errs.forEach(e=>console.log('   ERROR '+e));
  const uniq=[...new Set(issues)];
  console.log('issues found: '+uniq.length);
  uniq.forEach(i=>console.log('   • '+i));
  process.exit(0);
})();
