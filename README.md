# UNeeds

A production-ready Next.js storefront for ordering dorm essentials before arriving on campus.

## Features
- Responsive landing page with premium UI and animations
- Product browsing and shopping cart
- Checkout with order submission and payment proof upload
- Hidden admin panel protected by password
- Supabase-backed products, orders, and settings

## Environment variables
Copy .env.example to .env.local and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase SQL
Create the following tables in your Supabase project:

```sql
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0,
  image_url text,
  category text default 'General',
  stock integer default 0,
  description text,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  customer_name text not null,
  whatsapp text not null,
  student_id text,
  major text not null,
  gender text not null,
  notes text,
  subtotal numeric not null default 0,
  service_fee numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'Waiting Verification',
  payment_proof_url text,
  payment_proof_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric not null default 0,
  total_price numeric not null default 0,
  created_at timestamptz default now()
);

create table if not exists payment_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  file_name text,
  file_url text,
  created_at timestamptz default now()
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  whatsapp_number text,
  bca_account_number text,
  bca_account_name text,
  qris_image_url text,
  service_fee numeric default 0,
  announcement text,
  created_at timestamptz default now()
);
```

## Storage bucket
Create a Supabase Storage bucket named `payment-proofs` with public access.

## Deploy
1. Push this repository to GitHub.
2. Import it into Vercel.
3. Add the environment variables in Vercel.
4. Deploy.
