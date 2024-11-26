-- Create products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price decimal(10,2) not null,
  category text not null,
  image_url text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table products enable row level security;

-- Create policy for public read access
create policy "Products are viewable by everyone" on products
  for select using (true);

-- Insert sample products with CORS-enabled Unsplash images
insert into products (name, price, category, image_url, description) values
  ('Classic White T-Shirt', 29.99, 'Clothing', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80', 'Essential white t-shirt for everyday wear'),
  ('Denim Jacket', 89.99, 'Clothing', 'https://images.unsplash.com/photo-1601333144130-8cbb312386b6?auto=format&fit=crop&w=800&q=80', 'Classic denim jacket with modern fit'),
  ('Black Dress', 129.99, 'Clothing', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80', 'Elegant black dress for any occasion'),
  ('Leather Sneakers', 79.99, 'Footwear', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80', 'Premium leather sneakers'),
  ('Smart Watch', 199.99, 'Electronics', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80', 'Modern smartwatch with health tracking'),
  ('Cotton Hoodie', 59.99, 'Clothing', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80', 'Comfortable cotton hoodie for casual wear');