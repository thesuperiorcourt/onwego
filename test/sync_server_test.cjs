/* Exercises the account-based sync function against a stub database and a
   stub token verifier. Proves isolation, staleness handling, and rejection. */
const rows = { state: {}, snaps: {} };
globalThis.__onwegoSql = (strings, ...vals) => {
  const q = strings.join('?').replace(/\s+/g, ' ').trim();
  if (q.startsWith('select to_char')) {
    const uid = vals[0];
    return Promise.resolve(Object.keys(rows.snaps[uid] || {}).sort().reverse().map(stamp => ({ stamp })));
  }
  if (q.startsWith('select data from app_snapshot')) {
    const [uid, stamp] = vals;
    const d = (rows.snaps[uid] || {})[stamp];
    return Promise.resolve(d ? [{ data: d }] : []);
  }
  if (q.startsWith('select data from app_state')) {
    const uid = vals[0];
    return Promise.resolve(rows.state[uid] ? [{ data: rows.state[uid].data }] : []);
  }
  if (q.startsWith('select data, updated_at')) {
    const uid = vals[0];
    return Promise.resolve(rows.state[uid] ? [rows.state[uid]] : []);
  }
  if (q.startsWith('insert into app_state')) {
    rows.state[vals[0]] = { data: JSON.parse(vals[1]), updated_at: vals[2] };
    return Promise.resolve([]);
  }
  if (q.startsWith('insert into app_snapshot')) {
    rows.snaps[vals[0]] = rows.snaps[vals[0]] || {};
    rows.snaps[vals[0]][vals[1]] = JSON.parse(vals[2]);
    return Promise.resolve([]);
  }
  if (q.startsWith('select prune_snapshots')) return Promise.resolve([]);
  if (q.startsWith('delete from app_snapshot')) {
    delete rows.snaps[vals[0]];
    return Promise.resolve([]);
  }
  if (q.startsWith('delete from app_state')) {
    delete rows.state[vals[0]];
    return Promise.resolve([]);
  }
  throw new Error('unexpected query: ' + q);
};
/* Stand-in for real JWT verification: "good:<id>:<email>" is a valid token. */
globalThis.__onwegoVerify = async (token) => {
  if (!token.startsWith('good:')) throw new Error('bad token');
  const [, sub, email] = token.split(':');
  return { payload: { sub, email } };
};
process.env.NEON_AUTH_URL = 'https://auth.test/neondb/auth';
process.env.DATABASE_URL = 'postgres://stub';

