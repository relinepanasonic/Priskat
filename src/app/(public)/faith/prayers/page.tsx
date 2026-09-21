import { createClient } from "@/lib/supabase/server";
import PrayerList from "@/components/prayers/PrayerList";
import { getLanguage } from "@/lib/lang";
import type { Prayer } from "@/lib/types/database.types";
import type { Metadata } from "next";
import { LifeBuoy } from "lucide-react";
import Link from "next/link";

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

      {/* 3 Major Sub-page Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Link
          href="/faith/prayers/sos"
          className="flex flex-col items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 p-4 rounded-2xl font-bold text-sm hover:bg-red-500/20 hover:text-red-300 transition-all group text-center"
        >
          <LifeBuoy className="h-7 w-7 group-hover:scale-110 transition-transform" />
          <span className="leading-tight">SOS Doa</span>
        </Link>

        <Link
          href="/faith/prayers/rosario"
          className="flex flex-col items-center justify-center gap-2 bg-purple-500/10 text-purple-300 border border-purple-500/30 p-4 rounded-2xl font-bold text-sm hover:bg-purple-500/20 transition-all group text-center"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform inline-block">📿</span>
          <span className="leading-tight">Rosario</span>
        </Link>

        <Link
          href="/faith/prayers/jalan-salib"
          className="flex flex-col items-center justify-center gap-2 bg-amber-500/10 text-amber-300 border border-amber-500/30 p-4 rounded-2xl font-bold text-sm hover:bg-amber-500/20 transition-all group text-center"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform inline-block">✝️</span>
          <span className="leading-tight">{lang === "id" ? "Jalan Salib" : "Via Crucis"}</span>
        </Link>
      </div>

      <PrayerList prayers={prayers} lang={lang} />
    </main>
  );
}
