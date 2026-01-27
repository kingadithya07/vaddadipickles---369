-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS TABLE
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
  category text not null,
  image_url text not null,
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ADDRESSES TABLE
create table addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  phone text not null,
  alternate_phone text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COUPONS TABLE
create table coupons (
  id uuid default uuid_generate_v4() primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null,
  min_order_value numeric default 0,
  is_active boolean default true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EXPENSES TABLE
create table expenses (
  id uuid default uuid_generate_v4() primary key,
  description text not null,
  amount numeric not null,
  category text not null,
  date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS TABLE
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  total_amount numeric not null,
  status text default 'pending' check (status in ('pending', 'payment_pending', 'approved', 'shipped', 'delivered', 'cancelled')),
  payment_method text default 'upi',
  shipping_address text not null,
  utr_reference text,
  payment_screenshot_url text,
  coupon_code text,
  discount_amount numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDER ITEMS TABLE
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id),
  quantity integer not null,
  price numeric not null
);

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public) values ('payment-proofs', 'payment-proofs', true);

-- ROW LEVEL SECURITY (RLS)
alter table profiles enable row level security;
alter table products enable row level security;
alter table addresses enable row level security;
alter table coupons enable row level security;
alter table expenses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- POLICIES

-- Profiles: Public read, User update own
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Products: Public read, Admin write
create policy "Products are viewable by everyone." on products for select using (true);
create policy "Admin can insert products" on products for insert with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin can update products" on products for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Addresses: User manage own
create policy "Users can view own addresses" on addresses for select using (auth.uid() = user_id);
create policy "Users can insert own addresses" on addresses for insert with check (auth.uid() = user_id);
create policy "Users can update own addresses" on addresses for update using (auth.uid() = user_id);
create policy "Users can delete own addresses" on addresses for delete using (auth.uid() = user_id);

-- Coupons: Viewable by everyone (for validation), Admin manage
create policy "Coupons are viewable by everyone" on coupons for select using (true);
create policy "Admins can insert coupons" on coupons for insert with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update coupons" on coupons for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete coupons" on coupons for delete using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Expenses: Admin manage only
create policy "Admins can view expenses" on expenses for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can insert expenses" on expenses for insert with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update expenses" on expenses for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete expenses" on expenses for delete using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Orders: User view own, Admin view all. User create. Admin update.
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Admins can view all orders" on orders for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Users can create orders" on orders for insert with check (auth.uid() = user_id);
create policy "Admins can update orders" on orders for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Order Items: Viewable if order is viewable
create policy "Users can view own order items" on order_items for select using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Admins can view all order items" on order_items for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Users can create order items" on order_items for insert with check (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- STORAGE POLICIES
create policy "Public Access" on storage.objects for select using ( bucket_id = 'payment-proofs' );
create policy "Authenticated users can upload" on storage.objects for insert with check ( bucket_id = 'payment-proofs' and auth.role() = 'authenticated' );

-- TRIGGER FOR NEW USERS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SEED DATA
insert into products (name, description, price, category, image_url, stock) values
('Avakaya Mango Pickle', 'Traditional cut mango pickle with mustard and chili.', 350, 'Mango', 'https://images.unsplash.com/photo-1589135233689-d53f6804a37f?auto=format&fit=crop&q=80&w=600', 50),
('Gongura Pickle', 'Tangy sorrel leaves pickle, a signature Andhra delicacy.', 300, 'Gongura', 'https://images.unsplash.com/photo-1606923829579-0cb9d46a6db5?auto=format&fit=crop&q=80&w=600', 30),
('Lime Pickle', 'Sun-dried lime pickle aged to perfection.', 250, 'Lemon', 'https://images.unsplash.com/photo-1599307767316-77f8646b2b41?auto=format&fit=crop&q=80&w=600', 45),
('Tomato Pickle', 'Spicy tomato thokku suitable for rice and dosa.', 280, 'Tomato', 'https://images.unsplash.com/photo-1616645258469-ec681c17f3ee?auto=format&fit=crop&q=80&w=600', 40);

-- SEED COUPONS
insert into coupons (code, discount_type, discount_value, min_order_value, is_active) values
('WELCOME10', 'percentage', 10, 500, true),
('FLAT50', 'fixed', 50, 1000, true);