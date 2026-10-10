create table if not exists public.classes (
  id text primary key,
  title text not null,
  youtube_url text not null,
  notes text not null default '',
  pdf_url text not null default '',
  pdf_file_name text,
  pdf_storage_path text,
  image_url text,
  image_storage_path text,
  date_added date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.classes enable row level security;

revoke all on public.classes from anon, authenticated;
grant select on public.classes to authenticated;
grant all on public.classes to service_role;

drop policy if exists "Authenticated users can view classes"
  on public.classes;

create policy "Authenticated users can view classes"
  on public.classes
  for select
  to authenticated
  using (true);

insert into storage.buckets (id, name, public)
values ('class-assets', 'class-assets', false)
on conflict (id) do update
  set public = excluded.public;
