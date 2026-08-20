import { App } from './state.js';
import { Store } from './store.js';
import { today } from './engine.js';
import { $, closeSheet, esc, openSheet, paint, setErr, toast } from './ui.js';
import { save } from './main.js';

/* ============================================================
   SYNC — local-first. The device is always the source of truth
   for what you just did; the server is how the other devices
   find out. Last write wins, by timestamp.
   ============================================================ */
/* Every method below is filled in later, once the Account object exists —
   this shell just holds the state that outlives any one sync call. */
export const Sync = {
  status: 'off',      // off | idle | syncing | error
  lastAt: 0,
  _t: null,

  schedulePush() {
    if (!this.ready()) return;
    clearTimeout(this._t);
    this._t = setTimeout(async () => {
      try { this.status = 'syncing'; await this.push(App.S); this.status = 'idle'; }
      catch (e) { this.status = 'error'; }
    }, 1200);
  }
};
/* ============================================================
   ACCOUNT — sign in, stay signed in, sync what's yours.

   Auth is handled by Managed Better Auth on Neon. The SDK is loaded as a
   browser module the first time it's needed, so this file stays buildless
   like the rest of the app. Everything below is offline-tolerant: if the
   network or the auth service is unreachable, the app still runs on the
   device's own copy and simply doesn't sync.
   ============================================================ */

export const AUTH_CONFIG = {
  /* Set at deploy time by www/config.js, or in Settings → Account. */
  authUrl: (window.ONWEGO_CONFIG && window.ONWEGO_CONFIG.authUrl) || '',
  apiBase: (window.ONWEGO_CONFIG && window.ONWEGO_CONFIG.apiBase) || '',
  /* Vendored, not fetched from esm.sh at runtime — see www/vendor/README.md
     for the exact source and how to pick up a new version. */
  sdk: '../vendor/auth.mjs'
};

export const Account = {
  client: null,
  user: null,          // { id, email, name }
  token: null,
  status: 'unknown',   // unknown | signedOut | signedIn | offline | unconfigured

  cfgKey: 'onwego.account',
  loadCfg() {
    try {
      const c = JSON.parse(localStorage.getItem(this.cfgKey)) || {};
      if (c.authUrl) AUTH_CONFIG.authUrl = c.authUrl;
      if (c.apiBase) AUTH_CONFIG.apiBase = c.apiBase;
    } catch (e) {}
    return AUTH_CONFIG;
  },
  saveCfg(authUrl, apiBase) {
    AUTH_CONFIG.authUrl = (authUrl || '').trim().replace(/\/$/, '');
    AUTH_CONFIG.apiBase = (apiBase || '').trim().replace(/\/$/, '');
    try { localStorage.setItem(this.cfgKey, JSON.stringify({ authUrl: AUTH_CONFIG.authUrl, apiBase: AUTH_CONFIG.apiBase })); } catch (e) {}
    this.client = null;
  },

  async sdk() {
    if (this.client) return this.client;
    if (!AUTH_CONFIG.authUrl) { this.status = 'unconfigured'; throw new Error('No auth URL set'); }
    const mod = await import(AUTH_CONFIG.sdk);
    const make = mod.createAuthClient || (mod.default && mod.default.createAuthClient);
    this.client = make(AUTH_CONFIG.authUrl);
    return this.client;
  },

  /* Where the app lives — used for OAuth redirects and API calls. In the iOS
     shell the page is served locally, so both need the deployed site URL. */
  origin() {
    if (AUTH_CONFIG.apiBase) return AUTH_CONFIG.apiBase;
    if (location.protocol === 'http:' || location.protocol === 'https:') return location.origin;
    return '';
  },
  apiUrl() { return this.origin() + '/api/sync'; },

  async refresh() {
    if (!AUTH_CONFIG.authUrl) { this.status = 'unconfigured'; return null; }
    try {
      const client = await this.sdk();
      const res = await client.getSession();
      const session = (res && res.data) || res || null;
      if (session && session.user) {
        this.user = session.user;
        this.token = session.session && (session.session.token || session.session.accessToken)
                  || session.token || null;
        this.status = 'signedIn';
        return this.user;
      }
      this.user = null; this.token = null; this.status = 'signedOut';
      return null;
    } catch (e) {
      /* No network, or the auth service is down — keep working locally. */
      this.status = this.token ? 'signedIn' : 'offline';
      return this.user;
    }
  },

  async signInGoogle() {
    const client = await this.sdk();
    return client.signIn.social({ provider: 'google', callbackURL: this.origin() || location.href });
  },
  async emailStart(email) {
    const client = await this.sdk();
    if (client.emailOtp && client.emailOtp.sendVerificationOtp) {
      return client.emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
    }
    return client.signIn.magicLink({ email, callbackURL: this.origin() || location.href });
  },
  async emailVerify(email, code) {
    const client = await this.sdk();
    const res = await client.signIn.emailOtp({ email, otp: code });
    await this.refresh();
    return res;
  },
  async signOut() {
    try { const client = await this.sdk(); await client.signOut(); } catch (e) {}
    this.user = null; this.token = null; this.status = 'signedOut';
  },
  headers() {
    return this.token
      ? { 'content-type': 'application/json', authorization: 'Bearer ' + this.token }
      : { 'content-type': 'application/json' };
  }
};

