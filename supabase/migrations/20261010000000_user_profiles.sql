create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique
);

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

insert into public.profiles (id, email)
select id, email
from auth.users
where email is not null
on conflict (id) do update
  set email = excluded.email;

drop policy if exists "Users can view their own profile"
  on public.profiles;

create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create or replace function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is not null then
    insert into public.profiles (id, email)
    values (new.id, new.email)
    on conflict (id) do update
      set email = excluded.email;
  end if;

  return new;
end;
$$;

revoke execute on function public.sync_auth_user_profile()
  from public, anon, authenticated;

drop trigger if exists on_auth_user_profile_created on auth.users;

create trigger on_auth_user_profile_created
  after insert or update of email on auth.users
  for each row execute procedure public.sync_auth_user_profile();
