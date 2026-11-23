-- Fresh install: run this whole file in the Supabase SQL editor.
-- For a database created from an earlier version of this file, run supabase-upgrade.sql instead.
--
-- Access model: the browser only ever reads its own profile row. Everything
-- else (resumes, reviews, promo codes, Stripe events) is read and written by
-- the Next.js API routes with the service-role key, which bypasses RLS.
-- RLS is enabled on every table so the public anon key can't touch them.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  stripe_customer_id text unique,
  subscription_status text not null default 'free',
  subscription_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  job_type text not null,
  preview_text text not null,
  full_text text not null,
  is_unlocked boolean not null default false,
  unlock_method text check (unlock_method in ('single', 'monthly', 'promo')),
  unlocked_at timestamptz,
  stripe_session_id text,
  created_at timestamptz not null default now()
);

create index resumes_user_created_idx on public.resumes (user_id, created_at desc);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  resume_id uuid not null unique references public.resumes on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  display_name text check (char_length(display_name) <= 40),
  job_type text,
  unlock_method text,
  created_at timestamptz not null default now()
);

create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  used_by uuid references auth.users,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.reviews enable row level security;
alter table public.promo_codes enable row level security;
alter table public.stripe_events enable row level security;

-- The only client-facing policy. There is deliberately no update policy:
-- subscription fields are written by the Stripe webhook alone.
create policy "Users can read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

-- Create a profile row for each new user.
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Redeem a single-use promo code against one of the user's locked resumes.
-- Runs as one transaction: if any check fails, nothing is changed, and the
-- conditional update on promo_codes means two concurrent calls can't both win.
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

-- Only the service role (the API route) may call it.
revoke execute on function public.redeem_promo_code(text, uuid, uuid) from public, anon, authenticated;
