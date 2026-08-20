/* Temporary — verifying NEON_API_KEY/NEON_PROJECT_ID/NEON_BRANCH_ID are
   actually valid and correctly scoped, not just present. Calls the exact
   endpoint deleteAuthUser() in sync.mjs uses, against a user id that can't
   exist, so nothing real is touched — a 404 "user not found" proves the
   credentials authenticated successfully; 401/403 would mean they didn't.
   Delete this file once the check is done. */
export default async () => {
  const key = process.env.NEON_API_KEY, project = process.env.NEON_PROJECT_ID, branch = process.env.NEON_BRANCH_ID;
  const url = `https://console.neon.tech/api/v2/projects/${project}/branches/${branch}/auth/users/nonexistent-verification-probe-00000000`;
  const res = await fetch(url, { method: 'DELETE', headers: { authorization: 'Bearer ' + key } });
  const body = await res.text();
  return new Response(JSON.stringify({ status: res.status, body: body.slice(0, 500) }), { headers: { 'content-type': 'application/json' } });
};

export const config = { path: '/api/_diag' };
