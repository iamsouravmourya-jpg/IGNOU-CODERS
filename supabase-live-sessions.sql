-- ============================================================
-- IGNOU CODERS: Live Sessions SQL Migration (Google Meet)
-- Run this in your Supabase SQL Editor (pyeater.in)
-- ============================================================

-- 1. Create table for live sessions
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

-- 2. Enable Row Level Security
alter table public.live_sessions enable row level security;

-- 3. Grant access permissions
revoke all on public.live_sessions from anon, authenticated;
grant select on public.live_sessions to anon, authenticated;
grant all on public.live_sessions to service_role;

-- 4. Set RLS Policies
drop policy if exists "Anyone can view live sessions" on public.live_sessions;
create policy "Anyone can view live sessions"
  on public.live_sessions
  for select
  using (true);

-- 5. Insert initial sample live session if table is empty
insert into public.live_sessions (id, title, meet_url, scheduled_time, is_active)
values (
  'live-welcome',
  'MCS-011: Live Logic Building & Doubt Clearing Session',
  'https://meet.google.com/new',
  'Saturday · 7:30 PM IST',
  true
)
on conflict (id) do nothing;
