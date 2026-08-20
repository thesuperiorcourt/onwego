/* Shared by every function that needs to report an error. Forwards to
   Sentry if SENTRY_DSN is set; otherwise falls back to the function's own
   log (visible in the Netlify dashboard) so there's still a record even
   before Sentry is wired up.

   Callers must never pass anything here that could be user content —
   a message, a stack, and where it happened. No task titles, no journal
   fields, no email addresses. */

export async function reportError({ message, stack, source }) {
  const line = (message || 'Unknown error').slice(0, 500);
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.error('[onwego]', source || 'unknown', '—', line, stack ? '\n' + stack.slice(0, 2000) : '');
    return;
  }

  const m = /^https:\/\/([^@]+)@([^/]+)\/(.+)$/.exec(dsn);
  if (!m) { console.error('[onwego] SENTRY_DSN is malformed — falling back to logs'); console.error('[onwego]', source, line); return; }
  const [, , host, projectId] = m;

  const value = stack ? line + '\n\n' + stack.slice(0, 2000) : line;
  /* Sentry's ingest API requires event_id on both the envelope header and
     the event item itself — without it, the request still gets a 200 but
     the event is silently dropped, which is indistinguishable from success
     unless the response is actually checked (see below). */
  const eventId = crypto.randomUUID().replace(/-/g, '');
  const payload = JSON.stringify({
    event_id: eventId,
    timestamp: new Date().toISOString(),
    level: 'error',
    platform: 'javascript',
    environment: source === 'function' ? 'netlify-function' : 'browser',
    exception: { values: [{ type: 'Error', value }] }
  });
  const envelope =
    JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString(), dsn }) + '\n' +
    JSON.stringify({ type: 'event', length: new TextEncoder().encode(payload).length }) + '\n' +
    payload;

  try {
    const res = await fetch(`https://${host}/api/${projectId}/envelope/`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-sentry-envelope' },
      body: envelope
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[onwego] Sentry rejected the report:', res.status, body.slice(0, 500));
      console.error('[onwego]', source, line);
    }
  } catch (err) {
    console.error('[onwego] failed to forward error to Sentry:', String(err && err.message || err));
    console.error('[onwego]', source, line);
  }
}
