"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  X,
  User,
  Phone,
  MessageCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesId: string | null;
  salesName: string;
  salesWa: string;
}

export default function LeadCaptureModal({
  isOpen,
  onClose,
  salesId,
  salesName,
  salesWa,
}: LeadCaptureModalProps) {
  const [namaPembeli, setNamaPembeli] = useState("");
  const [noWaPembeli, setNoWaPembeli] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Format nomor WA Sales untuk URL wa.me
  const cleanSalesWa = salesWa.replace(/\D/g, "");
  const formattedSalesWa = cleanSalesWa.startsWith("0")
    ? `62${cleanSalesWa.slice(1)}`
    : cleanSalesWa.startsWith("62")
    ? cleanSalesWa
    : `62${cleanSalesWa}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi input sederhana
    if (!namaPembeli.trim()) {
      setErrorMessage("Silakan masukkan Nama Lengkap Anda.");
      return;
    }

    const cleanBuyerPhone = noWaPembeli.replace(/\D/g, "");
    if (cleanBuyerPhone.length < 9) {
      setErrorMessage("Silakan masukkan nomor WhatsApp yang valid (minimal 9 digit).");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Simpan ke database Supabase (Tabel leads) jika Supabase client & sales_id tersedia
      if (supabase && salesId) {
        const { error } = await supabase.from("leads").insert([
          {
            nama_pembeli: namaPembeli.trim(),
            no_wa_pembeli: cleanBuyerPhone,
            sales_id: salesId,
          },
        ]);

        if (error) {
          throw new Error(`Gagal menyimpan data ke database: ${error.message}`);
        }
      } else if (!salesId) {
        console.warn(
          "Peringatan: sales_id tidak ditemukan (kemungkinan menggunakan fallback default tanpa parameter ?sales= atau akun belum terdaftar di profiles)."
        );
      }

      // 2. Berhasil disimpan
      setIsSuccess(true);

      // 3. Buat URL WhatsApp sesuai format permintaan
      const waText = `Halo ${salesName}, saya ${namaPembeli.trim()} tertarik dengan perumahan ini.`;
      const waUrl = `https://wa.me/${formattedSalesWa}?text=${encodeURIComponent(waText)}`;

      // 4. Redirect ke WhatsApp via window.open
      setTimeout(() => {
        window.open(waUrl, "_blank");
        // Reset state dan tutup modal
        setIsLoading(false);
        setIsSuccess(false);
        setNamaPembeli("");
        setNoWaPembeli("");
        onClose();
      }, 700);
    } catch (err: unknown) {
      console.error("Terjadi kesalahan saat memproses leads:", err);
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan sistem, silakan coba lagi.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Kartu Dialog Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Tombol Close */}
        <button
          onClick={onClose}
          disabled={isLoading}
          aria-label="Tutup Modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Modal */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
            <MessageCircle className="w-6 h-6 fill-white" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Buku Tamu Digital</h3>
          <p className="text-xs text-emerald-100 mt-1 max-w-xs mx-auto">
            Hubungkan langsung dengan <strong>{salesName}</strong> untuk info promo, simulasi KPR & reservasi jadwal survei lokasi.
          </p>
        </div>

        {/* Body & Form */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Data Berhasil Dicatat!</h4>
              <p className="text-xs text-slate-500">
                Mengarahkan Anda ke WhatsApp <strong>{salesName}</strong> sekarang...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Input Nama Lengkap */}
              <div>
                <label
                  htmlFor="nama_pembeli"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="nama_pembeli"
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Rizki"
                    value={namaPembeli}
                    onChange={(e) => setNamaPembeli(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Input No WhatsApp */}
              <div>
                <label
                  htmlFor="no_wa_pembeli"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  No. WhatsApp Aktif <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="no_wa_pembeli"
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={noWaPembeli}
                    onChange={(e) => setNoWaPembeli(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pastikan nomor terhubung dengan WhatsApp untuk pengiriman brosur.
                </p>
              </div>

              {/* Jaminan Privasi */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Privasi Anda terjaga. Data langsung terhubung ke sales resmi.</span>
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghubungkan ke WhatsApp...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Lanjut ke WhatsApp Sales</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
