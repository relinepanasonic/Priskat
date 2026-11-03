import Link from "next/link";
import { Sunrise, CalendarCheck, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import { getTodayReadings } from "@/lib/bacaanHarian";
import { readingTitle } from "@/lib/readingText";
import PicCard from "@/components/faith/PicCard";
import VerseOfDayCard from "@/components/faith/VerseOfDayCard";
import { BibleChallengeCard } from "@/components/game/BibleChallenge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Spiritual" };

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

/** Landing page of the Spiritual section: a summary of every sub page. */
export default async function SpiritualLanding() {
  const lang = await getLanguage();
  const isId = lang === "id";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [today, devotion] = await Promise.all([
    getTodayReadings(),
    user
      ? supabase
          .from("user_devotion_progress")
          .select("current_day, plan:devotion_plans(title, title_id, duration_days)")
          .eq("user_id", user.id)
          .eq("is_finished", false)
          .order("started_at", { ascending: false })
          .limit(1)
          .then((r) => (r.data?.[0] as any) ?? null)
      : Promise.resolve(null),
  ]);


  return (
    <div className="space-y-6 p-4 md:p-6">
      <VerseOfDayCard isId={isId} />
      <BibleChallengeCard compact />

      {/* Today's Mass readings */}
      <Link
        href="/faith/bible/bacaan"
        className="block rounded-2xl border bg-[#14171c] p-4 transition-colors hover:bg-[#191c22]"
        style={{ borderColor: `${GOLD}33` }}
      >
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
            <CalendarCheck className="h-4 w-4" /> {isId ? "Bacaan Hari Ini" : "Today's Reading"}
          </p>
          <ArrowRight className="h-4 w-4 text-brand-muted" />
        </div>
        {today ? (
          <>
            <p className="mt-2 text-sm text-brand-light">{today.celebration}</p>
            <ul className="mt-2.5 space-y-1.5">
              {today.readings.map((r, i) => (
                <li key={i} className="flex items-baseline gap-3">
                  <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-muted">{r.label}</span>
                  <span className="text-white" style={serif}>{readingTitle(r.display, r.book)}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-brand-muted">{isId ? "Ketuk untuk melihat bacaan Misa hari ini" : "Tap to see today's Mass readings"}</p>
        )}
      </Link>

      {/* Continue the devotion */}
      {devotion && (
        <Link href="/faith/devotions" className="flex items-center gap-3 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4 transition-colors hover:bg-[#191c22]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${GOLD}1f`, color: GOLD }}>
            <Sunrise className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>{isId ? "Lanjutkan Renungan" : "Continue Devotion"}</p>
            <p className="truncate text-sm font-semibold text-white">{devotion.plan?.[isId ? "title_id" : "title"] || devotion.plan?.title}</p>
            <p className="text-xs text-brand-muted">{isId ? "Hari" : "Day"} {devotion.current_day} / {devotion.plan?.duration_days}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-brand-muted" />
        </Link>
      )}

      {/* Where to go */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-muted">{isId ? "Jelajahi" : "Explore"}</h2>
        <div className="grid grid-cols-2 gap-3">
          <PicCard tall href="/faith/bible" title={isId ? "Alkitab" : "Bible"} text={isId ? "Baca, cari, dan dengarkan" : "Read, search and listen"} image="/images/spiritual/alkitab.webp" />
          <PicCard tall href="/faith/hidup-doa" title={isId ? "Hidup Doa" : "Prayer Life"} text={isId ? "Doa, Renungan, Kotbah Romo, SOS Doa" : "Prayers, Devotion, Homilies, SOS"} image="/images/spiritual/hidup-doa.webp" />
          <PicCard tall href="/faith/devosi" title={isId ? "Devosi" : "Devotions"} text={isId ? "Rosario, Jalan Salib, Intensi Doa" : "Rosary, Stations, Intentions"} image="/images/spiritual/devosi.webp" />
          <PicCard tall href="/faith/prayers/ekaristi" title={isId ? "Ekaristi" : "Eucharist"} text={isId ? "Urutan & teks Misa" : "Order and texts of the Mass"} image="/images/spiritual/ekaristi.webp" />
        </div>
      </section>
    </div>
  );
}
