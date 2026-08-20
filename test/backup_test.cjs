const { bootApp } = require('./_lib/boot.cjs');
const P=(c,m)=>console.log((c?'PASS':'FAIL')+' — '+m);

(async () => {
  const { dom, document: d, G } = await bootApp();
  const window = dom.window;

  P(G("storageHealth().ok")===true,'storage health check passes in a normal browser');
  P(!!window.localStorage.getItem('onwego.v1'),'state written to device storage');
  // a change should persist
  d.querySelector('.tier.boss').click();
  setTimeout(()=>{
    d.querySelector('.drop [data-close]')&&d.querySelector('.drop [data-close]').click();
    const saved=JSON.parse(window.localStorage.getItem('onwego.v1'));
    P(saved.worlds[0].progress.xp===30,'the logged result is on disk, not just in memory: xp='+saved.worlds[0].progress.xp);
    P(!!window.localStorage.getItem('onwego.snaps'),'daily on-device snapshot written');
    const snaps=JSON.parse(window.localStorage.getItem('onwego.snaps'));
    P(Object.keys(snaps).length===1,'one snapshot for today');
    // backups sheet
    G("openSheet(SHEETS.backups())");
    const txt=d.querySelector('.sheet').textContent;
    P(txt.includes('This device')&&txt.includes('On-device history')&&txt.includes('Cloud snapshots'),'all three layers listed');
    P(!!d.querySelector('#bk_export'),'download button present');
    P(!!d.querySelector('[data-localsnap]'),'device snapshot offered for restore');
    P(txt.includes('Sign in for cloud backups'),'cloud layer points at signing in');
    // restore round trip
    const xpNow=G("App.W.progress.xp");
    G("App.W.progress.xp=999; save();");
    const snapBtn=d.querySelector('[data-localsnap]');
    snapBtn.click();                       // arms
    P(snapBtn.textContent.includes('Tap again'),'restore needs a second tap');
    snapBtn.click();                       // confirms
    setTimeout(()=>{
      P(G("App.W.progress.xp")!==999,'restore replaced the live state (xp now '+G("App.W.progress.xp")+')');
      P(!!window.localStorage.getItem('onwego.undo'),'previous version stashed for undo');
      G("openSheet(SHEETS.backups())");
      P(!!d.querySelector('#bk_undo'),'undo button appears after a restore');
      d.querySelector('#bk_undo').click();
      setTimeout(()=>{
        P(G("App.W.progress.xp")===999,'undo brought back the pre-restore state');
        // a11y of the new sheet
        G("openSheet(SHEETS.backups())");
        const dlg=d.querySelector('.sheet');
        const lists=[...dlg.querySelectorAll('ul')].every(l=>l.getAttribute('role')==='list');
        P(lists,'lists in the backups sheet keep list semantics');
        P([...dlg.querySelectorAll('button')].every(b=>((b.getAttribute('aria-label')||b.textContent||'').replace(/\s/g,'')).length>1),'buttons named');
        console.log('\n--- done ---');process.exit(0);
      },200);
    },200);
  },250);
})();