/* ------------------------------------------------------------------
   Sync now rides on the account. The interface is unchanged, so the
   Backups sheet and the boot sequence keep working as they did.
   ------------------------------------------------------------------ */
Sync.ready = function () { return Account.status === 'signedIn' && !!Account.token && !!Account.origin(); };
Sync.endpoint = function () { return Account.apiUrl(); };

Sync.pull = async function () {
  if (!this.ready()) return null;
  const res = await fetch(this.endpoint(), { headers: Account.headers() });
  if (res.status === 401) { await Account.refresh(); throw new Error('signed out'); }
  if (!res.ok) throw new Error('pull failed');
  const body = await res.json();
  return body.data || null;
};

Sync.push = async function (state) {
  if (!this.ready()) return;
  const res = await fetch(this.endpoint(), {
    method: 'POST', headers: Account.headers(), body: JSON.stringify(state)
  });
  if (res.status === 401) { await Account.refresh(); throw new Error('signed out'); }
  if (!res.ok) throw new Error('push failed');
  const body = await res.json();
  /* The server had something newer — take it rather than fight over it. */
  if (body.stale && body.data) {
    App.S = body.data;
    App.W = App.S.worlds.find(w => w.id === App.S.activeId) || App.S.worlds[0];
    await Store.save(App.S);
    paint();
    toast('Picked up newer work from another device');
  }
  this.lastAt = Date.now();
};

Sync.listSnapshots = async function () {
  if (!this.ready()) return [];
  const res = await fetch(this.endpoint() + '?snapshots=1', { headers: Account.headers() });
  if (!res.ok) throw new Error('list failed');
  return (await res.json()).snapshots || [];
};
Sync.getSnapshot = async function (stamp) {
  const res = await fetch(this.endpoint() + '?snapshot=' + encodeURIComponent(stamp), { headers: Account.headers() });
  if (!res.ok) throw new Error('fetch failed');
  return (await res.json()).data;
};

/* First sign-in on a device that already has progress: the local copy wins,
   because it is the one with the reading in it. */
Sync.reconcile = async function () {
  if (!this.ready()) return false;
  try {
    this.status = 'syncing';
    const remote = await this.pull();
    const localTouched = Object.keys((App.W && App.W.progress && App.W.progress.log) || {}).length > 0;

    if (remote && (remote.updatedAt || 0) > (App.S.updatedAt || 0)) {
      App.S = remote;
      App.W = App.S.worlds.find(w => w.id === App.S.activeId) || App.S.worlds[0];
      await Store.save(App.S);
      this.status = 'idle';
      return true;
    }
    if (!remote && localTouched) {
      await this.push(App.S);
      toast('Your progress is now on your account');
    } else if (!remote || (App.S.updatedAt || 0) > (remote.updatedAt || 0)) {
      await this.push(App.S);
    }
    this.status = 'idle';
  } catch (e) {
    this.status = 'error';
  }
  return false;
};

