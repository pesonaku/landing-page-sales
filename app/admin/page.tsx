"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Profile, Lead } from "@/types/database";
import {
  ShieldAlert,
  Users,
  UserCheck,
  TrendingUp,
  Search,
  Download,
  ExternalLink,
  Phone,
  MessageCircle,
  Ban,
  CheckCircle,
  Clock,
  Home,
  LogOut,
  RefreshCw,
  Loader2,
  Calendar,
  Sparkles,
  DollarSign,
  AlertTriangle,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface LeadWithSales extends Lead {
  salesName?: string;
  salesSlug?: string;
  salesWa?: string;
}

export default function SuperAdminPage() {
  const router = useRouter();

  // Konfigurasi email admin (bisa disetel via environment variable NEXT_PUBLIC_ADMIN_EMAIL)
  const configuredAdminEmail =
    process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase() || "";

  // State Keamanan & Autentikasi
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // State Data Admin
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [allLeads, setAllLeads] = useState<LeadWithSales[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filter & Search
  const [searchSales, setSearchSales] = useState("");
  const [searchLeads, setSearchLeads] = useState("");
  const [akadFilter, setAkadFilter] = useState<"all" | "akad" | "pending">("all");
  const [akadVerifiedIds, setAkadVerifiedIds] = useState<Record<string, boolean>>({});

  // 1. Verifikasi Email Admin
  useEffect(() => {
    const checkAdmin = async () => {
      setIsCheckingAuth(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      const email = user.email?.toLowerCase() || "";
      setCurrentUserEmail(email);

      // Ambil daftar email admin dari environment variable (bisa lebih dari satu, dipisah koma)
      const rawAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
      const adminEmailList = rawAdminEmails
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      // Verifikasi: Cocokkan apakah email user terdaftar di whitelist admin
      const isEmailAdmin =
        adminEmailList.length > 0
          ? adminEmailList.includes(email)
          : email.includes("admin");

      if (isEmailAdmin) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }

      setIsCheckingAuth(false);
    };

    checkAdmin();
  }, [router, configuredAdminEmail]);

  // 2. Fetch Data Global (Semua Sales & Semua Leads)
  const fetchGlobalData = async () => {
    setIsLoadingData(true);
    try {
      // A. Ambil semua data sales
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) console.error("Error fetching profiles:", profilesError.message);

      // B. Ambil semua data leads
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (leadsError) console.error("Error fetching leads:", leadsError.message);

      const loadedProfiles = profilesData || [];
      const loadedLeads = leadsData || [];

      // Buat mapping sales_id -> Profile
      const salesMap = new Map<string, Profile>();
      loadedProfiles.forEach((p) => salesMap.set(p.id, p));

      // Gabungkan leads dengan data sales terkait
      const mergedLeads: LeadWithSales[] = loadedLeads.map((lead) => {
        const sales = salesMap.get(lead.sales_id);
        return {
          ...lead,
          salesName: sales?.nama_sales || "Sales Tidak Ditemukan",
          salesSlug: sales?.slug_url || "",
          salesWa: sales?.no_wa || "",
        };
      });

      setProfiles(loadedProfiles);
      setAllLeads(mergedLeads);
    } catch (err) {
      console.error("Gagal mengambil data global admin:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchGlobalData();
    }
  }, [isAuthorized]);

  // 3. Hitung Statistik Ringkasan
  const stats = useMemo(() => {
    const totalSales = profiles.length;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Hitung leads bulan ini
    const leadsThisMonth = allLeads.filter((l) => {
      const d = new Date(l.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    // Estimasi Success Fee (Rp 1.500.000 per lead yang akad)
    const totalLeads = allLeads.length;
    const potentialSuccessFee = leadsThisMonth * 1500000;

    return {
      totalSales,
      leadsThisMonth,
      totalLeads,
      potentialSuccessFee,
    };
  }, [profiles, allLeads]);

  // Hitung jumlah leads per sales
  const salesLeadCount = useMemo(() => {
    const counts: Record<string, number> = {};
    allLeads.forEach((lead) => {
      counts[lead.sales_id] = (counts[lead.sales_id] || 0) + 1;
    });
    return counts;
  }, [allLeads]);

  // 4. Aksi Toggle Blokir / Freeze Link Sales
  const handleToggleFreezeSales = async (salesId: string, currentStatus: boolean | null | undefined) => {
    const newStatus = currentStatus === false ? true : false;
    const actionLabel = newStatus ? "mengaktifkan kembali" : "membekukan (freeze)";

    const confirmAction = confirm(
      `Apakah Anda yakin ingin ${actionLabel} link landing page sales ini?`
    );
    if (!confirmAction) return;

    setActionLoadingId(salesId);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_active: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", salesId);

      if (error) throw error;

      // Update state lokal
      setProfiles((prev) =>
        prev.map((p) => (p.id === salesId ? { ...p, is_active: newStatus } : p))
      );
    } catch (err: unknown) {
      console.error("Gagal mengubah status aktif sales:", err);
      const msg = err instanceof Error ? err.message : "Gagal mengubah status.";
      alert(`Terjadi kesalahan: ${msg}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 5. Fitur Export Leads ke CSV (Untuk pencocokan dengan berkas Akad Kantor)
  const handleExportCSV = () => {
    if (allLeads.length === 0) {
      alert("Tidak ada data leads untuk diexport.");
      return;
    }

    const headers = [
      "Tanggal Masuk",
      "Nama Pembeli",
      "No WA Pembeli",
      "Sales Pengakuisisi",
      "Slug URL Sales",
      "No WA Sales",
      "Status Verifikasi Akad",
    ];

    const rows = allLeads.map((l) => [
      new Date(l.created_at).toLocaleString("id-ID"),
      `"${l.nama_pembeli.replace(/"/g, '""')}"`,
      `"${l.no_wa_pembeli}"`,
      `"${(l.salesName || "").replace(/"/g, '""')}"`,
      `"${l.salesSlug || ""}"`,
      `"${l.salesWa || ""}"`,
      akadVerifiedIds[l.id] ? "SUDAH AKAD" : "BELUM AKAD",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `data-leads-kantor-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  // Toggle status ceklis akad lokal
  const toggleAkadStatus = (leadId: string) => {
    setAkadVerifiedIds((prev) => ({
      ...prev,
      [leadId]: !prev[leadId],
    }));
  };

  // Filter Sales
  const filteredProfiles = useMemo(() => {
    if (!searchSales.trim()) return profiles;
    const term = searchSales.toLowerCase();
    return profiles.filter(
      (p) =>
        (p.nama_sales && p.nama_sales.toLowerCase().includes(term)) ||
        (p.slug_url && p.slug_url.toLowerCase().includes(term)) ||
        (p.no_wa && p.no_wa.toLowerCase().includes(term))
    );
  }, [profiles, searchSales]);

  // Filter Leads
  const filteredLeads = useMemo(() => {
    let result = allLeads;

    // Filter Akad
    if (akadFilter === "akad") {
      result = result.filter((l) => akadVerifiedIds[l.id]);
    } else if (akadFilter === "pending") {
      result = result.filter((l) => !akadVerifiedIds[l.id]);
    }

    // Filter Kata Kunci
    if (searchLeads.trim()) {
      const term = searchLeads.toLowerCase();
      result = result.filter(
        (l) =>
          l.nama_pembeli.toLowerCase().includes(term) ||
          l.no_wa_pembeli.toLowerCase().includes(term) ||
          (l.salesName && l.salesName.toLowerCase().includes(term)) ||
          (l.salesSlug && l.salesSlug.toLowerCase().includes(term))
      );
    }

    return result;
  }, [allLeads, searchLeads, akadFilter, akadVerifiedIds]);

  // Layar Loading Sesi
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm font-medium text-slate-300">
            Memverifikasi Hak Akses Super Admin...
          </p>
        </div>
      </div>
    );
  }

  // Layar Akses Ditolak (Jika user login bukan admin)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-200">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Akses Ditolak (Unauthorized)</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Halaman ini khusus untuk <strong>Super Admin</strong>. Akun Anda (
            <code className="text-red-400 font-mono">{currentUserEmail}</code>) tidak terdaftar sebagai administrator.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Link
              href="/dashboard"
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors"
            >
              Ke Dashboard Sales
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors"
            >
              Ganti Akun (Logout)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      
      {/* Top Bar Admin */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-tight leading-tight flex items-center gap-2">
                <span>Ruang Kendali Super Admin</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-bold">
                  MASTER
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Logged as: <strong className="text-emerald-400">{currentUserEmail}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchGlobalData}
              disabled={isLoadingData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? "animate-spin text-indigo-400" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Web Utama</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. KARTU RINGKASAN EKSEKUTIF                                              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Sales */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Sales Terdaftar</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {stats.totalSales}
              </h3>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <UserCheck className="w-3 h-3" />
                Multi-User Aktif
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Leads Bulan Ini */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Leads Masuk Bulan Ini</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
                {stats.leadsThisMonth}
              </h3>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />
                Periode Berjalan
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Total Semua Leads */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Akumulasi Semua Leads</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {stats.totalLeads}
              </h3>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Database Buku Tamu
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Potensi Success Fee */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-200 font-medium">Potensi Success Fee</p>
              <h3 className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                Rp {stats.potentialSuccessFee.toLocaleString("id-ID")}
              </h3>
              <span className="text-[10px] text-slate-300 mt-1 block">
                Asumsi Rp 1,5 Jt / Akad
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. TABEL DAFTAR SEMUA SALES & KONTROL FREEZE LINK                         */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Daftar Semua Sales Agen</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {profiles.length} Agen
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kontrol hak akses, status langganan, dan bekukan link sales jika terjadi pelanggaran atau belum membayar fee.
              </p>
            </div>

            {/* Pencarian Sales */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari sales atau slug..."
                value={searchSales}
                onChange={(e) => setSearchSales(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredProfiles.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Tidak ada data sales yang ditemukan.
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Nama Sales</th>
                    <th className="px-5 py-3.5">No. WhatsApp</th>
                    <th className="px-5 py-3.5">Tautan Landing Page</th>
                    <th className="px-5 py-3.5 text-center">Total Leads</th>
                    <th className="px-5 py-3.5 text-center">Status Link</th>
                    <th className="px-5 py-3.5 text-center">Aksi Kontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredProfiles.map((p) => {
                    const count = salesLeadCount[p.id] || 0;
                    const isFrozen = p.is_active === false;
                    const isRowBusy = actionLoadingId === p.id;
                    const publicLink = `/?sales=${p.slug_url || ""}`;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Kolom Nama */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">
                            {p.nama_sales || "(Belum Mengisi Nama)"}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            ID: {p.id.slice(0, 8)}...
                          </div>
                        </td>

                        {/* Kolom WhatsApp */}
                        <td className="px-5 py-4 font-mono text-slate-900">
                          {p.no_wa ? (
                            <a
                              href={`https://wa.me/${p.no_wa.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{p.no_wa}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Belum diset</span>
                          )}
                        </td>

                        {/* Kolom Slug & Link */}
                        <td className="px-5 py-4">
                          {p.slug_url ? (
                            <a
                              href={publicLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-xs text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded-md"
                            >
                              <span>{p.slug_url}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Tidak ada slug</span>
                          )}
                        </td>

                        {/* Kolom Total Leads */}
                        <td className="px-5 py-4 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                            {count} Prospek
                          </span>
                        </td>

                        {/* Kolom Status Langganan / Freeze */}
                        <td className="px-5 py-4 text-center">
                          {isFrozen ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                              <Ban className="w-3 h-3" />
                              Dibekukan (Freeze)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle className="w-3 h-3" />
                              Aktif Beroperasi
                            </span>
                          )}
                        </td>

                        {/* Kolom Tombol Aksi Blokir / Freeze */}
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleFreezeSales(p.id, p.is_active)}
                            disabled={isRowBusy}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isFrozen
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                                : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                            } disabled:opacity-50`}
                          >
                            {isRowBusy ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : isFrozen ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Aktifkan Link</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" />
                                <span>Blokir / Freeze Link</span>
                              </>
                            )}
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TABEL SEMUA LEADS GLOBAL (UNTUK PENCOCOKAN DATA AKAD KANTOR)           */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Tabel Seluruh Leads Calon Pembeli</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {allLeads.length} Total
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Data calon pembeli masuk dari semua link sales untuk dicocokkan dengan data konsumen yang sudah Akad Kredit di kantor.
              </p>
            </div>

            {/* Action Bar: Filter & Export */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Status Akad */}
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setAkadFilter("all")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    akadFilter === "all" ? "bg-white text-slate-900 shadow-xs" : ""
                  }`}
                >
                  Semua ({allLeads.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAkadFilter("akad")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    akadFilter === "akad" ? "bg-emerald-600 text-white shadow-xs" : ""
                  }`}
                >
                  Sudah Akad
                </button>
                <button
                  type="button"
                  onClick={() => setAkadFilter("pending")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    akadFilter === "pending" ? "bg-white text-slate-900 shadow-xs" : ""
                  }`}
                >
                  Belum Akad
                </button>
              </div>

              {/* Tombol Export CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV Kantor</span>
              </button>
            </div>
          </div>

          {/* Search Bar Leads */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama pembeli, no WA, atau nama sales..."
              value={searchLeads}
              onChange={(e) => setSearchLeads(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            />
            {searchLeads && (
              <button
                type="button"
                onClick={() => setSearchLeads("")}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tabel Leads */}
          <div className="overflow-x-auto">
            {filteredLeads.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-500">
                Tidak ada data leads yang sesuai dengan pencarian atau filter Anda.
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-center">Verifikasi Akad</th>
                    <th className="px-5 py-3.5">Calon Pembeli</th>
                    <th className="px-5 py-3.5">No. WhatsApp</th>
                    <th className="px-5 py-3.5">Sales Terkait</th>
                    <th className="px-5 py-3.5">Tanggal Masuk</th>
                    <th className="px-5 py-3.5 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLeads.map((lead) => {
                    const isAkad = !!akadVerifiedIds[lead.id];
                    const cleanPhone = lead.no_wa_pembeli.replace(/\D/g, "");
                    const buyerWa = cleanPhone.startsWith("0")
                      ? `62${cleanPhone.slice(1)}`
                      : cleanPhone.startsWith("62")
                      ? cleanPhone
                      : `62${cleanPhone}`;

                    const dateObj = new Date(lead.created_at);
                    const formattedDate = dateObj.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const formattedTime = dateObj.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={lead.id}
                        className={`transition-colors ${
                          isAkad ? "bg-emerald-50/50 hover:bg-emerald-50" : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* Checkbox Akad */}
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleAkadStatus(lead.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              isAkad
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{isAkad ? "Sudah Akad" : "Tandai Akad"}</span>
                          </button>
                        </td>

                        {/* Nama Pembeli */}
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {lead.nama_pembeli}
                        </td>

                        {/* No WA Pembeli */}
                        <td className="px-5 py-4 font-mono font-medium text-slate-800">
                          {lead.no_wa_pembeli}
                        </td>

                        {/* Sales Terkait */}
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {lead.salesName}
                          </div>
                          {lead.salesSlug && (
                            <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              ?sales={lead.salesSlug}
                            </span>
                          )}
                        </td>

                        {/* Waktu Masuk */}
                        <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formattedDate}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 pl-5">
                            {formattedTime} WIB
                          </span>
                        </td>

                        {/* Aksi Langsung WA */}
                        <td className="px-5 py-4 text-center">
                          <a
                            href={`https://wa.me/${buyerWa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Hubungi</span>
                          </a>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </main>

      {/* Footer Admin */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Super Admin Control Panel — Hak Cipta Pesona Asri Residence.
      </footer>

    </div>
  );
}
