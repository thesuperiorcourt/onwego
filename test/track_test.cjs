const { bootApp } = require('./_lib/boot.cjs');
const P=(c,m)=>console.log((c?'PASS':'FAIL')+' — '+m);

(async () => {
  const { dom, document: d, G } = await bootApp();
  const window = dom.window;

  const W=G('App.W');
  P(!!W.tracks && W.tracks.length===1,'campaign migrated to one track');
  const tr=W.tracks[0];
  P(tr.anchor==='deadline'&&tr.ripple==='smooth','deadline-anchored, smooth ripple');
  P(tr.total===347,'total = '+tr.total);
  P(W.tasks.every(t=>Array.isArray(t.types)),'every task has a types array');
  P(W.tasks[0].types.includes('target')&&W.tasks[0].types.includes('streak'),'campaign tasks are target+streak');
  // impact labels on the tier buttons
  const imp=[...d.querySelectorAll('.tier .impact')].map(e=>e.textContent);
  P(imp.length===3,'three impact captions: '+imp.join(' | '));
  const nums=imp.map(s=>parseFloat(s));
  P(nums[0]>nums[1]&&nums[1]>nums[2],'more tonight => lighter later ('+nums.join(' > ')+')');
  // boss mode ripples into the future
  const before=W.tasks.filter(t=>t.date>G('today()')).slice(0,3).map(t=>t.max);
  d.querySelector('.tier.boss').click();
  setTimeout(()=>{
    const after=G('App.W').tasks.filter(t=>t.date>G('today()')).slice(0,3).map(t=>t.max);
    const rem=G("trackStatus(App.W,App.W.tracks[0]).remaining");
    const sum=G("(App.W.tasks||[]).filter(t=>t.date>=today()&&!App.W.progress.log[t.id]).reduce((s,t)=>s+(t.max||0),0)");
    P(sum===rem,`what's left is fully rescheduled (${sum} scheduled = ${rem} remaining)`);
    P(after[0]<=before[0],'future got lighter after boss mode');
    const st=G('trackStatus')(G('App.W'),G('App.W').tracks[0]);
    P(st.done===8,'track done = '+st.done);
    P(st.remaining===339,'remaining = '+st.remaining);
    // ranges relabelled
    const nxt=G('App.W').tasks.filter(t=>t.date>G('today()'))[0];
    P(/Ch\. \d+/.test(nxt.range),'next task relabelled: '+nxt.range);
    // switch to pace anchor -> date moves instead
    d.querySelector('.drop [data-close]') && d.querySelector('.drop [data-close]').click();
    d.querySelector('[data-view=tasks]').click();
    P(d.querySelectorAll('[data-track]').length>=2,'tracks block on Tasks tab');
    d.querySelector('[data-track]:not([data-track="new"])').click();
    P(!!d.querySelector('#kf_total'),'track editor opens');
    d.querySelector('[data-anchor="pace"]').click();
    d.querySelector('#kf_pace').value='10';
    d.querySelector('#kf_save').click();
    setTimeout(()=>{
      const tr2=G('App.W').tracks[0];
      const st2=G('trackStatus')(G('App.W'),tr2);
      P(tr2.anchor==='pace','anchor switched to pace');
      P(st2.projectedEnd>'2026-08-19','projected finish now computed: '+st2.projectedEnd);
      const imp2=[...d.querySelectorAll('.tier .impact')].map(e=>e.textContent);
      P(imp2.every(s=>/[A-Z]{3}/.test(s)),'impact captions now show dates: '+imp2.join(' | '));
      console.log('\n--- done ---');
      process.exit(0);
    },300);
  },300);
})();
