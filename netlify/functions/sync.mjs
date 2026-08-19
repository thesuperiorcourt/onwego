import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';

/* On We Go — sync + backups.

   GET  /api/sync                  → { ok, data }         the current save
   GET  /api/sync?snapshots=1      → { ok, snapshots:[] } dated backups, newest first
   GET  /api/sync?snapshot=STAMP   → { ok, data }         one dated backup
   POST /api/sync                  → { ok, updatedAt }    saves, and keeps a daily snapshot

   There are no accounts. The passphrase in x-onwego-key is hashed to make the
   storage key, so the data is only reachable by someone who knows it.

   The header, the store name and the client must agree. If you rename the
   project again, rename it in www/index.html at the same time. */

const KEEP = 30;            /* daily snapshots retained */

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type,x-onwego-key,x-questline-key',
  'cache-control': 'no-store'
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'content-type': 'application/json' } });

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  /* Old header still accepted, so a half-finished rename can't lock you out. */
  const phrase = req.headers.get('x-onwego-key') || req.headers.get('x-questline-key') || '';
  if (phrase.length < 8) return json({ error: 'Passphrase must be at least 8 characters' }, 400);

  const key = createHash('sha256').update(phrase).digest('hex').slice(0, 40);
  /* globalThis.__questlineStore is only ever set by the test harness. */
  const store = globalThis.__onwegoStore || getStore({ name: 'onwego', consistency: 'strong' });
  const legacy = globalThis.__onwegoStore || getStore({ name: 'questline', consistency: 'strong' });
  const url = new URL(req.url);

  try {
    if (req.method === 'GET') {
      if (url.searchParams.get('snapshots')) {
        const { blobs } = await store.list({ prefix: 'snap/' + key + '/' });
        const snapshots = blobs
          .map(b => b.key.split('/').pop())
          .sort().reverse();
        return json({ ok: true, snapshots });
      }
      const stamp = url.searchParams.get('snapshot');
      if (stamp) {
        if (!/^[\d-]{8,12}$/.test(stamp)) return json({ error: 'Bad snapshot name' }, 400);
        const data = await store.get('snap/' + key + '/' + stamp, { type: 'json' });
        return json({ ok: true, data: data || null });
      }
      const data = await store.get(key, { type: 'json' })
                || await legacy.get(key, { type: 'json' });   /* anything saved under the old name */
      return json({ ok: true, data: data || null });
    }

    if (req.method === 'POST') {
      const incoming = await req.json();
      if (!incoming || !Array.isArray(incoming.worlds)) return json({ error: 'Not a Questline payload' }, 400);

      const current = await store.get(key, { type: 'json' });
      if (current && (current.updatedAt || 0) > (incoming.updatedAt || 0)) {
        /* Something newer is already stored — hand it back rather than clobber it. */
        return json({ ok: true, stale: true, data: current });
      }
      await store.setJSON(key, incoming);

      /* One snapshot per day, overwritten as the day goes on. */
      const stamp = new Date().toISOString().slice(0, 10);
      await store.setJSON('snap/' + key + '/' + stamp, incoming);

      const { blobs } = await store.list({ prefix: 'snap/' + key + '/' });
      const stamps = blobs.map(b => b.key.split('/').pop()).sort();
      for (const old of stamps.slice(0, Math.max(0, stamps.length - KEEP))) {
        await store.delete('snap/' + key + '/' + old);
      }
      return json({ ok: true, updatedAt: incoming.updatedAt || 0, snapshot: stamp });
    }
  } catch (err) {
    return json({ error: 'Storage error', detail: String(err && err.message || err) }, 500);
  }
  return json({ error: 'Method not allowed' }, 405);
};

export const config = { path: '/api/sync' };
