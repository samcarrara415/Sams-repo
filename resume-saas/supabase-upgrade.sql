-- Upgrade a database created from the earlier supabase-schema.sql.
-- The old policies let any signed-in user mark their own subscription active,
-- read the full text of locked resumes, insert unlocked resumes, and list or
-- edit every promo code. This removes those policies and adds what the
-- current API routes need. Safe to run more than once.

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "Users can view own resumes" on public.resumes;
drop policy if exists "Users can insert own resumes" on public.resumes;

drop policy if exists "Anyone can read reviews" on public.reviews;
drop policy if exists "Users can insert own reviews" on public.reviews;

drop policy if exists "Authenticated users can read promo codes" on public.promo_codes;
drop policy if exists "Authenticated users can update promo codes" on public.promo_codes;

create index if not exists resumes_user_created_idx on public.resumes (user_id, created_at desc);

-- One review per resume. Remove duplicates first if this fails.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reviews_resume_id_key') then
    alter table public.reviews add constraint reviews_resume_id_key unique (resume_id);
  end if;
end $$;

create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create or replace function public.redeem_promo_code(p_code text, p_resume_id uuid, p_user_id uuid)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_unlocked boolean;
  v_full_text text;
  v_promo_id uuid;
begin
  select is_unlocked, full_text into v_unlocked, v_full_text
  from resumes
  where id = p_resume_id and user_id = p_user_id
  for update;

  if not found then
    raise exception 'resume_not_found';
  end if;
  if v_unlocked then
    raise exception 'already_unlocked';
  end if;

  update promo_codes
  set used_by = p_user_id, used_at = now()
  where code = upper(trim(p_code)) and used_by is null
  returning id into v_promo_id;

  if v_promo_id is null then
    raise exception 'invalid_code';
  end if;

  update resumes
  set is_unlocked = true, unlock_method = 'promo', unlocked_at = now()
  where id = p_resume_id;

  return v_full_text;
end;
$$;

revoke execute on function public.redeem_promo_code(text, uuid, uuid) from public, anon, authenticated;
