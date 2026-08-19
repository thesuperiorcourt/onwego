-- On We Go — application schema
-- Run once, in the Neon Console SQL Editor, against your main branch.
-- Managed Better Auth owns the neon_auth schema; this file only adds app tables.

create table if not exists app_state (
  user_id     text primary key,
  data        jsonb       not null,
  updated_at  bigint      not null default 0,
  saved_at    timestamptz not null default now()
);

create table if not exists app_snapshot (
  user_id     text        not null,
  stamp       date        not null,
  data        jsonb       not null,
  saved_at    timestamptz not null default now(),
  primary key (user_id, stamp)
);

create index if not exists app_snapshot_user_stamp
  on app_snapshot (user_id, stamp desc);

-- Row level security. The API connects as the owner role and always filters by
-- user_id, so these policies are a second lock rather than the only one: if a
-- future query forgets its WHERE clause, Postgres still refuses.
alter table app_state    enable row level security;
alter table app_snapshot enable row level security;

drop policy if exists app_state_own on app_state;
create policy app_state_own on app_state
  using (user_id = current_setting('app.user_id', true))
  with check (user_id = current_setting('app.user_id', true));

drop policy if exists app_snapshot_own on app_snapshot;
create policy app_snapshot_own on app_snapshot
  using (user_id = current_setting('app.user_id', true))
  with check (user_id = current_setting('app.user_id', true));

-- Keep a month of daily snapshots per user.
create or replace function prune_snapshots(uid text, keep int default 30)
returns void language sql as $$
  delete from app_snapshot
   where user_id = uid
     and stamp < (
       select min(stamp) from (
         select stamp from app_snapshot
          where user_id = uid
          order by stamp desc
          limit keep
       ) recent
     );
$$;
