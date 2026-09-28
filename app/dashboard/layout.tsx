"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/database";
import {
  Home,
  LogOut,
  ExternalLink,
  User,
  Loader2,
  Calendar,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Cek sesi user saat ini
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      if (isMounted) {
        setUserEmail(user.email || "");

        // Ambil data profil sales
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileData && isMounted) {
          setProfile(profileData);
        }
        setIsLoading(false);
      }
    };

    checkUser();

    // 2. Pasang listener status auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/login");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/login");
  };

  // Tampilan loading proteksi dashboard
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-300">
            Memverifikasi akses Sales Dashboard...
          </p>
        </div>
      </div>
    );
  }

  const landingPageUrl = profile?.slug_url
    ? `/?sales=${profile.slug_url}`
    : "/";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navbar Dashboard */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-none block">
                  Pesona Asri
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 tracking-wide uppercase">
                  Sales Dashboard
                </span>
              </div>
            </Link>
          </div>

          {/* Action Menu Kanan */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Tombol Lihat Landing Page */}
            <a
              href={landingPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
            >
              <span>Landing Page Anda</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Profile Info Mini */}
            <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="font-bold text-slate-900 truncate max-w-[130px]">
                  {profile?.nama_sales || userEmail.split("@")[0]}
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
                  {userEmail}
                </div>
              </div>
            </div>

            {/* Tombol Logout */}
            <button
              onClick={handleLogout}
              title="Keluar dari akun"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer Minimalis */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Pesona Asri Residence — Platform Micro-SaaS Agen Properti</span>
          <span>Sistem Manajemen Leads & Dynamic Meta Pixel</span>
        </div>
      </footer>
    </div>
  );
}
