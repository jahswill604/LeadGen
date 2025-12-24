-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  company_name text,
  email text unique
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- After setting this up, all signups will automatically have a profile record.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, company_name)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'company_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Leads Table
create table leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  company_name text not null,
  website_url text,
  industry text,
  country text,
  summary text,
  general_email text,
  linkedin_url text,
  phone_number text,
  size text,
  quality_score integer,
  sources jsonb,
  status text check (status in ('discovered', 'enriching', 'complete', 'failed')),
  lead_type text check (lead_type in ('b2b', 'b2c')),
  enriched_data jsonb,
  created_at timestamp with time zone default now()
);

alter table leads enable row level security;

create policy "Users can view their own leads." on leads
  for select using (auth.uid() = user_id);

create policy "Users can insert their own leads." on leads
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own leads." on leads
  for update using (auth.uid() = user_id);

create policy "Users can delete their own leads." on leads
  for delete using (auth.uid() = user_id);

-- Search History / Campaigns Table
create table search_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  search_type text not null,
  niche text not null,
  location text not null,
  count integer not null,
  language text,
  target_role text,
  keywords text,
  product_context text,
  employee_range text,
  created_at timestamp with time zone default now()
);

alter table search_history enable row level security;

create policy "Users can view their own search history." on search_history
  for select using (auth.uid() = user_id);

create policy "Users can insert their own search history." on search_history
  for insert with check (auth.uid() = user_id);
