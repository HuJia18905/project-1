-- First, drop existing objects
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.profiles;

-- Create the profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade,
  full_name text,
  phone text,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Enable RLS
alter table profiles enable row level security;

-- Create policies
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

-- Create the function to handle new user creation
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, updated_at)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();