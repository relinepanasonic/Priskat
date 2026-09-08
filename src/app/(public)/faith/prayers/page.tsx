import { createClient } from "@/lib/supabase/server";
import PrayerList from "@/components/prayers/PrayerList";
import { getLanguage } from "@/lib/lang";
import type { Prayer } from "@/lib/types/database.types";
import type { Metadata } from "next";
import { LifeBuoy } from "lucide-react";

export const metadata: Metadata = { title: "Doa | Prayers" };
// Prayers don't change often - revalidate every 10 minutes
export const revalidate = 600;

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

  const waUrl = `https://wa.me/62818868885?text=${encodeURIComponent("Saya butuh didoakan ")}`;

  return (
    <main className="w-full h-full p-4 md:p-6 pb-32">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {lang === "id" ? "🙏 Doa" : "🙏 Prayers"}
            </h1>
            <p className="text-brand-muted text-sm">
              {lang === "id"
                ? "Kumpulan doa Katolik untuk kehidupan sehari-hari"
                : "Catholic prayers for everyday life"}
            </p>
          </div>
          
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-500/20 hover:text-red-300 transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] group w-fit"
          >
            <LifeBuoy className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {lang === "id" ? "SOS Doa" : "Need Prayer SOS?"}
          </a>
        </div>

        {/* Prayer List with Filter + Search */}
        <PrayerList prayers={prayers} lang={lang} />
    </main>
  );
}

