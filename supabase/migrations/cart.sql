-- Create cart_items table
create table public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references products not null,
  quantity integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, product_id)
);

-- Enable RLS
alter table cart_items enable row level security;

-- Create policies
create policy "Users can view their own cart items" on cart_items
  for select using (auth.uid() = user_id);

create policy "Users can insert their own cart items" on cart_items
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own cart items" on cart_items
  for update using (auth.uid() = user_id);

create policy "Users can delete their own cart items" on cart_items
  for delete using (auth.uid() = user_id);