/* -------------------------------- sheet ---------------------------------- */
export function accountSheet() {
  Account.loadCfg();
  const configured = !!AUTH_CONFIG.authUrl;
  const signedIn = Account.status === 'signedIn';
  const state = { unknown:'Checking…', signedOut:'Not signed in', signedIn:'Signed in',
                  offline:'Offline — working from this device', unconfigured:'Not set up yet' }[Account.status];

  return `<h2>Account</h2>
    <p class="sub">Signing in keeps your worlds on every device you use. The app works signed out too — it just stays on this device.</p>
    <p class="err" id="formErr" role="alert"></p>
    <p class="stat" style="margin-bottom:16px"><b style="font-size:19px">${state}</b>
      <small>${signedIn && Account.user ? esc(Account.user.email || Account.user.name || 'signed in') : 'no account on this device'}</small></p>

    ${!configured ? `
      <label class="f" for="ac_url"><span>Auth URL <span class="hint">— from the Neon Console, Auth → Configuration</span></span></label>
      <input id="ac_url" placeholder="https://ep-….neonauth.….aws.neon.tech/neondb/auth" autocapitalize="off" spellcheck="false">
      <div style="height:10px"></div>
      <label class="f" for="ac_api"><span>Site address <span class="hint">— only needed inside the iOS app</span></span></label>
      <input id="ac_api" placeholder="https://onwego.netlify.app" autocapitalize="off" spellcheck="false">
      <div style="height:14px"></div>
      <button class="btn" id="ac_save">Save and continue</button>`
    : signedIn ? `
      <button class="btn line" id="ac_signout">Sign out of this device</button>
      <p class="sub" style="margin-top:14px">Signing out leaves everything on this device untouched. Sign back in and the two merge again.</p>
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--edge)">
        <p class="sub" style="margin-bottom:14px">Deleting removes the account and everything synced to it — the cloud copy, and the login itself. It does not reach any device that's offline; what's saved locally there stays until that device deletes it too.</p>
        <button class="btn ghost" id="ac_export">Download a copy first</button>
        <div style="height:10px"></div>
        <button class="btn line" id="ac_delete">Delete account</button>
      </div>`
    : `
      <button class="btn" id="ac_google"><span aria-hidden="true">🔑</span> Continue with Google</button>
      <p class="sub" style="text-align:center;margin:14px 0">or</p>
      <label class="f" for="ac_email"><span>Email</span></label>
      <input id="ac_email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" autocapitalize="off" spellcheck="false">
      <div style="height:10px"></div>
      <button class="btn ghost" id="ac_email_start">Email me a sign-in code</button>
      <div id="ac_code_box" hidden style="margin-top:14px">
        <label class="f" for="ac_code"><span>The code from your inbox</span></label>
        <input id="ac_code" inputmode="numeric" autocomplete="one-time-code" placeholder="123456">
        <div style="height:10px"></div>
        <button class="btn" id="ac_code_go">Sign in</button>
      </div>
      <p class="sub" style="margin-top:16px">No password to remember. Codes expire quickly, so ask for a fresh one if it lapses.</p>`}`;
}

document.addEventListener('click', async e => {
  const el = e.target.closest('#ac_save,#ac_google,#ac_email_start,#ac_code_go,#ac_signout,#ac_export,#ac_delete');
  if (!el) return;

  if (el.id === 'ac_save') {
    const url = $('ac_url').value.trim();
    if (!/^https:\/\/.+/.test(url)) { setErr('Paste the full Auth URL, starting with https://'); return; }
    Account.saveCfg(url, $('ac_api').value);
    await Account.refresh();
    closeSheet(); paint(); openSheet(accountSheet());
    return;
  }
  if (el.id === 'ac_google') {
    toast('Opening Google…');
    try { await Account.signInGoogle(); }
    catch (err) { setErr("Couldn't reach the sign-in service. Check the Auth URL and your connection."); }
    return;
  }
  if (el.id === 'ac_email_start') {
    const email = $('ac_email').value.trim();
    if (!/.+@.+\..+/.test(email)) { setErr('That email address looks incomplete.'); return; }
    try {
      await Account.emailStart(email);
      $('ac_code_box').hidden = false;
      $('ac_code').focus();
      toast('Code sent — check your inbox');
    } catch (err) { setErr("Couldn't send the code. Check the Auth URL and your connection."); }
    return;
  }
  if (el.id === 'ac_code_go') {
    const email = $('ac_email').value.trim(), code = $('ac_code').value.trim();
    if (!code) { setErr('Enter the code from your inbox.'); return; }
    try {
      await Account.emailVerify(email, code);
      if (Account.status === 'signedIn') {
        await Sync.reconcile();
        closeSheet(); paint(); toast('Signed in');
      } else { setErr('That code did not work. Ask for a fresh one.'); }
    } catch (err) { setErr('That code did not work. Ask for a fresh one.'); }
    return;
  }
  if (el.id === 'ac_signout') {
    await Account.signOut();
    closeSheet(); paint(); toast('Signed out. Everything stays on this device.');
    return;
  }
  if (el.id === 'ac_export') {
    const blob = new Blob([JSON.stringify(App.S, null, 2)], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `onwego-${today()}.json`; a.click();
    toast('Backup downloaded');
    return;
  }
  if (el.id === 'ac_delete') {
    if (el.dataset.armed !== '1') {
      el.dataset.armed = '1';
      el.textContent = 'Tap again to delete for good';
      toast('Tap delete again to confirm');
      return;
    }
    try {
      const res = await fetch(Account.apiUrl(), { method:'DELETE', headers: Account.headers() });
      if (!res.ok) throw new Error('delete failed');
      const body = await res.json();
      await Account.signOut();
      closeSheet(); paint();
      toast(body.account
        ? 'Account deleted'
        : 'Data deleted. The login itself needs a human to finish removing it — contact support.');
    } catch (err) {
      setErr("Couldn't reach the server to delete the account. Try again once you're online.");
    }
    return;
  }
});

/* Pick up the session on load, and after returning from Google. */
(async function accountBoot() {
  Account.loadCfg();
  if (!AUTH_CONFIG.authUrl) { Account.status = 'unconfigured'; return; }
  await Account.refresh();
  if (Account.status === 'signedIn') {
    await Sync.reconcile();
    if (typeof paint === 'function' && typeof App.W !== 'undefined' && App.W) paint();
  }
})();
