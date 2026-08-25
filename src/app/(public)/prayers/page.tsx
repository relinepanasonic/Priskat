import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PrayerList from "@/components/prayers/PrayerList";
import type { Prayer } from "@/lib/types/database.types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Doa | Prayers" };

export default async function PrayerPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const lang = params.lang === "en" ? "en" : "id";

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  }

  const { data: prayersData } = await supabase
    .from("prayers" as any)
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const prayers = (prayersData ?? []) as unknown as Prayer[];

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg pb-16">
      <Navbar profile={profile} />

      <main className="flex-1 px-4 pt-6 pb-24 max-w-md mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">
            {lang === "id" ? "🙏 Doa" : "🙏 Prayers"}
          </h1>
          <p className="text-brand-muted text-sm">
            {lang === "id"
              ? "Kumpulan doa Katolik untuk kehidupan sehari-hari"
              : "Catholic prayers for everyday life"}
          </p>
        </div>

        {/* Language Toggle */}
        <div className="mb-6 flex items-center gap-2 bg-brand-bg rounded-full p-1 border border-brand-border shadow-3d-inset w-fit">
          <a
            href="/prayers"
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              lang === "id"
                ? "bg-brand-gold text-brand-dark shadow-glow-gold"
                : "text-brand-muted hover:text-white"
            }`}
          >
            🇮🇩 Indonesia
          </a>
          <a
            href="/prayers?lang=en"
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              lang === "en"
                ? "bg-brand-gold text-brand-dark shadow-glow-gold"
                : "text-brand-muted hover:text-white"
            }`}
          >
            🇬🇧 English
          </a>
        </div>

        {/* Prayer List with Filter + Search */}
        <PrayerList prayers={prayers} lang={lang} />
      </main>

      <Footer />
    </div>
  );
}

