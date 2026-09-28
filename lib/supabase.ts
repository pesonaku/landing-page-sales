import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Profile } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase client instance yang aman, tidak crash jika environment variable belum diisi
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/**
 * Mengambil profil sales dari tabel profiles berdasarkan parameter slug_url.
 * Jika tidak ditemukan atau URL Supabase belum diisi, mengembalikan null secara graceful.
 */
export async function getSalesProfileBySlug(slug: string): Promise<Profile | null> {
  if (!supabase) {
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
