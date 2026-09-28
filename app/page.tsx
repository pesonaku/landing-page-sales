import { getSalesProfileBySlug } from "@/lib/supabase";
import LandingPageClient from "@/components/LandingPageClient";

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

  // Fetch data profil sales dari tabel profiles berdasarkan parameter slug_url
  const profile = salesSlug ? await getSalesProfileBySlug(salesSlug) : null;

  return <LandingPageClient profile={profile} />;
}
