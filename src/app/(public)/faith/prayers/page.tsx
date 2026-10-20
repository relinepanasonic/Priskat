import { createClient } from "@/lib/supabase/server";
import PrayerList, { type PrayerSummary } from "@/components/prayers/PrayerList";
import { getLanguage } from "@/lib/lang";
import type { Metadata } from "next";
import Link from "next/link";
import { Languages, ArrowRight } from "lucide-react";
import PrayerPortals from "@/components/prayers/PrayerPortals";

export const metadata: Metadata = { title: "Doa | Prayers" };
export const revalidate = 600;

export default async function PrayerPage() {
  const lang = await getLanguage();
  const supabase = await createClient();

  // Titles only — each prayer's text is loaded when it is opened, keeping this page light
  const { data: prayersData } = await supabase
    .from("prayers" as any)
    .select("id, slug, title_id, title_en, category, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const prayers = (prayersData ?? []) as unknown as PrayerSummary[];

  return (
    <main className="w-full h-full p-4 md:p-6 pb-32">
      <h1 className="text-3xl font-bold text-white mb-6">
        🙏 {lang === "id" ? "Doa" : "Prayers"}
      </h1>

      <PrayerPortals lang={lang} />

      <Link
        href="/faith/prayers/aramaic"
        className="mb-6 flex items-center gap-3 rounded-2xl border border-brand-gold/30 bg-brand-gold/5 p-4 transition-colors hover:bg-brand-gold/10"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold"><Languages className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-white">{lang === "id" ? "Doa dalam bahasa Aram" : "Prayers in Aramaic"}</span>
          <span className="block text-xs text-brand-muted">{lang === "id" ? "Tanda Salib, Bapa Kami, Salam Maria" : "Sign of the Cross, Our Father, Hail Mary"}</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-brand-muted" />
      </Link>

      <PrayerList prayers={prayers} lang={lang} />
    </main>
  );
}
