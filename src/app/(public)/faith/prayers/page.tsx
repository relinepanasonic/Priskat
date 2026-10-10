import { createClient } from "@/lib/supabase/server";
import PrayerList from "@/components/prayers/PrayerList";
import { getLanguage } from "@/lib/lang";
import type { Prayer } from "@/lib/types/database.types";
import type { Metadata } from "next";
import PrayerPortals from "@/components/prayers/PrayerPortals";

export const metadata: Metadata = { title: "Doa | Prayers" };
export const revalidate = 600;

export default async function PrayerPage() {
  const lang = await getLanguage();
  const supabase = await createClient();

  const { data: prayersData } = await supabase
    .from("prayers" as any)
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const prayers = (prayersData ?? []) as unknown as Prayer[];

  return (
    <main className="w-full h-full p-4 md:p-6 pb-32">
      <h1 className="text-3xl font-bold text-white mb-6">
        🙏 {lang === "id" ? "Doa" : "Prayers"}
      </h1>

      <PrayerPortals lang={lang} />

      <PrayerList prayers={prayers} lang={lang} />
    </main>
  );
}
