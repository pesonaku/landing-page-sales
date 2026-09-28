# Roadmap Pengembangan Micro-SaaS Landing Page Sales Properti

Dokumen rencana kerja dan tahapan implementasi platform Micro-SaaS untuk agen properti berbasis **Next.js (App Router)**, **Tailwind CSS**, **Supabase**, dan **Midtrans**.

---

### Tahap 1: Desain Skema Database & Row Level Security (RLS) Supabase
**Tujuan:** Menyiapkan struktur database yang aman dan terisolasi untuk data sales dan leads calon pembeli.
- [x] Membuat tabel `public.profiles` (id, nama_sales, slug_url, no_wa, pixel_id, langganan_aktif_sampai, is_active).
- [x] Membuat tabel `public.leads` (id, created_at, nama_pembeli, no_wa_pembeli, sales_id).
- [x] Mengaktifkan Row Level Security (RLS) pada tabel `profiles` dan `leads`.
- [x] Kebijakan RLS: Publik bisa membaca profil untuk landing page, sales hanya bisa update profil miliknya sendiri.
- [x] Kebijakan RLS: Publik (calon pembeli) bisa insert data leads baru, sales hanya bisa melihat leads miliknya.
- [x] Trigger otomatis `handle_new_user` saat user baru mendaftar di Supabase Auth.

---

### Tahap 2: Landing Page Dinamis & Dynamic Meta Pixel
**Tujuan:** Membuat halaman utama yang dinamis menyesuaikan parameter URL sales (`?sales=budi-marketing`).
- [x] Halaman utama `app/page.tsx` membaca parameter URL `?sales=`.
- [x] Query data profil sales dari Supabase berdasarkan parameter `slug_url`.
- [x] Desain UI perumahan subsidi modern: Hero section, Galeri unit, Spesifikasi material, dan Tabel Simulasi KPR FLPP.
- [x] Menampilkan data nama sales terverifikasi dan tombol kontak WhatsApp.
- [x] Komponen `components/MetaPixel.tsx` menggunakan `next/script` (`strategy="afterInteractive"`) untuk menyuntikkan Meta/FB Pixel ID dinamis milik sales.

---

### Tahap 3: Fitur Buku Tamu Digital (Perekam Leads / Calon Pembeli)
**Tujuan:** Mencegat pengunjung sebelum diarahkan ke WA sales agar data terekam di database untuk klaim Success Fee Rp 1–2 Juta.
- [x] Komponen pop-up/dialog `components/LeadCaptureModal.tsx` dengan Tailwind CSS.
- [x] Intersepsi klik tombol "Hubungi Sales via WhatsApp" agar membuka modal terlebih dahulu.
- [x] Form input: Nama Lengkap (`nama_pembeli`) dan No. WhatsApp (`no_wa_pembeli`).
- [x] Simpan data leads ke Supabase tabel `leads` dengan relasi `sales_id`.
- [x] Setelah sukses tersimpan, redirect otomatis ke WhatsApp sales via `window.open` dengan format pesan template.

---

### Tahap 4: Sistem Login & Dashboard Sales (Multi-User)
**Tujuan:** Portal bagi para agen sales untuk login, mengubah profil, memasang Meta Pixel, dan mengelola prospek konsumen.
- [x] Halaman login & registrasi sales `app/login/page.tsx` menggunakan Supabase Auth.
- [x] Penanganan ramah untuk error email rate limit Supabase.
- [x] Layout dashboard terproteksi `app/dashboard/layout.tsx` (redirect otomatis jika belum login).
- [x] Halaman `app/dashboard/page.tsx`:
  - [x] Form Edit Profil (Nama, No WA, Slug URL, Meta Pixel ID).
  - [x] Fitur 1-click salin tautan landing page pribadi (`?sales=slug`).
  - [x] Tabel daftar leads masuk khusus milik sales yang sedang login dengan tombol direct chat WhatsApp.

---

### Tahap 5: Dashboard Super Admin (Ruang Kendali Master)
**Tujuan:** Kontrol master untuk memonitor performa seluruh sales, membekukan akun bermasalah, dan audit komisi akad.
- [x] Halaman Super Admin di `app/admin/page.tsx` yang diamankan berdasarkan whitelist email admin (`NEXT_PUBLIC_ADMIN_EMAIL`).
- [x] Card ringkasan: Total Sales Terdaftar, Leads Masuk Bulan Ini, dan Estimasi Potensi Success Fee.
- [x] Tabel Daftar Semua Sales: Menampilkan Nama, WA, Total Leads, Status Link, dan tombol **Blokir / Freeze Link** (toggle kolom `is_active`).
- [x] Tabel Semua Leads Global: Seluruh data leads dari semua sales untuk dicocokkan dengan berkas konsumen Akad Kredit di kantor.
- [x] Fitur verifikasi status Akad Kredit dan tombol **Export CSV Kantor** untuk pelaporan komisi.

---

### Tahap 6: Integrasi Pembayaran Online Otomatis (Midtrans)
**Tujuan:** Auto-pilot perpanjangan langganan sales Rp 50.000/bulan via QRIS / Bank Transfer.
- [x] Route Handler `app/api/checkout/route.ts` untuk membuat transaksi Snap Midtrans Rp 50.000 dengan `order_id` unik dan metadata `custom_field1: userId`.
- [x] Route Handler `app/api/webhook/route.ts` untuk menerima callback pembayaran sukses dari Midtrans.
- [x] Verifikasi keamanan SHA-512 Signature Key Midtrans.
- [x] Update otomatis ke tabel `profiles` via `supabaseAdmin` (Service Role Key / bypass RLS): menambah masa aktif `langganan_aktif_sampai` sebanyak **+30 hari** secara akumulatif dan memastikan `is_active: true`.
