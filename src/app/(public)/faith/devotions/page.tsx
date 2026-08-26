import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import { Sunrise, Calendar, BookOpen } from "lucide-react";
import type { DailyDevotion } from "@/lib/types/database.types";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Daily Devotions - Priskat",
  description: "Read the daily devotions",
};

export default async function DevotionsPage() {
  const supabase = await createClient();
  const lang = await getLanguage();

  const today = new Date().toISOString().split('T')[0];

  const { data: devotionsData, error } = await supabase
    .from("daily_devotions")
    .select("*")
    .lte("publish_date", today)
    .order("publish_date", { ascending: false });

  const devotions = (devotionsData ?? []) as DailyDevotion[];

  return (
    <div className="w-full h-full p-4 md:p-6 bg-brand-surface">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Sunrise className="text-brand-gold h-6 w-6" />
          {lang === "id" ? "Renungan Harian" : "Daily Devotions"}
        </h1>
        <p className="text-brand-muted text-sm">
          {lang === "id"
            ? "Renungan harian untuk menguatkan imanmu."
            : "Daily reflections to strengthen your faith."}
        </p>
      </div>

      <div className="space-y-6">
        {devotions.length === 0 ? (
          <div className="text-center py-12 border border-[#333] border-dashed rounded-xl">
            <p className="text-brand-muted">
              {lang === "id" ? "Belum ada renungan." : "No devotions yet."}
            </p>
          </div>
        ) : (
          devotions.map((devotion) => (
            <article key={devotion.id} className="bg-[#111] border border-[#333] rounded-xl p-5 shadow-3d relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              
              <div className="flex items-center text-xs font-semibold text-brand-gold mb-3 gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(devotion.publish_date)}</span>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-brand-muted" />
                  <h3 className="text-white font-bold text-lg">{devotion.verse_reference}</h3>
                </div>
                <blockquote className="border-l-2 border-brand-gold/50 pl-3 italic text-gray-300 text-sm py-1 bg-white/5 rounded-r-md">
                  "{devotion.verse_text}"
                </blockquote>
              </div>
              
              <div className="space-y-2 mt-4 pt-4 border-t border-[#333]">
                <h4 className="text-brand-gold font-semibold text-sm">{devotion.prayer_title}</h4>
                <p className="text-brand-light text-sm leading-relaxed whitespace-pre-wrap">
                  {devotion.prayer_text}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
