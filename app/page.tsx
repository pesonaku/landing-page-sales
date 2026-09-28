import { getSalesProfileBySlug } from "@/lib/supabase";
import MetaPixel from "@/components/MetaPixel";
import {
  Phone,
  MessageCircle,
  CheckCircle2,
  Home,
  MapPin,
  ShieldCheck,
  Zap,
  Droplets,
  Calendar,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Award,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  // Next.js 15+ searchParams adalah Promise yang wajib di-await
  const resolvedSearchParams = await searchParams;
  const salesSlug =
    typeof resolvedSearchParams.sales === "string"
      ? resolvedSearchParams.sales.trim()
      : undefined;

  // Fetch profil sales dari Supabase berdasarkan slug_url
  const profile = salesSlug ? await getSalesProfileBySlug(salesSlug) : null;

  // Fallback data jika profil belum ada atau parameter ?sales= tidak diisi
  const salesName = profile?.nama_sales || "Konsultan Properti Resmi";
  const rawWa = profile?.no_wa || "081234567890";
  const pixelId = profile?.pixel_id;

  // Format nomor WA ke standar internasional (62xxxx)
  const cleanWa = rawWa.replace(/\D/g, "");
  const formattedWa = cleanWa.startsWith("0")
    ? `62${cleanWa.slice(1)}`
    : cleanWa.startsWith("62")
    ? cleanWa
    : `62${cleanWa}`;

  // Template pesan otomatis WhatsApp
  const waMessage = encodeURIComponent(
    `Halo ${salesName}, saya tertarik dengan info Rumah Subsidi Modern di Pesona Asri Residence (Angsuran Flat 1 Jutaan). Boleh kirimkan brosur, simulasi KPR, dan info jadwal survei lokasi?`
  );
  const waUrl = `https://wa.me/${formattedWa}?text=${waMessage}`;

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* 1. Dynamic Meta Pixel Injection */}
      <MetaPixel pixelId={pixelId} />

      {/* 2. Top Banner Informasi Subsidi */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white text-xs sm:text-sm py-2.5 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
          PROGRAM FLPP 2026
        </span>
        <span>
          Rumah Subsidi Pemerintah: Suku Bunga Flat 5% Sampai Lunas & Bebas Biaya KPR!
        </span>
      </div>

      {/* 3. Header & Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                Pesona Asri Residence
              </div>
              <p className="text-xs text-emerald-700 font-medium hidden sm:block">
                Hunian Modern Nuansa Komersil
              </p>
            </div>
          </div>

          {/* Sales Card Mini di Header */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-xs text-slate-500 flex items-center justify-end gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sales Resmi Siap Melayani
              </div>
              <div className="text-sm font-bold text-slate-900">{salesName}</div>
            </div>

            <a
              id="cta-header-wa"
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Hubungi Sales</span>
            </a>
          </div>
        </div>
      </header>

      {/* 4. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-white via-emerald-50/30 to-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Teks Hero */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Pilihan Terbaik Subsidi Rasa Real Estate</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
                Miliki Rumah Impian Modern{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  Angsuran Flat 1 Jutaan
                </span>{" "}
                Per Bulan!
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Solusi hunian bersubsidi dengan desain modern minimalis tipe 36/60, double dinding hebel, dan lokasi strategis hanya 15 menit ke akses transportasi umum.
              </p>

              {/* Point Keunggulan Utama */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Uang Muka (DP)</div>
                  <div className="text-base sm:text-lg font-bold text-emerald-600">0% / Bebas DP</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Bunga KPR FLPP</div>
                  <div className="text-base sm:text-lg font-bold text-slate-900">5% Tetap (Flat)</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
                  <div className="text-xs text-slate-500 font-medium">Biaya Akad & Pajak</div>
                  <div className="text-base sm:text-lg font-bold text-emerald-600">Gratis (Ditanggung)</div>
                </div>
              </div>

              {/* CTA Utama dan Profil Sales */}
              <div className="pt-3 space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <a
                    id="cta-hero-wa"
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-base font-bold px-7 py-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>Hubungi Sales via WhatsApp</span>
                  </a>
                  <a
                    href="#simulasi-kpr"
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-6 py-4 rounded-xl shadow-xs transition-colors"
                  >
                    <span>Cek Tabel KPR</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Banner Mini Sales Contact */}
                <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-emerald-200/70 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-emerald-800 text-sm">
                    {salesName.charAt(0)}
                  </div>
                  <div className="text-xs sm:text-sm">
                    <div className="text-slate-500">Sales Representatif Anda:</div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{salesName}</span>
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Foto Hero Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-3xl blur-xl opacity-30"></div>
                
                <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
                    alt="Rumah Modern Subsidi Pesona Asri"
                    className="w-full h-80 sm:h-96 object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent p-5 text-white">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500 mb-1">
                      Tipe 36/60 Siap Huni
                    </span>
                    <h3 className="font-bold text-lg">Pesona Asri Residence</h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      15 Menit ke Pintu Tol & Stasiun Terdekat
                    </p>
                  </div>
                </div>

                {/* Floating Badge Promo */}
                <div className="absolute -bottom-5 -left-4 sm:left-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black">
                    5%
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">Bunga KPR Flat</div>
                    <div className="text-slate-500">Cicilan Tidak Berubah</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Galeri Foto Hunian & Kawasan */}
      <section id="galeri" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Dokumentasi & Galeri
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-3">
              Desain Elegan, Kualitas Nyata
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Lihat langsung kualitas bangunan subsidi dengan standar hunian komersil yang nyaman untuk keluarga tercinta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Foto 1: Fasad Depan */}
            <div className="group rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex flex-col">
              <div className="h-56 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"
                  alt="Fasad Rumah Modern Minimalis"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                  Fasad Depan Minimalis
                </span>
              </div>
              <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Fasad Tipe 36/60 Scandinavian</h4>
                <p className="text-xs text-slate-500 mt-1">Carport luas, taman asri, dan konsep atap tinggi sejuk.</p>
              </div>
            </div>

            {/* Foto 2: Ruang Tamu */}
            <div className="group rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex flex-col">
              <div className="h-56 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
                  alt="Ruang Tamu & Ruang Keluarga"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                  Ruang Keluarga
                </span>
              </div>
              <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Ruang Tamu Terbuka (Open Concept)</h4>
                <p className="text-xs text-slate-500 mt-1">Plafon tinggi 3.2 meter menjamin sirkulasi udara optimal.</p>
              </div>
            </div>

            {/* Foto 3: Kamar Tidur */}
            <div className="group rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex flex-col">
              <div className="h-56 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80"
                  alt="Kamar Tidur Utama"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                  Kamar Tidur
                </span>
              </div>
              <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-slate-900 text-sm">2 Kamar Tidur Nyaman</h4>
                <p className="text-xs text-slate-500 mt-1">Ventilasi kaca alami yang menghadap ke taman depan & belakang.</p>
              </div>
            </div>

            {/* Foto 4: Dapur & Halaman Belakang */}
            <div className="group rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex flex-col">
              <div className="h-56 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"
                  alt="Area Dapur"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                  Dapur Siap Pakai
                </span>
              </div>
              <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Meja Dapur & Sink</h4>
                <p className="text-xs text-slate-500 mt-1">Sudah dilengkapi bak cuci piring dan instalasi air siap pakai.</p>
              </div>
            </div>

            {/* Foto 5: Fasilitas Masjid & Taman */}
            <div className="group rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex flex-col">
              <div className="h-56 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80"
                  alt="Fasilitas Taman Lingkungan"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                  Fasilitas Kawasan
                </span>
              </div>
              <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Taman Bermain & Sarana Ibadah</h4>
                <p className="text-xs text-slate-500 mt-1">Lingkungan ramah anak, jalan paving block lebar 7 meter.</p>
              </div>
            </div>

            {/* Foto 6: Row Jalan Lingkungan */}
            <div className="group rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex flex-col">
              <div className="h-56 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
                  alt="Akses Gerbang Utama"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                  Keamanan 24 Jam
                </span>
              </div>
              <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-slate-900 text-sm">One Gate System & Pos Security</h4>
                <p className="text-xs text-slate-500 mt-1">Aman, tenang, dan diawasi CCTV 24 jam penuh.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Spesifikasi Bangunan */}
      <section id="spesifikasi" className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Kualitas Bangunan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-3">
              Spesifikasi Teknis Material
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Material pilihan bermutu tinggi agar rumah Anda kokoh, tahan lama, dan minim biaya renovasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Struktur & Dinding</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Pondasi batu kali, sloof beton bertulang, dinding bata ringan (hebel) <strong>double dinding</strong>, plester & cat.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Rangka Atap & Genteng</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Kuda-kuda baja ringan anti karat, penutup genteng metal berpasir / genteng beton presisi tahan panas.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Lantai & Kusen</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Lantai keramik 40x40 motif marmer, kusen aluminium powder coating anti rayap dan tahan cuaca.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Daya Listrik</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Instalasi listrik resmi PLN 1.300 Watt prabayar (token), siap untuk AC dan perlengkapan elektronik modern.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Sumber Air Bersih</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Sumur bor pantek dengan pompa listrik otomatis, air jernih tidak berbau dan layak pakai.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Sanitasi & Toilet</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Kloset duduk modern, shower set dinding, serta bak kontrol septictank biofil ramah lingkungan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Tabel Simulasi KPR Subsidi FLPP */}
      <section id="simulasi-kpr" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Transparansi Biaya
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-3">
              Tabel Simulasi Angsuran KPR FLPP
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Suku bunga tetap (flat) 5% per tahun dari Bank BTN / BSI / Mandiri hingga lunas tanpa khawatir suku bunga naik.
            </p>
          </div>

          {/* Rincian Harga Pokok */}
          <div className="bg-emerald-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-emerald-800">
              <div className="pt-2 sm:pt-0 sm:pr-4">
                <span className="text-xs text-emerald-300 font-medium">Harga Rumah Resmi (Pemerintah)</span>
                <div className="text-2xl sm:text-3xl font-extrabold mt-1">Rp 185.000.000</div>
                <span className="text-xs text-emerald-200">Tipe 36/60 Standar FLPP</span>
              </div>
              <div className="pt-4 sm:pt-0 sm:px-6">
                <span className="text-xs text-emerald-300 font-medium">Uang Muka (DP)</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">Rp 0 (DP 0%)</div>
                <span className="text-xs text-emerald-200">Cukup Booking Fee Rp 1 Juta</span>
              </div>
              <div className="pt-4 sm:pt-0 sm:pl-6">
                <span className="text-xs text-emerald-300 font-medium">Suku Bunga KPR Subsidi</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1">5.0% Fixed</div>
                <span className="text-xs text-emerald-200">Flat sampai masa tenor habis</span>
              </div>
            </div>
          </div>

          {/* Tabel Tenor & Angsuran */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Jangka Waktu (Tenor)</th>
                  <th className="px-5 py-4">Suku Bunga</th>
                  <th className="px-5 py-4">Estimasi Angsuran / Bulan</th>
                  <th className="px-5 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    10 Tahun (120 Bulan)
                  </td>
                  <td className="px-5 py-4">5% Fixed</td>
                  <td className="px-5 py-4 font-bold text-slate-900">Rp 1.960.000 / bln</td>
                  <td className="px-5 py-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      Tersedia
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    15 Tahun (180 Bulan)
                  </td>
                  <td className="px-5 py-4">5% Fixed</td>
                  <td className="px-5 py-4 font-bold text-slate-900">Rp 1.460.000 / bln</td>
                  <td className="px-5 py-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      Tersedia
                    </span>
                  </td>
                </tr>

                {/* Highlight Tenor 20 Tahun Paling Laris */}
                <tr className="bg-emerald-50/70 hover:bg-emerald-100/60 transition-colors border-l-4 border-l-emerald-600">
                  <td className="px-5 py-4 font-bold text-emerald-950 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    20 Tahun (240 Bulan)
                  </td>
                  <td className="px-5 py-4 font-semibold text-emerald-900">5% Fixed</td>
                  <td className="px-5 py-4 font-extrabold text-emerald-700 text-base">
                    Rp 1.220.000 / bln
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                      Paling Populer ⭐
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Rincian Promo Gratis Biaya Tambahan */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Bonus & Gratis Biaya Awal (Hemat Hingga Rp 18 Juta):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Gratis Bea Perolehan Hak atas Tanah & Bangunan (BPHTB)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Gratis Biaya Administrasi & Provisi Bank</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Gratis Biaya Akta Notaris & Sertifikat Hak Milik (SHM)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Gratis Pemasangan Listrik 1.300 Watt & Pompa Air</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Dedicated Sales Consultation Card */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-emerald-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* Avatar Sales */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  {salesName.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              {/* Detail Sales */}
              <div className="text-center sm:text-left flex-1 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Sales Konsultan Resmi Terverifikasi
                </span>
                <h3 className="text-2xl font-bold text-slate-950">{salesName}</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Konsultasikan kelengkapan berkas KPR Anda (SLIK/BI Checking, slip gaji, & pemilihan kavling terbaik) secara gratis tanpa biaya tambahan.
                </p>
                <div className="text-xs font-medium text-slate-500 pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-4">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    +{formattedWa}
                  </span>
                  <span>⭐ Rating 5.0 (Bantu &gt;50 Akad Sukses)</span>
                </div>
              </div>

              {/* Tombol Kontak WA */}
              <div className="w-full sm:w-auto">
                <a
                  id="cta-sales-card-wa"
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm sm:text-base font-bold px-6 py-4 rounded-xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-105"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Chat Sales Sekarang</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Pertanyaan Umum
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">Syarat Pengajuan KPR Subsidi</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                Siapa yang bisa mengajukan?
              </h5>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                WNI usia minimal 21 tahun (atau sudah menikah), belum pernah memiliki rumah, dan belum pernah menerima subsidi perumahan dari pemerintah.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                Berapa batas penghasilan?
              </h5>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Penghasilan total pemohon maksimal Rp 8.000.000/bulan (Karyawan tetap, kontrak, maupun wiraswasta berizin resmi).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                Bagaimana BI Checking / SLIK OJK?
              </h5>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Kolektibilitas lancar (Kol 1). Sales kami siap membantu menganalisa kelayakan SLIK OJK Anda sebelum pengajuan berkas.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                Apakah bisa survei lokasi dulu?
              </h5>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Tentu saja! Hubungi {salesName} sekarang untuk reservasi jadwal survei langsung ke lokasi dan melihat unit contoh kami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-sm text-white">Pesona Asri Residence</div>
            <p className="text-slate-400 mt-0.5">
              Program Resmi Perumahan Subsidi FLPP Pemerintah Republik Indonesia.
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p>Halaman ini dikelola langsung oleh <strong>{salesName}</strong></p>
            <p className="text-slate-500 mt-0.5">© {new Date().getFullYear()} All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* 11. Sticky WhatsApp Floating Bar (Mobile & Desktop Bottom-Right) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <a
          id="cta-floating-wa"
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-emerald-900/40 transition-all hover:scale-105"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6 fill-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
          </div>
          <div className="text-left text-xs leading-tight pr-1">
            <div className="text-emerald-100 font-normal">Hubungi Sales WA</div>
            <div className="font-bold text-sm">{salesName}</div>
          </div>
        </a>
      </div>
    </main>
  );
}
