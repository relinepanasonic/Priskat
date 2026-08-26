import { createClient } from "@/lib/supabase/server";


import PrayerList from "@/components/prayers/PrayerList";
import { getLanguage } from "@/lib/lang";
import type { Prayer } from "@/lib/types/database.types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Doa | Prayers" };

export default async function PrayerPage() {
  const lang = await getLanguage();
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
    <main className="w-full h-full p-4 md:p-6">
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

        {/* Prayer List with Filter + Search */}
        <PrayerList prayers={prayers} lang={lang} />
    </main>
  );
}

