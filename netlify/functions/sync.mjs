import { neon } from '@neondatabase/serverless';
import { createRemoteJWKSet, jwtVerify } from 'jose';

/* On We Go — sync + backups, per account.

   GET    /api/sync                → { ok, data }          this account's save
   GET    /api/sync?snapshots=1    → { ok, snapshots:[] }  dated backups, newest first
   GET    /api/sync?snapshot=STAMP → { ok, data }          one dated backup
   POST   /api/sync                → { ok, updatedAt }     saves, keeps a daily snapshot
   DELETE /api/sync                → { ok, account }       erases this account's rows and,
                                                             if configured, the login itself

   Every request carries a session token from Managed Better Auth in the
   Authorization header. The token is verified against the auth service's
   published JWKS, so this function never sees a password and a forged or
   expired token gets nothing. The user id inside the token decides which rows
   are readable — it is never taken from the body or the query string.

   Environment variables (set in Netlify):
     DATABASE_URL     Neon pooled connection string
     NEON_AUTH_URL    the branch's Auth URL
     ALLOW_EMAILS     optional comma-separated allowlist; empty means open signup
     NEON_API_KEY     optional — a Neon Console personal or org API key
     NEON_PROJECT_ID  optional — this project's id, from Neon Console
     NEON_BRANCH_ID   optional — this branch's id, from Neon Console
   The last three are only needed for DELETE to also remove the login itself
   (not just its data) via Neon's project API. Without them, DELETE still
   erases every row for the account — it just leaves the login behind, and
   says so in the response rather than pretending otherwise.
*/

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
  'access-control-allow-headers': 'content-type,authorization',
  'cache-control': 'no-store'
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'content-type': 'application/json' } });

let jwks = null;
function keySet() {
  if (jwks) return jwks;
  const base = (process.env.NEON_AUTH_URL || '').replace(/\/$/, '');
  if (!base) throw new Error('NEON_AUTH_URL is not set');
  jwks = createRemoteJWKSet(new URL(base + '/.well-known/jwks.json'));
  return jwks;
}

/* Returns { id, email } or throws. */
async function whoIs(req) {
  const header = req.headers.get('authorization') || '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  if (!token) { const e = new Error('Not signed in'); e.status = 401; throw e; }

  let payload;
  try {
    ({ payload } = await (globalThis.__onwegoVerify || jwtVerify)(token, keySet()));
  } catch (err) {
    const e = new Error('Session expired or invalid');
    e.status = 401; throw e;
  }
  const id = payload.sub || payload.userId || payload.id;
  if (!id) { const e = new Error('Token carries no user'); e.status = 401; throw e; }

  const allow = (process.env.ALLOW_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const email = (payload.email || '').toLowerCase();
  if (allow.length && !allow.includes(email)) {
    const e = new Error('This account is not on the invite list yet');
    e.status = 403; throw e;
  }
  return { id: String(id), email };
}

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

/* Removes the login itself from Neon's Auth user directory, via Neon's
   project API — separate from Better Auth's own client-side self-delete,
   which needs an email-verification round trip this app doesn't wire up.
   Degrades honestly: if the three env vars aren't set, the account's data
   is still fully erased by the caller; this just can't reach the login. */
async function deleteAuthUser(userId) {
  const key = process.env.NEON_API_KEY, project = process.env.NEON_PROJECT_ID, branch = process.env.NEON_BRANCH_ID;
  if (!key || !project || !branch) return { removed: false, reason: 'not configured — data was erased, the login was not' };
  const url = `https://console.neon.tech/api/v2/projects/${project}/branches/${branch}/auth/users/${userId}`;
  try {
    const res = await (globalThis.__onwegoAuthDelete || fetch)(url, {
      method: 'DELETE',
      headers: { authorization: 'Bearer ' + key }
    });
    if (res.status === 204 || res.ok) return { removed: true };
    return { removed: false, reason: 'auth service returned ' + res.status };
  } catch (err) {
    return { removed: false, reason: String(err && err.message || err) };
  }
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  let user;
  try {
    user = await whoIs(req);
  } catch (err) {
    return json({ error: err.message }, err.status || 401);
  }

  const url = new URL(req.url);

  try {
    const sql = globalThis.__onwegoSql || db();

    if (req.method === 'GET') {
      if (url.searchParams.get('snapshots')) {
        const rows = await sql`
          select to_char(stamp, 'YYYY-MM-DD') as stamp
            from app_snapshot
           where user_id = ${user.id}
           order by stamp desc`;
        return json({ ok: true, snapshots: rows.map(r => r.stamp) });
      }

      const stamp = url.searchParams.get('snapshot');
      if (stamp) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(stamp)) return json({ error: 'Bad snapshot name' }, 400);
        const rows = await sql`
          select data from app_snapshot
           where user_id = ${user.id} and stamp = ${stamp}::date`;
        return json({ ok: true, data: rows.length ? rows[0].data : null });
      }

      const rows = await sql`select data from app_state where user_id = ${user.id}`;
      return json({ ok: true, data: rows.length ? rows[0].data : null, email: user.email });
    }

    if (req.method === 'POST') {
      const incoming = await req.json();
      if (!incoming || !Array.isArray(incoming.worlds)) return json({ error: 'Not an On We Go payload' }, 400);
      const updatedAt = Number(incoming.updatedAt) || 0;

      /* A device that has been offline must not overwrite newer work done
         elsewhere — hand the newer copy back instead. */
      const current = await sql`select data, updated_at from app_state where user_id = ${user.id}`;
      if (current.length && Number(current[0].updated_at) > updatedAt) {
        return json({ ok: true, stale: true, data: current[0].data });
      }

      await sql`
        insert into app_state (user_id, data, updated_at, saved_at)
        values (${user.id}, ${JSON.stringify(incoming)}::jsonb, ${updatedAt}, now())
        on conflict (user_id) do update
          set data = excluded.data, updated_at = excluded.updated_at, saved_at = now()`;

      const stamp = new Date().toISOString().slice(0, 10);
      await sql`
        insert into app_snapshot (user_id, stamp, data, saved_at)
        values (${user.id}, ${stamp}::date, ${JSON.stringify(incoming)}::jsonb, now())
        on conflict (user_id, stamp) do update
          set data = excluded.data, saved_at = now()`;
      await sql`select prune_snapshots(${user.id}, 30)`;

      return json({ ok: true, updatedAt, snapshot: stamp });
    }

    if (req.method === 'DELETE') {
      /* Data first, login second. If the login-removal call fails or isn't
         configured, the worst case is an empty account someone could still
         sign into — never data that outlives the only way left to ask for
         its removal. */
      await sql`delete from app_snapshot where user_id = ${user.id}`;
      await sql`delete from app_state where user_id = ${user.id}`;
      const auth = await deleteAuthUser(user.id);
      return json({ ok: true, account: auth.removed, detail: auth.removed ? undefined : auth.reason });
    }
  } catch (err) {
    return json({ error: 'Storage error', detail: String(err && err.message || err) }, 500);
  }

  return json({ error: 'Method not allowed' }, 405);
};

export const config = { path: '/api/sync' };
