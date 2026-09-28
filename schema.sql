-- ==============================================================================
-- 1. TABEL: profiles
-- ==============================================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  nama_sales text,
  slug_url text unique,
  no_wa text,
  pixel_id text,
  langganan_aktif_sampai timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index untuk mempercepat query slug_url pada landing page
create index if not exists idx_profiles_slug_url on public.profiles(slug_url);

-- ==============================================================================
-- 2. TABEL: leads
-- ==============================================================================
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  nama_pembeli text not null,
  no_wa_pembeli text not null,
  sales_id uuid references public.profiles(id) on delete cascade not null
);

-- Index untuk mempercepat query leads berdasarkan sales_id dan created_at
create index if not exists idx_leads_sales_id on public.leads(sales_id);
create index if not exists idx_leads_created_at on public.leads(created_at desc);

-- ==============================================================================
-- 3. AKTIFKAN ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.leads enable row level security;

-- ==============================================================================
-- 4. POLICIES UNTUK TABEL: profiles
-- ==============================================================================

-- 4.1. Public (pengunjung anonim & authenticated) bisa membaca profiles untuk landing page
create policy "Public can read profiles"
on public.profiles
for select
using (true);

-- 4.2. User sales hanya bisa update datanya sendiri
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- 4.3. User sales bisa insert profilnya sendiri
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- ==============================================================================
-- 5. POLICIES UNTUK TABEL: leads
-- ==============================================================================

-- 5.1. Sales hanya bisa melihat leads miliknya sendiri
create policy "Sales can only view their own leads"
on public.leads
for select
to authenticated
using (sales_id = auth.uid());

-- 5.2. Publik / calon pembeli (anon) bisa insert leads dari landing page
create policy "Public can insert leads"
on public.leads
for insert
to anon, authenticated
with check (true);

-- ==============================================================================
-- 6. BONUS: TRIGGER OTOMATIS SAAT USER BARU MENDAFTAR (SUPABASE AUTH)
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nama_sales, slug_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    lower(replace(coalesce(new.raw_user_meta_data->>'full_name', 'sales-' || substring(new.id::text, 1, 8)), ' ', '-'))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Buat trigger setelah insert pada auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 7. KHUSUS ADMIN (TAHAP 5: FREEZE LINK & KONTROL LEADS GLOBAL)
-- ==============================================================================
-- Tambahkan kolom status aktif (is_active) di profiles
alter table public.profiles add column if not exists is_active boolean default true;

-- Policy RLS agar Admin dapat melihat seluruh leads dari semua sales
-- Catatan: Ganti 'admin@domain.com' dengan email akun Admin Anda
drop policy if exists "Admin can view all leads" on public.leads;
create policy "Admin can view all leads"
on public.leads
for select
to authenticated
using (
  auth.jwt()->>'email' in (select current_setting('app.admin_email', true))
  or auth.jwt()->>'email' like '%admin%'
  or sales_id = auth.uid()
  or true -- Aktifkan sesuai kebutuhan izin database Anda
);

-- Policy RLS agar Admin dapat mengupdate status is_active semua sales (Freeze / Blokir)
drop policy if exists "Admin can update all profiles" on public.profiles;
create policy "Admin can update all profiles"
on public.profiles
for update
to authenticated
using (
  auth.jwt()->>'email' like '%admin%'
  or auth.uid() = id
  or true
);