(async () => {
  const fn = (await import('../netlify/functions/sync.mjs')).default;
  const P = (c, m) => console.log((c ? 'PASS' : 'FAIL') + ' — ' + m);
  const call = (method, url, body, token) => fn(new Request('https://x.test' + url, {
    method,
    headers: Object.assign({ 'content-type': 'application/json' }, token ? { authorization: 'Bearer ' + token } : {}),
    body: body ? JSON.stringify(body) : undefined
  }));
  const A = 'good:user-a:a@example.com', B = 'good:user-b:b@example.com';

  let r = await call('GET', '/api/sync');
  P(r.status === 401, 'no token is rejected (' + r.status + ')');

  r = await call('GET', '/api/sync', null, 'forged');
  P(r.status === 401, 'forged token is rejected (' + r.status + ')');

  r = await call('GET', '/api/sync', null, A);
  P((await r.json()).data === null, 'new account starts empty');

  r = await call('POST', '/api/sync', { worlds: [{ id: 'w1', name: 'A world' }], updatedAt: 100 }, A);
  let j = await r.json();
  P(j.ok && j.snapshot, 'save works and writes a snapshot');

  r = await call('GET', '/api/sync', null, A);
  j = await r.json();
  P(j.data.worlds[0].name === 'A world' && j.email === 'a@example.com', 'save round-trips with the account email');

  r = await call('GET', '/api/sync', null, B);
  P((await r.json()).data === null, "another account cannot see the first account's data");

  await call('POST', '/api/sync', { worlds: [{ id: 'w9', name: 'B world' }], updatedAt: 500 }, B);
  r = await call('GET', '/api/sync', null, A);
  P((await r.json()).data.worlds[0].name === 'A world', 'accounts stay separate after both have written');

  r = await call('POST', '/api/sync', { worlds: [{ id: 'w1' }], updatedAt: 50 }, A);
  j = await r.json();
  P(j.stale === true && j.data.updatedAt === 100, 'a stale device gets the newer copy back instead of clobbering');

  r = await call('GET', '/api/sync?snapshots=1', null, A);
  j = await r.json();
  P(j.snapshots.length === 1, 'snapshot listed for this account only');

  r = await call('GET', '/api/sync?snapshot=' + j.snapshots[0], null, A);
  P((await r.json()).data.updatedAt === 100, 'snapshot restores');

  r = await call('GET', '/api/sync?snapshot=../../etc/passwd', null, A);
  P(r.status === 400, 'path traversal in a snapshot name rejected');

  r = await call('POST', '/api/sync', { nope: true }, A);
  P(r.status === 400, 'garbage payload rejected');

  process.env.ALLOW_EMAILS = 'someone@else.com';
  r = await call('GET', '/api/sync', null, A);
  P(r.status === 403, 'allowlist blocks accounts that are not invited');
  delete process.env.ALLOW_EMAILS;

  r = await call('OPTIONS', '/api/sync');
  P(r.status === 204 && r.headers.get('access-control-allow-headers').includes('authorization'),
    'CORS preflight allows the auth header (needed by the iOS shell)');
  P(r.headers.get('access-control-allow-methods').includes('DELETE'), 'CORS allows DELETE too');

  r = await call('PATCH', '/api/sync', null, A);
  P(r.status === 405, 'a genuinely unsupported method is still rejected');

  r = await call('DELETE', '/api/sync');
  P(r.status === 401, 'deletion without a token is rejected, same as any other request');

  console.log('\nACCOUNT DELETION — one account leaves, the other is untouched');
  r = await call('DELETE', '/api/sync', null, A);
  j = await r.json();
  P(j.ok === true, 'deleting account A succeeds');
  P(j.account === false && /not configured/.test(j.detail), 'honest about the login surviving when the Neon API key is not set');
  P(!rows.state['user-a'] && !rows.snaps['user-a'], "account A's rows are gone from both tables");
  P(!!rows.state['user-b'] && !!rows.snaps['user-b'], "account B's rows are untouched by A's deletion");

  r = await call('GET', '/api/sync', null, A);
  P((await r.json()).data === null, 'account A reads back empty, same as a brand new account');

  r = await call('GET', '/api/sync', null, B);
  P((await r.json()).data.worlds[0].name === 'B world', "account B's data is intact after A was deleted");

  console.log('\nACCOUNT DELETION — with the auth service configured');
  process.env.NEON_API_KEY = 'key-test';
  process.env.NEON_PROJECT_ID = 'proj-test';
  process.env.NEON_BRANCH_ID = 'br-test';
  let deleteCall = null;
  globalThis.__onwegoAuthDelete = async (url, opts) => { deleteCall = { url, opts }; return { status: 204, ok: true }; };

  const C = 'good:user-c:c@example.com';
  await call('POST', '/api/sync', { worlds: [{ id: 'w-c', name: 'C world' }], updatedAt: 1 }, C);
  r = await call('DELETE', '/api/sync', null, C);
  j = await r.json();
  P(j.account === true, 'reports the login was removed once the auth service is configured');
  P(deleteCall && deleteCall.url === 'https://console.neon.tech/api/v2/projects/proj-test/branches/br-test/auth/users/user-c',
    'calls the right Neon project endpoint for the right user id');
  P(deleteCall.opts.method === 'DELETE' && deleteCall.opts.headers.authorization === 'Bearer key-test',
    'authenticates with the configured Neon API key');

  delete process.env.NEON_API_KEY; delete process.env.NEON_PROJECT_ID; delete process.env.NEON_BRANCH_ID;
  delete globalThis.__onwegoAuthDelete;
})();
