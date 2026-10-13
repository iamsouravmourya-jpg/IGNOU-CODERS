-- Run this SQL in your Supabase SQL Editor to enable Project Submissions:

create table if not exists public.project_submissions (
  id text primary key,
  student_name text not null,
  title text not null default 'HTML Practical Assignment',
  submission_type text not null default 'file',
  file_name text not null,
  file_content text,
  file_url text,
  file_storage_path text,
  user_id text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '2 days')
);

create index if not exists idx_project_submissions_expires_at
  on public.project_submissions (expires_at);

alter table public.project_submissions enable row level security;

revoke all on public.project_submissions from anon, authenticated;
grant select, insert, update, delete on public.project_submissions to anon, authenticated;
grant all on public.project_submissions to service_role;

drop policy if exists "Anyone can read active project submissions" on public.project_submissions;
drop policy if exists "Anyone can insert project submissions" on public.project_submissions;
drop policy if exists "Anyone can update their project submission" on public.project_submissions;
drop policy if exists "Anyone can delete project submissions" on public.project_submissions;

create policy "Anyone can read active project submissions"
  on public.project_submissions
  for select
  using (expires_at > now());

create policy "Anyone can insert project submissions"
  on public.project_submissions
  for insert
  with check (true);

create policy "Anyone can update their project submission"
  on public.project_submissions
  for update
  using (true);

create policy "Anyone can delete project submissions"
  on public.project_submissions
  for delete
  using (true);
