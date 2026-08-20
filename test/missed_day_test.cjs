const { bootApp } = require('./_lib/boot.cjs');
const P=(c,m)=>console.log((c?'PASS':'FAIL')+' — '+m);

/* The shipped campaign starts the day before "today" in real use — the
   owner's own report was a real day-18 miss — so a fresh seed can already
   carry one naturally-missed task before this test manufactures any. Every
   count below is relative to that baseline, not assumed to start at zero. */
(async () => {
  const { document: d, G } = await bootApp();

  console.log('TODAY SCREEN — a missed day shows there too, not just Trail');
  d.querySelector('[data-view=tonight]').click();
  let secs = [...d.querySelectorAll('.sec-head h2')].map(h => h.textContent);
  P(secs.includes('Missed'), 'a Missed section exists on Today');
  P(secs.indexOf('Missed') < secs.indexOf('Up next'), 'it sits ahead of Up next, not after');
  P(d.body.textContent.includes('BACK IN THE SADDLE'), 'the actually-missed task is named, not just an empty section');

  console.log('\nOLD LAYOUTS UPGRADE THEMSELVES; CUSTOMISED ONES DO NOT');
  P(G("isUntouchedOldHome({sections:[{id:'s1'},{id:'s2',name:'Coming up',scope:'upcoming'}]})"), 'recognises the exact old shipped shape');
  P(!G("isUntouchedOldHome({sections:[{id:'s1'},{id:'s2',name:'Coming up',scope:'upcoming'},{id:'s3',name:'Renamed by the user',scope:'open'}]})"),
    'a layout with an extra section is left alone');
  P(!G("isUntouchedOldHome({sections:[{id:'s1'},{id:'s2',name:'Something else',scope:'upcoming'}]})"),
    'a renamed section is left alone');
  G(`
    window._w = {home:{sections:[{id:'s1',name:'Tonight'},{id:'s2',name:'Coming up',scope:'upcoming'}]}, tasks:[1], progress:{log:{}}};
    migrateTasks(window._w);
  `);
  P(G("window._w.home.sections.length")===3 && G("window._w.home.sections[1].name")==='Missed',
    'an untouched old layout is upgraded to the current default on boot');
  G(`
    window._w2 = {home:{sections:[{id:'s1'},{id:'s2',name:'My own name',scope:'upcoming'}]}, tasks:[1], progress:{log:{}}};
    migrateTasks(window._w2);
  `);
  P(G("window._w2.home.sections.length")===2, "a customised layout keeps its own shape — migration didn't touch it");

  console.log('\nMISSED DAY — acknowledgment and resolution (K1)');
  const base = G("missedTasks(App.W, App.W.tracks[0]).length");

  G("window._m1 = openSlots(App.W, App.W.tracks[0])[0].id; App.W.tasks.find(t=>t.id===window._m1).date = addDays(today(), -2);");
  P(G("missedTasks(App.W, App.W.tracks[0]).length")===base+1, 'manufacturing a miss is detected (baseline '+base+' -> '+(base+1)+')');
  P(G("missedTasks(App.W, App.W.tracks[0]).some(t=>t.id===window._m1)"), 'it is the task that fell into the past');

  d.querySelector('[data-view=trail]').click();
  P(d.body.textContent.includes('Missed — needs a decision'), 'Trail shows a real status instead of silence');

  d.querySelector('[data-sheet=pace]').click();
  let sheetText = d.querySelector('.sheet').textContent;
  P(sheetText.includes((base+1)+' missed'), 'Pace sheet counts every miss, not just the new one');
  P(d.querySelectorAll('[data-missed]').length===(base+1)*3, 'three resolutions offered per missed task');
  P(!sheetText.includes('Nothing is overdue'), 'no canned denial when something is actually overdue');
  const unnamed=[...d.querySelector('.sheet').querySelectorAll('button')].filter(b=>{
    const t=(b.getAttribute('aria-label')||b.textContent||'').replace(/[\s​]/g,'');
    return t.length<2;
  });
  P(unnamed.length===0, 'every resolution button is named');
  const missedLabels=[...d.querySelectorAll('[data-missed]')].map(b=>b.getAttribute('aria-label'));
  P(new Set(missedLabels).size===missedLabels.length, 'labels are distinct per task, not a generic repeat ('+(base+1)+' missed tasks shown at once)');

  d.querySelector('[data-missed="today"][data-task-id="'+G("window._m1")+'"]').click();
  setTimeout(()=>{
    P(G("App.W.tasks.find(t=>t.id===window._m1).date===today()"), '"move to today" moved the date');
    P(G("missedTasks(App.W, App.W.tracks[0]).length")===base, 'back to baseline once resolved');

    G("window._m2 = openSlots(App.W, App.W.tracks[0]).find(t=>t.date>today()).id; App.W.tasks.find(t=>t.id===window._m2).date = addDays(today(), -1);");
    d.querySelector('[data-view=trail]').click();
    d.querySelector('[data-sheet=pace]').click();
    d.querySelector('[data-missed="fold"][data-task-id="'+G("window._m2")+'"]').click();
    setTimeout(()=>{
      P(G("App.W.tasks.find(t=>t.id===window._m2).missedAck===true"), '"fold in" acknowledges without logging it as done');
      P(G("!App.W.progress.log[window._m2]"), 'folding does not fabricate a log entry');
      P(G("missedTasks(App.W, App.W.tracks[0]).length")===base, 'stops resurfacing once folded');
      d.querySelector('[data-view=trail]').click();
      P(d.body.textContent.includes('Folded into the plan'), 'Trail shows the fold, not silence');

      G("window._m3 = (App.W.tasks||[]).find(t=>!App.W.progress.log[t.id] && !t.missedAck && t.date && t.date>today()).id; App.W.tasks.find(t=>t.id===window._m3).date = addDays(today(), -3);");
      d.querySelector('[data-view=trail]').click();
      d.querySelector('[data-sheet=pace]').click();
      d.querySelector('[data-missed="skip"][data-task-id="'+G("window._m3")+'"]').click();
      setTimeout(()=>{
        P(G("App.W.progress.log[window._m3].result")==='skip', '"let it go" logs it as rested, not silently');
        P(G("App.W.progress.log[window._m3].xp===0 && App.W.progress.log[window._m3].coins===0"), 'no reward for something not actually done');
        d.querySelector('[data-view=trail]').click();
        P(d.body.textContent.includes('Rested'), 'Trail uses the same rested wording as any other rest day');
        d.querySelector('[data-view=tasks]').click();
        P(!d.querySelector('main').textContent.includes('undefined'), 'the task list renders a let-go task without crashing on its label');

        console.log('\n--- done (see missed_day_strain_test.cjs for STRAIN/replan) ---');
        process.exit(0);
      },250);
    },250);
  },250);
})();
