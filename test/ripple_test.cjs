const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','www','index.html'),'utf8');
const P=(c,m)=>console.log((c?'PASS':'FAIL')+' — '+m);
function boot(fn){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/'});
  dom.window.addEventListener('error',e=>console.log('PAGE ERROR:',e.message));
  setTimeout(()=>fn(dom,dom.window.document,s=>dom.window.eval(s)),800);
}
const futureSum=G=>G("(W.tasks||[]).filter(t=>t.date>=today()&&!W.progress.log[t.id]).reduce((s,t)=>s+(t.max||0),0)");
const slots=G=>G("openSlots(W,W.tracks[0]).length");
const projEnd=G=>G("trackStatus(W,W.tracks[0]).projectedEnd");

boot((dom,d,G)=>{
  console.log('DEADLINE + SMOOTH — date holds, amounts move');
  const before=G("trackStatus(W,W.tracks[0]).perSlot");
  d.querySelector('.tier.boss').click();
  setTimeout(()=>{
    const rem=G("trackStatus(W,W.tracks[0]).remaining");
    P(futureSum(G)===rem,`everything left is still scheduled (${futureSum(G)} = ${rem} remaining)`);
    P(projEnd(G)==='2026-10-25','finish date unmoved: '+projEnd(G));
    P(G("trackStatus(W,W.tracks[0]).perSlot")<before,`per-day load dropped ${before.toFixed(2)} -> `+G("trackStatus(W,W.tracks[0]).perSlot").toFixed(2));

    console.log('\nDEADLINE + CONSUME — amounts hold, dates slide');
    const s1=slots(G), e1=projEnd(G);
    G("W.tracks[0].ripple='consume'; recomputeTrack(W,W.tracks[0]);");
    G("logTask(W.tasks.filter(t=>t.date>=today()&&!W.progress.log[t.id])[0].id,'boss',12)");
    P(slots(G)<s1,`sessions needed dropped ${s1} -> ${slots(G)}`);
    P(projEnd(G)<e1,`finish pulled in ${e1} -> ${projEnd(G)}`);

    console.log('\nPACE ANCHOR — amount holds, the date is the output');
    G("W.tracks[0].anchor='pace'; W.tracks[0].pace=12; recomputeTrack(W,W.tracks[0]);");
    const fast=projEnd(G);
    G("W.tracks[0].pace=3; recomputeTrack(W,W.tracks[0]);");
    const slow=projEnd(G);
    P(fast<slow,`12/day finishes ${fast}, 3/day finishes ${slow}`);
    P(G("W.tasks.filter(t=>t.date&&t.date>'2026-10-25').length")>0,'slower pace extended the schedule past the old date');
    dom.window.close();
    boot(strainAndRepeat);
  },300);
});

function strainAndRepeat(dom,d,G){
  console.log('\nSTRAIN — the honest warning');
  G("W.tracks[0].comfort=3; recomputeTrack(W,W.tracks[0]); paint();");
  P(d.querySelectorAll('[data-strain]').length===3,'three ways out offered');
  P(d.body.textContent.includes('now needs 5.1 a day'),'it names the real number');
  const end0=G("W.tracks[0].endDate");
  d.querySelector('[data-strain="date"]').click();
  setTimeout(()=>{
    P(G("W.tracks[0].endDate")>end0,`moving the finish works: ${end0} -> `+G("W.tracks[0].endDate"));
    P(!d.querySelector('[data-strain]'),'warning clears once resolved');

    console.log('\nTRIM option');
    G("W.tracks[0].endDate='2026-10-25'; W.tracks[0].comfort=3; W.tasks=W.tasks.filter(t=>!t.auto); fitSlotsToDeadline(W,W.tracks[0]); recomputeTrack(W,W.tracks[0]); paint();");
    const total0=G("W.tracks[0].total");
    d.querySelector('[data-strain="trim"]').click();
    setTimeout(()=>{
      P(G("W.tracks[0].total")<total0,`scope trimmed ${total0} -> `+G("W.tracks[0].total"));

      console.log('\nREPEATING');
      G("(function(){var t=newTask({title:'Water the plants',date:today(),types:['streak','repeating'],repeat:{freq:'daily'}});W.tasks.push(t);window._rid=t.id;})()");
      G("logTask(window._rid,'full',0)");
      P(G("W.tasks.filter(t=>t.repeatOf===window._rid).length")===1,'logging spawns the next one');
      P(G("W.tasks.find(t=>t.repeatOf===window._rid).date")>G("today()"),'dated for later');
      P(G("W.tasks.find(t=>t.repeatOf===window._rid).types.join()")==='streak,repeating','types carried over');
      console.log('\n--- done ---');process.exit(0);
    },250);
  },250);
}
