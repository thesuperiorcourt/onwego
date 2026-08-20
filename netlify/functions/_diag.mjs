/* Temporary — verifying which env vars the deployed function runtime
   actually sees, after netlify dev:exec showed NEON_API_KEY missing
   locally while the other three showed up. Booleans only, never values.
   Delete this file once the check is done. */
export default async () => new Response(JSON.stringify({
  NEON_API_KEY: !!process.env.NEON_API_KEY,
  NEON_PROJECT_ID: !!process.env.NEON_PROJECT_ID,
  NEON_BRANCH_ID: !!process.env.NEON_BRANCH_ID,
  SENTRY_DSN: !!process.env.SENTRY_DSN,
  DATABASE_URL: !!process.env.DATABASE_URL
}), { headers: { 'content-type': 'application/json' } });

export const config = { path: '/api/_diag' };
