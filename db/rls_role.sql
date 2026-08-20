-- On We Go — arm row-level security with a non-owner role.
-- Run once, in the Neon Console SQL Editor, against the main branch.
--
-- DATABASE_URL currently connects as neondb_owner, which has rolbypassrls = t,
-- so the policies in schema.sql exist but are never actually checked. This
-- creates a role that can't bypass them, and grants it exactly the access the
-- sync function needs — nothing else.
--
-- Before running: replace REPLACE_WITH_A_STRONG_PASSWORD below with a real
-- generated password (e.g. `openssl rand -base64 24`). This file is checked
-- into the repo, so the placeholder must not be the real value at the point
-- you commit — edit it locally, run it, then leave the file as a placeholder
-- again (or don't commit your edit).
--
-- After running this: generate a connection string for onwego_api (Neon
-- Console → Connect → pick role "onwego_api") and set it as DATABASE_URL in
-- Netlify. Keep the current value noted somewhere until the new one is
-- verified working — see HANDOFF.md's RLS item for the rollback plan.

create role onwego_api login password 'REPLACE_WITH_A_STRONG_PASSWORD' noinherit;

grant usage on schema public to onwego_api;
grant select, insert, update, delete on app_state, app_snapshot to onwego_api;
grant execute on function prune_snapshots(text, int) to onwego_api;

-- onwego_api is a fresh role, so rolbypassrls is false by default and the
-- app_state_own / app_snapshot_own policies from schema.sql now apply to it.
