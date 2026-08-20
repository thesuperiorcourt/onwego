const { bootApp } = require('./_lib/boot.cjs');
const P=(c,m)=>console.log((c?'PASS':'FAIL')+' — '+m);

(async () => {
  const { document: d, G } = await bootApp();

  console.log('STRAIN WARNING ON TRAIL — T15 should fire here too');
  G("App.W.tracks[0].comfort=3; recomputeTrack(App.W,App.W.tracks[0]);");
  d.querySelector('[data-view=trail]').click();
  P(d.querySelectorAll('[data-strain]').length===3, 'three ways out offered on Trail, same as Tonight');
  P(d.body.textContent.includes('now needs'), 'Trail names the real number, not just Tonight');

  console.log('\nHONEST "REDISTRIBUTE" — do_replan reports what actually happened');
  G("App.W.tracks[0].comfort=null;");
  G("(function(){var s=openSlots(App.W,App.W.tracks[0]).find(t=>t.date===today()); if(s) s.max=999;})()");
  d.querySelector('[data-sheet=pace]').click();
  d.querySelector('#do_replan').click();
  setTimeout(()=>{
    let msg = d.getElementById('live').textContent;
    P(!msg.includes('Nothing is overdue'), 'the old canned toast is gone');
    P(/today now asks for \d/.test(msg), 'reports the real new number: "'+msg.trim()+'"');

    d.querySelector('[data-sheet=pace]').click();
    d.querySelector('#do_replan').click();
    setTimeout(()=>{
      let msg2 = d.getElementById('live').textContent;
      P(msg2.includes('Already up to date'), 'says plainly when nothing needed to change: "'+msg2.trim()+'"');
      console.log('\n--- done ---');
      process.exit(0);
    },250);
  },250);
})();
