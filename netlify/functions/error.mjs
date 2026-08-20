import { reportError } from './lib/report.mjs';

/* On We Go — client-side error reports.

   POST /api/error → { ok }   forwards a JS error to Sentry (if configured)

   Deliberately unauthenticated: the app must work signed out, so an error
   from a signed-out session has to be reportable too. The payload is
   capped and only ever the error's own message/stack/location — nothing
   about what the person was doing when it happened.

   Environment variables (set in Netlify):
     SENTRY_DSN   optional — a Sentry project DSN. Without it, reports
                  still land in this function's own Netlify logs.
*/

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store'
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'content-type': 'application/json' } });

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'Bad payload' }, 400); }
  if (!body || typeof body.message !== 'string' || !body.message.trim()) return json({ error: 'A message is required' }, 400);

  await reportError({
    message: body.message.slice(0, 500),
    stack: typeof body.stack === 'string' ? body.stack.slice(0, 2000) : undefined,
    source: 'client'
  });

  return json({ ok: true });
};

export const config = { path: '/api/error' };
