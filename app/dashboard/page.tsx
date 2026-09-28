"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Profile, Lead } from "@/types/database";
import {
  User,
  Phone,
  Link as LinkIcon,
  Activity,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  Users,
  Search,
  RefreshCw,
  Clock,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function SalesDashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingLeads, setIsRefreshingLeads] = useState(false);

  // State Form Edit Profil
  const [formData, setFormData] = useState({
    nama_sales: "",
    no_wa: "",
    slug_url: "",
    pixel_id: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // State Pencarian Tabel Leads
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch profil & leads saat komponen dimuat
  useEffect(() => {
    if (!supabase) return;

    const fetchData = async () => {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      setUserId(user.id);

      // 1. Ambil data profil sales
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setFormData({
          nama_sales: profileData.nama_sales || "",
          no_wa: profileData.no_wa || "",
          slug_url: profileData.slug_url || "",
          pixel_id: profileData.pixel_id || "",
        });
      } else if (profileError) {
        console.error("Error loading profile:", profileError.message);
      }

      // 2. Ambil data leads milik sales ini
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("sales_id", user.id)
        .order("created_at", { ascending: false });

      if (leadsData) {
        setLeads(leadsData);
      } else if (leadsError) {
        console.error("Error loading leads:", leadsError.message);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Fungsi reload khusus untuk tabel leads
  const reloadLeads = async () => {
    if (!supabase || !userId) return;
    setIsRefreshingLeads(true);

    const { data: leadsData } = await supabase
      .from("leads")
      .select("*")
      .eq("sales_id", userId)
      .order("created_at", { ascending: false });

    if (leadsData) {
      setLeads(leadsData);
    }
    setIsRefreshingLeads(false);
  };

  // Simpan perubahan profil ke database Supabase
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !userId) return;

    setIsSaving(true);
    setStatusMessage(null);

    // Format slug agar aman (lowercase dan hilangkan spasi)
    const formattedSlug = formData.slug_url
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nama_sales: formData.nama_sales.trim(),
          no_wa: formData.no_wa.trim(),
          slug_url: formattedSlug,
          pixel_id: formData.pixel_id.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        if (error.code === "23505" || error.message.includes("unique")) {
          throw new Error(
            "Slug URL tersebut sudah digunakan oleh sales lain. Silakan pilih slug yang lain."
          );
        }
        throw error;
      }

      setFormData((prev) => ({ ...prev, slug_url: formattedSlug }));
      setStatusMessage({
        type: "success",
        text: "Profil dan Facebook Pixel berhasil diperbarui!",
      });

      // Update local state profile
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              nama_sales: formData.nama_sales.trim(),
              no_wa: formData.no_wa.trim(),
              slug_url: formattedSlug,
              pixel_id: formData.pixel_id.trim() || null,
            }
          : null
      );
    } catch (err: unknown) {
      console.error("Gagal update profil:", err);
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan perubahan profil.";
      setStatusMessage({
        type: "error",
        text: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // URL Landing page sales
  const currentSlug = formData.slug_url || profile?.slug_url || "";
  const publicLandingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?sales=${currentSlug}`
    : `/?sales=${currentSlug}`;

  const copyLandingPageUrl = () => {
    if (!currentSlug) return;
    navigator.clipboard.writeText(publicLandingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filter pencarian leads
  const filteredLeads = useMemo(() => {
    if (!searchTerm.trim()) return leads;
    const term = searchTerm.toLowerCase();
    return leads.filter(
      (lead) =>
        lead.nama_pembeli.toLowerCase().includes(term) ||
        lead.no_wa_pembeli.toLowerCase().includes(term)
    );
  }, [leads, searchTerm]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Memuat data Dashboard Sales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner & Statistik Cepat */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dashboard Sales Terverifikasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Halo, {profile?.nama_sales || "Sales Agen"}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Gunakan link landing page personal Anda untuk beriklan di Facebook/Instagram Ads. Seluruh leads yang masuk akan otomatis tercatat di sini.
            </p>
          </div>

          {/* Quick Stat Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <div className="flex items-center gap-2 text-xs text-emerald-200 font-medium">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Total Leads Masuk</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black mt-1">{leads.length}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <div className="flex items-center gap-2 text-xs text-emerald-200 font-medium">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Meta Pixel</span>
              </div>
              <div className="text-sm sm:text-base font-bold mt-2">
                {formData.pixel_id ? (
                  <span className="text-emerald-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Aktif
                  </span>
                ) : (
                  <span className="text-amber-300">Belum Terpasang</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kotak Link Landing Page Pribadi */}
        {currentSlug && (
          <div className="mt-6 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-2 overflow-hidden text-xs sm:text-sm">
              <LinkIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300 shrink-0">Link Iklan Anda:</span>
              <code className="text-emerald-200 font-mono font-medium truncate select-all">
                {publicLandingUrl}
              </code>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={copyLandingPageUrl}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Tersalin!" : "Salin Link"}</span>
              </button>
              <a
                href={publicLandingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Buka Landing Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Grid 2 Kolom: Form Edit Profil & Tabel Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================================= */}
        {/* BAGIAN 1: FORM EDIT PROFIL (4 Kolom pada Layar Besar)                      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <span>Pengaturan Profil Sales</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sesuaikan data kontak dan tracking pixel yang ditampilkan di landing page Anda.
            </p>
          </div>

          <div className="p-6">
            {statusMessage && (
              <div
                className={`mb-5 p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Nama Sales */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Sales <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Pratama"
                    value={formData.nama_sales}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_sales: e.target.value })
                    }
                    disabled={isSaving}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* No WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  No. WhatsApp Aktif <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={formData.no_wa}
                    onChange={(e) =>
                      setFormData({ ...formData, no_wa: e.target.value })
                    }
                    disabled={isSaving}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Nomor tujuan pengalihan WhatsApp calon pembeli.
                </p>
              </div>

              {/* Slug URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Slug URL Landing Page <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="budi-marketing"
                    value={formData.slug_url}
                    onChange={(e) =>
                      setFormData({ ...formData, slug_url: e.target.value })
                    }
                    disabled={isSaving}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Digunakan pada tautan: <code>?sales={formData.slug_url || "slug-anda"}</code>
                </p>
              </div>

              {/* Facebook Pixel ID */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Facebook / Meta Pixel ID
                  </label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    Opsional
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: 123456789012345"
                    value={formData.pixel_id}
                    onChange={(e) =>
                      setFormData({ ...formData, pixel_id: e.target.value })
                    }
                    disabled={isSaving}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Masukkan ID Meta Pixel untuk mencatat event PageView dari kampanye iklan FB/IG Anda.
                </p>
              </div>

              {/* Tombol Simpan Perubahan */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Perubahan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Profil</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BAGIAN 2: TABEL LEADS CALON PEMBELI (7 Kolom pada Layar Besar)             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Buku Tamu / Daftar Leads</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  {leads.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Data calon pembeli yang mengisi form sebelum dialihkan ke WhatsApp Anda.
              </p>
            </div>

            {/* Tombol Refresh Leads */}
            <button
              type="button"
              onClick={reloadLeads}
              disabled={isRefreshingLeads}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshingLeads ? "animate-spin text-emerald-600" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>

          {/* Search Bar Filter */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau no WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tampilan Tabel Leads */}
          <div className="overflow-x-auto">
            {filteredLeads.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {searchTerm ? "Tidak ada leads yang cocok" : "Belum Ada Leads Masuk"}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchTerm
                    ? "Coba ubah kata kunci pencarian Anda."
                    : "Bagikan link landing page pribadi Anda untuk mulai menerima data prospek calon pembeli."}
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Calon Pembeli</th>
                    <th className="px-5 py-3.5">No. WhatsApp</th>
                    <th className="px-5 py-3.5">Waktu Masuk</th>
                    <th className="px-5 py-3.5 text-center">Aksi Langsung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLeads.map((lead) => {
                    // Format tanggal masuk ke format Bahasa Indonesia
                    const leadDate = new Date(lead.created_at);
                    const formattedDate = leadDate.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const formattedTime = leadDate.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    // Format nomor pembeli untuk chat langsung
                    const cleanPhone = lead.no_wa_pembeli.replace(/\D/g, "");
                    const buyerWa = cleanPhone.startsWith("0")
                      ? `62${cleanPhone.slice(1)}`
                      : cleanPhone.startsWith("62")
                      ? cleanPhone
                      : `62${cleanPhone}`;

                    const followUpMessage = encodeURIComponent(
                      `Halo ${lead.nama_pembeli}, saya ${profile?.nama_sales || "Sales"} dari Pesona Asri Residence. Terima kasih telah menghubungi kami. Kapan ada waktu luang untuk survei lokasi rumah contoh kami?`
                    );
                    const directWaUrl = `https://wa.me/${buyerWa}?text=${followUpMessage}`;

                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Kolom Nama */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                              {lead.nama_pembeli.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">
                                {lead.nama_pembeli}
                              </div>
                              <span className="text-[10px] text-slate-400">Prospek Subsidi</span>
                            </div>
                          </div>
                        </td>

                        {/* Kolom No WA */}
                        <td className="px-5 py-4 font-mono text-slate-900 font-medium">
                          {lead.no_wa_pembeli}
                        </td>

                        {/* Kolom Tanggal Masuk */}
                        <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formattedDate}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 pl-5">
                            {formattedTime} WIB
                          </span>
                        </td>

                        {/* Kolom Aksi Chat */}
                        <td className="px-5 py-4 text-center">
                          <a
                            href={directWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all hover:scale-105"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white" />
                            <span>Follow Up WA</span>
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

      </div>
    </div>
  );
}
