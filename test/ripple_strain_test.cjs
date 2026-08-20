const { bootApp } = require('./_lib/boot.cjs');
const P=(c,m)=>console.log((c?'PASS':'FAIL')+' — '+m);

(async () => {
  const { document: d, G } = await bootApp();
  console.log('STRAIN — the honest warning');
  G("App.W.tracks[0].comfort=3; recomputeTrack(App.W,App.W.tracks[0]); paint();");
  P(d.querySelectorAll('[data-strain]').length===3,'three ways out offered');
  const perSlot=G("trackStatus(App.W,App.W.tracks[0]).perSlot.toFixed(1)");
  P(d.body.textContent.includes(`now needs ${perSlot} a day`),'it names the real number: '+perSlot);

  const end0=G("App.W.tracks[0].endDate");
  d.querySelector('[data-strain="date"]').click();
  setTimeout(()=>{
    P(G("App.W.tracks[0].endDate")>end0,`moving the finish works: ${end0} -> `+G("App.W.tracks[0].endDate"));
    P(!d.querySelector('[data-strain]'),'warning clears once resolved');

    console.log('\nTRIM option');
    G("App.W.tracks[0].endDate='2026-10-25'; App.W.tracks[0].comfort=3; App.W.tasks=App.W.tasks.filter(t=>!t.auto); fitSlotsToDeadline(App.W,App.W.tracks[0]); recomputeTrack(App.W,App.W.tracks[0]); paint();");
    const total0=G("App.W.tracks[0].total");
    d.querySelector('[data-strain="trim"]').click();
    setTimeout(()=>{
      P(G("App.W.tracks[0].total")<total0,`scope trimmed ${total0} -> `+G("App.W.tracks[0].total"));

      console.log('\nREPEATING');
      G("(function(){var t=newTask({title:'Water the plants',date:today(),types:['streak','repeating'],repeat:{freq:'daily'}});App.W.tasks.push(t);window._rid=t.id;})()");
      G("logTask(window._rid,'full',0)");
      P(G("App.W.tasks.filter(t=>t.repeatOf===window._rid).length")===1,'logging spawns the next one');
      P(G("App.W.tasks.find(t=>t.repeatOf===window._rid).date")>G("today()"),'dated for later');
      P(G("App.W.tasks.find(t=>t.repeatOf===window._rid).types.join()")==='streak,repeating','types carried over');
      console.log('\n--- done ---');
      process.exit(0);
    },250);
  },250);
})();
