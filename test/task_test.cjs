const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync(require('path').join(__dirname,'..','www','index.html'),'utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/'});
const {window}=dom, d=window.document;
window.addEventListener('error',e=>console.log('PAGE ERROR:',e.message));
const P=(c,m)=>console.log((c?'PASS':'FAIL')+' — '+m);
setTimeout(()=>{
  P(d.querySelectorAll('.dock button').length===4,'four tabs — Garden merged into Rewards');
  P(!!d.querySelector('[data-view=tasks]'),'Tasks tab exists');
  P(d.querySelector('.quest h1')!==null,'hero card renders: '+d.querySelector('.quest h1').textContent);
  P(!!d.querySelector('#screenTitle'),'hero is the h1');
  P(d.querySelectorAll('h1').length===1,'still one h1');
  P(!!d.querySelector('[data-sheet=home]'),'layout button on Today');
  const secs=[...d.querySelectorAll('.sec-head h2')].map(h=>h.textContent);
  P(secs.includes('Missed'),'missed section rendered, ahead of Up next: '+secs.join('|'));
  P(secs.includes('Up next'),'up-next section rendered: '+secs.join('|'));
  P(secs.indexOf('Missed')<secs.indexOf('Up next'),'missed comes before up next');
  // log via task id
  const tier=d.querySelector('.tier[data-log=full]');
  P(!!tier.dataset.taskId,'tier carries a task id');
  tier.click();
  setTimeout(()=>{
    /* A full clear either announces the XP or drops loot — both are valid. */
    const announced=d.querySelector('#live').textContent.length>0;
    const looted=!!d.querySelector('.drop');
    P(announced||looted,'log gave feedback: '+(looted?'loot modal':d.querySelector('#live').textContent));
    if(looted) d.querySelector('.drop [data-close]').click();
    // tasks tab
    d.querySelector('[data-view=tasks]').click();
    P(d.querySelector('h1').textContent==='Tasks','tasks screen');
    const rows=d.querySelectorAll('[data-task]').length;
    P(rows>60,'all campaign days migrated to tasks: '+rows);
    P(!!d.querySelector('#taskSearch'),'search input');
    P(d.querySelectorAll('[data-filtercat]').length===4,'category filters: '+d.querySelectorAll('[data-filtercat]').length);
    P(d.querySelectorAll('[data-filtertag]').length>0,'tag filters');
    // search
    const s=d.querySelector('#taskSearch'); s.value='DAM';
    s.dispatchEvent(new window.Event('input',{bubbles:true}));
    setTimeout(()=>{
      const n=d.querySelectorAll('#taskList [data-task]').length;
      P(n>=1&&n<5,'search narrows list to '+n);
      s.value=''; s.dispatchEvent(new window.Event('input',{bubbles:true}));
      setTimeout(()=>{
        // filter by category
        const cat=d.querySelector('[data-filtercat]'); const catName=cat.dataset.filtercat;
        cat.click();
        const m=d.querySelectorAll('#taskList [data-task]').length;
        P(cat.getAttribute('aria-pressed')==='true'&&m>0&&m<69,'category filter "'+catName+'" -> '+m);
        cat.click();
        // editor
        d.querySelector('#taskList [data-task]').click();
        const dlg=d.querySelector('.sheet');
        P(!!dlg&&dlg.getAttribute('role')==='dialog','editor opens as dialog');
        P(!!d.querySelector('#tf_title')&&!!d.querySelector('#tf_hook')&&!!d.querySelector('#tf_tags'),'all fields present');
        d.querySelector('#tf_title').value='';
        d.querySelector('#tf_save').click();
        P(d.querySelector('#formErr').textContent.includes('title'),'title required, error shown');
        d.querySelector('#tf_title').value='Renamed quest';
        d.querySelector('#tf_notes').value='hello';
        d.querySelector('#tf_save').click();
        setTimeout(()=>{
          P(!d.querySelector('.sheet'),'editor closes on save');
          const found=[...d.querySelectorAll('[data-task]')].some(b=>b.textContent.includes('Renamed quest'));
          P(found,'edit persisted to the list');
          // new task
          d.querySelector('[data-task=new]').click();
          d.querySelector('#tf_title').value='Water the plants';
          d.querySelector('#tf_category').value='House';
          d.querySelector('#tf_save').click();
          setTimeout(()=>{
            P([...d.querySelectorAll('[data-task]')].some(b=>b.textContent.includes('Water the plants')),'new task added');
            // home layout
            d.querySelector('[data-view=tonight]').click();
            d.querySelector('[data-sheet=home]').click();
            P(d.querySelectorAll('[data-section]').length===4,'layout sheet lists 3 sections + add');
            d.querySelector('[data-section]').click();
            P(!!d.querySelector('#sf_limit')&&d.querySelectorAll('[data-secfield]').length===10,'section editor fields');
            d.querySelector('#sf_limit').value='2';
            d.querySelector('[data-secfield="payoff"]').click();
            P(d.querySelector('[data-secfield="payoff"]').getAttribute('aria-pressed')==='true','field toggles');
            d.querySelector('#sf_save').click();
            setTimeout(()=>{
              P(!d.querySelector('.sheet'),'section saved');
              console.log('\n--- done ---');
              process.exit(0);
            },200);
          },200);
        },200);
      },700);
    },700);
  },250);
},900);
