import { createClient } from "@supabase/supabase-js";
import { Profile } from "@/types/database";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Supabase client instance yang selalu terinisialisasi secara type-safe
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Mengambil profil sales dari tabel profiles berdasarkan parameter slug_url.
 */
export async function getSalesProfileBySlug(slug: string): Promise<Profile | null> {
  // Jika URL masih placeholder / belum diset di .env.local
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("slug_url", slug)
      .maybeSingle();

    if (error) {
      console.error("Error fetching sales profile from Supabase:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error fetching sales profile:", err);
    return null;
  }
}
