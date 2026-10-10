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

      {/* 3 Luxury Navigation Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        <Link
          href="/faith/prayers/sos"
          className="group relative flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, rgba(220,38,38,0.12), rgba(185,28,28,0.06))",
            border: "1px solid rgba(220,38,38,0.25)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 2px 12px rgba(220,38,38,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.18), rgba(185,28,28,0.08))" }} />
          <LifeBuoy className="relative h-5 w-5 text-rose-300/80 group-hover:text-rose-200 transition-colors" strokeWidth={1.5} />
          <span className="relative text-[11px] font-medium tracking-wide text-rose-300/70 group-hover:text-rose-200 leading-tight">SOS Doa</span>
        </Link>

        <Link
          href="/faith/prayers/rosario"
          className="group relative flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(139,92,246,0.06))",
            border: "1px solid rgba(168,85,247,0.25)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 2px 12px rgba(168,85,247,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(139,92,246,0.08))" }} />
          <span className="relative text-lg leading-none">📿</span>
          <span className="relative text-[11px] font-medium tracking-wide text-purple-300/70 group-hover:text-purple-200 leading-tight">Rosario</span>
        </Link>

        <Link
          href="/faith/prayers/jalan-salib"
          className="group relative flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, rgba(217,119,6,0.12), rgba(180,83,9,0.06))",
            border: "1px solid rgba(217,119,6,0.25)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 2px 12px rgba(217,119,6,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg, rgba(217,119,6,0.18), rgba(180,83,9,0.08))" }} />
          <span className="relative text-lg leading-none">✝️</span>
          <span className="relative text-[11px] font-medium tracking-wide text-amber-300/70 group-hover:text-amber-200 leading-tight">{lang === "id" ? "Jalan Salib" : "Via Crucis"}</span>
        </Link>
      </div>

      <PrayerList prayers={prayers} lang={lang} />
    </main>
  );
}
