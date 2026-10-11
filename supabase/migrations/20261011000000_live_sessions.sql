create table if not exists public.live_sessions (
  id text primary key,
  title text not null,
  meet_url text not null,
  scheduled_time text not null default '',
  image_url text,
  image_storage_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.live_sessions enable row level security;

revoke all on public.live_sessions from anon, authenticated;
grant select on public.live_sessions to anon, authenticated;
grant all on public.live_sessions to service_role;

drop policy if exists "Authenticated users can view live sessions"
  on public.live_sessions;
drop policy if exists "Anyone can view live sessions"
  on public.live_sessions;

create policy "Anyone can view live sessions"
  on public.live_sessions
  for select
  using (true);
