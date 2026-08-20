/* netlify/functions/error.mjs and its shared lib/report.mjs — the
   client-side error endpoint, and where it forwards to (Sentry, or a
   console.error fallback when no DSN is configured). */
const P = (c, m) => console.log((c ? 'PASS' : 'FAIL') + ' — ' + m);

(async () => {
  const fn = (await import('../netlify/functions/error.mjs')).default;
  const { reportError } = await import('../netlify/functions/lib/report.mjs');
  const call = (method, body) => fn(new Request('https://x.test/api/error', {
    method,
    headers: { 'content-type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined
  }));

  let r = await call('OPTIONS');
  P(r.status === 204, 'CORS preflight ok');

  r = await call('GET');
  P(r.status === 405, 'only POST is accepted');

  r = await call('POST', { message: '' });
  P(r.status === 400, 'an empty message is rejected');

  r = await call('POST', { nope: true });
  P(r.status === 400, 'a missing message is rejected');

  console.log('\nNO SENTRY_DSN — falls back to the function log, never throws');
  delete process.env.SENTRY_DSN;
  const origError = console.error;
  let logged = [];
  console.error = (...args) => logged.push(args.join(' '));
  r = await call('POST', { message: 'Cannot read properties of undefined', stack: 'at foo (index.html:42:9)' });
  console.error = origError;
  P(r.status === 200, 'still reports ok — the client never sees a monitoring failure');
  P(logged.some(l => l.includes('Cannot read properties of undefined')), 'the message reached the function log');
  P(logged.some(l => l.includes('index.html:42:9')), 'the stack reached the function log too');

  console.log('\nWITH SENTRY_DSN — forwards a real envelope');
  process.env.SENTRY_DSN = 'https://examplekey@o123.ingest.sentry.io/456';
  let sentTo = null, sentBody = null, sentHeaders = null;
  const origFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts) => { sentTo = url; sentBody = opts.body; sentHeaders = opts.headers; return { ok: true }; };
  r = await call('POST', { message: 'Storage error', stack: 'at db (sync.mjs:70:3)' });
  globalThis.fetch = origFetch;
  P(r.status === 200, 'reports ok when Sentry is configured');
  P(sentTo === 'https://o123.ingest.sentry.io/api/456/envelope/', 'posts to the right project envelope endpoint: ' + sentTo);
  P(sentHeaders['content-type'] === 'application/x-sentry-envelope', 'envelope content type set');
  const lines = sentBody.split('\n');
  P(lines.length === 3, 'envelope has a header, an item header, and a payload line');
  const envHeader = JSON.parse(lines[0]);
  P(envHeader.dsn === process.env.SENTRY_DSN, 'envelope header carries the DSN for auth');
  P(/^[0-9a-f]{32}$/.test(envHeader.event_id), 'envelope header carries a well-formed event_id — Sentry drops events without one');
  const itemHeader = JSON.parse(lines[1]);
  P(itemHeader.type === 'event' && itemHeader.length === Buffer.byteLength(lines[2]), 'item header declares the right type and byte length');
  const payload = JSON.parse(lines[2]);
  P(payload.exception.values[0].value.includes('Storage error') && payload.exception.values[0].value.includes('sync.mjs:70:3'),
    'the payload carries the message and stack, nothing else');
  P(payload.event_id === envHeader.event_id, 'the payload event_id matches the envelope header');
  P(Object.keys(payload).sort().join(',') === ['environment', 'event_id', 'exception', 'level', 'platform', 'timestamp'].sort().join(','),
    'no extra fields — no user content smuggled in');

  console.log('\nSENTRY REJECTS THE EVENT — logged instead of silently swallowed');
  globalThis.fetch = async () => ({ ok: false, status: 400, text: async () => '{"detail":"invalid api key"}' });
  logged = [];
  console.error = (...args) => logged.push(args.join(' '));
  await reportError({ message: 'Storage error', stack: '', source: 'function' });
  console.error = origError;
  globalThis.fetch = origFetch;
  P(logged.some(l => l.includes('Sentry rejected') && l.includes('400')), 'a non-2xx response from Sentry is logged, not silently dropped');

  console.log('\nMALFORMED DSN — degrades to logging instead of throwing');
  process.env.SENTRY_DSN = 'not-a-real-dsn';
  logged = [];
  console.error = (...args) => logged.push(args.join(' '));
  await reportError({ message: 'test', stack: '', source: 'function' });
  console.error = origError;
  P(logged.some(l => l.includes('malformed')), 'a bad DSN is reported once, not thrown');

  delete process.env.SENTRY_DSN;
})();
