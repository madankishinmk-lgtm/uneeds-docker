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


@'

## Run with Docker

### Prerequisites
- Docker Desktop installed and running.
- A Supabase project with the required database tables and Storage bucket configured.

### 1. Clone the repository

```bash
git clone https://github.com/madankishinmk-lgtm/uneeds-docker.git
cd uneeds-docker
```

### 2. Configure environment variables

Copy the example file:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and fill in the required values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Never commit `.env.local` or share secret values.

### 3. Build the Docker image

The public Supabase URL and anon key are required during the Next.js build. In PowerShell, run:

```powershell
$supabaseUrl = (Get-Content .env.local | Where-Object { $_ -match '^\s*NEXT_PUBLIC_SUPABASE_URL\s*=' } | Select-Object -First 1) -replace '^\s*NEXT_PUBLIC_SUPABASE_URL\s*=\s*', ''
$supabaseAnonKey = (Get-Content .env.local | Where-Object { $_ -match '^\s*NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=' } | Select-Object -First 1) -replace '^\s*NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*', ''

$supabaseUrl = $supabaseUrl.Trim().Trim('"').Trim("'")
$supabaseAnonKey = $supabaseAnonKey.Trim().Trim('"').Trim("'")

if (!$supabaseUrl -or !$supabaseAnonKey) {
    throw "Supabase URL or anon key is missing from .env.local"
}

docker build --build-arg "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl" --build-arg "NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey" -t uneeds:docker .
```

### 4. Run the container

```powershell
docker run -d --name uneeds-container -p 3000:3000 --env-file .env.local uneeds:docker
```

Open http://localhost:3000 in your browser.

### 5. Verify the application

Check the container status and logs:

```powershell
docker ps
docker logs --tail 60 uneeds-container
```

Test the health endpoint:

```powershell
Invoke-WebRequest http://localhost:3000/api/health -UseBasicParsing
```

Verify that the storefront loads and that a test order appears in the admin dashboard.

### 6. Stop and remove the container

```powershell
docker rm -f uneeds-container
```

The application uses Supabase for persistent data. Removing the Docker container does not remove data stored in Supabase.

### Troubleshooting

- If port 3000 is already in use, stop the conflicting process or use a different host port, such as `-p 3001:3000`.
- If the application cannot connect to Supabase, verify the environment variables and Supabase configuration.
- If the image build fails, review the Docker build output for the first failing step.
'@ | Add-Content README.md
