/* Client-side: the app must run perfectly signed out, must not sync without a
   token, and must show the right account state. The Neon SDK is stubbed. */
const { JSDOM } = require('jsdom'); const fs = require('fs'); const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'www', 'index.html'), 'utf8')
  .replace('<script src="./config.js"></script>', '<script>window.ONWEGO_CONFIG={authUrl:"",apiBase:""}</script>');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://onwego.test/' });
const { window } = dom, d = window.document; const G = s => window.eval(s);
window.addEventListener('error', e => console.log('PAGE ERROR:', e.message));
const P = (c, m) => console.log((c ? 'PASS' : 'FAIL') + ' — ' + m);

setTimeout(() => {
  P(!!d.querySelector('.quest h1'), 'app boots fully with no account: ' + d.querySelector('.quest h1').textContent);
  d.querySelector('.tier.boss').click();
  setTimeout(() => {
    d.querySelector('.drop [data-close]') && d.querySelector('.drop [data-close]').click();
    P(G('W.progress.xp') === 30, 'logging works signed out');
    P(!!window.localStorage.getItem('onwego.v1'), 'still saved to the device');
    P(G('Sync.ready()') === false, 'sync stays off without a session');
    P(G('Account.status') === 'unconfigured' || G('Account.status') === 'signedOut', 'account status: ' + G('Account.status'));

    G("openSheet(SHEETS.account())");
    const sheet = d.querySelector('.sheet');
    P(!!sheet && sheet.getAttribute('role') === 'dialog', 'account sheet is a proper dialog');
    P(!!d.querySelector('#ac_url'), 'unconfigured state asks for the Auth URL');
    P([...sheet.querySelectorAll('input')].every(i => sheet.querySelector('label[for="' + i.id + '"]')), 'fields labelled');

    /* Pretend the Auth URL is set and a session exists. */
    G(`Account.saveCfg('https://auth.test/neondb/auth','');
       Account.user={id:'u1',email:'reader@example.com'};
       Account.token='tok'; Account.status='signedIn';`);
    P(G('Sync.ready()') === true, 'sync turns on once signed in');
    P(G("Sync.endpoint()") === 'https://onwego.test/api/sync', 'API endpoint resolves same-origin on the web');
    P(G("Account.headers().authorization") === 'Bearer tok', 'requests carry the bearer token');

    G("openSheet(SHEETS.account())");
    P(d.querySelector('.sheet').textContent.includes('reader@example.com'), 'signed-in state shows who you are');
    P(!!d.querySelector('#ac_signout'), 'sign out offered');

    /* In the iOS shell the page is local, so the site address is required. */
    G("Account.saveCfg('https://auth.test/neondb/auth','https://onwego.netlify.app')");
    P(G("Sync.endpoint()") === 'https://onwego.netlify.app/api/sync', 'iOS build points at the deployed site');

    G("openSheet(SHEETS.backups())");
    P(d.querySelector('.sheet').textContent.includes('kept for 30 days'), 'backups sheet reflects the signed-in state');
    process.exit(0);
  }, 300);
}, 900);
