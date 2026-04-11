-- Run this entire file in your Supabase project's SQL Editor

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  stripe_customer_id text unique,
  subscription_status text not null default 'free',
  subscription_period_end timestamptz,
  created_at timestamptz default now() not null
);

-- Resumes table
create table public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  job_type text not null,
  preview_text text not null,
  full_text text not null,
  is_unlocked boolean not null default false,
  unlock_method text check (unlock_method in ('single', 'monthly', 'promo')),
  unlocked_at timestamptz,
  stripe_session_id text,
  created_at timestamptz default now() not null
);

-- Reviews table (public read, authenticated write)
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  resume_id uuid references public.resumes on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  display_name text,
  job_type text,
  unlock_method text,
  purchased_at timestamptz,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.reviews enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Resumes policies
create policy "Users can view own resumes" on public.resumes
  for select using (auth.uid() = user_id);
create policy "Users can insert own resumes" on public.resumes
  for insert with check (auth.uid() = user_id);

-- Reviews policies
create policy "Anyone can read reviews" on public.reviews
  for select using (true);
create policy "Users can insert own reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

-- Promo codes table (one-time use)
create table public.promo_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  used_by uuid references auth.users,
  used_at timestamptz,
  created_at timestamptz default now() not null
);

alter table public.promo_codes enable row level security;

-- Anyone authenticated can attempt to redeem (the API handles the logic)
create policy "Authenticated users can read promo codes" on public.promo_codes
  for select using (auth.uid() is not null);
create policy "Authenticated users can update promo codes" on public.promo_codes
  for update using (auth.uid() is not null);

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
