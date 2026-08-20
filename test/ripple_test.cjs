const { bootApp } = require('./_lib/boot.cjs');
const P=(c,m)=>console.log((c?'PASS':'FAIL')+' — '+m);

const futureSum=G=>G("(App.W.tasks||[]).filter(t=>t.date>=today()&&!App.W.progress.log[t.id]).reduce((s,t)=>s+(t.max||0),0)");
const slots=G=>G("openSlots(App.W,App.W.tracks[0]).length");
const projEnd=G=>G("trackStatus(App.W,App.W.tracks[0]).projectedEnd");

(async () => {
  const { document: d, G } = await bootApp();
  console.log('DEADLINE + SMOOTH — date holds, amounts move');
  const before=G("trackStatus(App.W,App.W.tracks[0]).perSlot");
  d.querySelector('.tier.boss').click();
  setTimeout(()=>{
    const rem=G("trackStatus(App.W,App.W.tracks[0]).remaining");
    P(futureSum(G)===rem,`everything left is still scheduled (${futureSum(G)} = ${rem} remaining)`);
    P(projEnd(G)==='2026-10-25','finish date unmoved: '+projEnd(G));
    P(G("trackStatus(App.W,App.W.tracks[0]).perSlot")<before,`per-day load dropped ${before.toFixed(2)} -> `+G("trackStatus(App.W,App.W.tracks[0]).perSlot").toFixed(2));

    console.log('\nDEADLINE + CONSUME — amounts hold, dates slide');
    const s1=slots(G), e1=projEnd(G);
    G("App.W.tracks[0].ripple='consume'; recomputeTrack(App.W,App.W.tracks[0]);");
    G("logTask(App.W.tasks.filter(t=>t.date>=today()&&!App.W.progress.log[t.id])[0].id,'boss',12)");
    P(slots(G)<s1,`sessions needed dropped ${s1} -> ${slots(G)}`);
    P(projEnd(G)<e1,`finish pulled in ${e1} -> ${projEnd(G)}`);

    console.log('\nPACE ANCHOR — amount holds, the date is the output');
    G("App.W.tracks[0].anchor='pace'; App.W.tracks[0].pace=12; recomputeTrack(App.W,App.W.tracks[0]);");
    const fast=projEnd(G);
    G("App.W.tracks[0].pace=3; recomputeTrack(App.W,App.W.tracks[0]);");
    const slow=projEnd(G);
    P(fast<slow,`12/day finishes ${fast}, 3/day finishes ${slow}`);
    P(G("App.W.tasks.filter(t=>t.date&&t.date>'2026-10-25').length")>0,'slower pace extended the schedule past the old date');
    console.log('\n--- done (see ripple_strain_test.cjs for STRAIN/TRIM/REPEATING) ---');
    process.exit(0);
  },300);
})();
