import Link from "next/link";
import { Sunrise, CalendarCheck, ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import { getTodayReadings, jakartaParts } from "@/lib/bacaanHarian";
import { TRADISI } from "@/lib/spiritualNames";
import { getLectionary } from "@/lib/mirifica";
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

  const jp = jakartaParts();
  const lect = await getLectionary(jp.day, jp.month, jp.year);
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
        {lect ? (
          <>
            <p className="mt-2 text-sm text-brand-light">{[lect.title, ...lect.celebrations].filter(Boolean).join(" · ")}</p>
            <ul className="mt-2.5 space-y-1.5">
              {lect.items.map((r, i) => (
                <li key={i} className="flex items-baseline gap-3">
                  <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-muted">
                    {r.kind === "mazmur" ? "Mazmur" : r.kind === "bait" ? "Bait Injil" : r.kind === "injil" ? "Injil" : r.label}
                  </span>
                  <span className="text-white" style={serif}>{r.ref || r.summary}</span>
                </li>
              ))}
            </ul>
          </>
        ) : today ? (
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

      {/* Saints of the day */}
      <Link href="/faith/saints" className="flex items-center gap-3 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4 transition-colors hover:bg-[#191c22]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold"><Sparkles className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-white">{isId ? "Santo dan Santa hari ini" : "Saints of the day"}</span>
          <span className="block text-xs text-brand-muted">{isId ? "Kalender para kudus, bisa dilihat per tanggal" : "The calendar of saints, by date"}</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-brand-muted" />
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
          <PicCard tall href="/faith/hidup-doa" title={isId ? "Hidup Doa" : "Prayer Life"} text={isId ? "Doa, Renungan, Kotbah Romo" : "Prayers, Devotion, Homilies"} image="/images/spiritual/hidup-doa.webp" />
          <PicCard tall href="/faith/intensi" title={isId ? "Intensi Doa" : "Intentions"} text={isId ? "Intensi Doa dan SOS Doa" : "Prayer intentions and SOS"} image="/images/spiritual/intensi-doa.webp" />
          <PicCard tall href="/faith/devosi" title={isId ? TRADISI.id.name : TRADISI.en.name} text={isId ? TRADISI.id.text : TRADISI.en.text} image="/images/spiritual/devosi.webp" />
          <PicCard tall href="/faith/prayers/ekaristi" title={isId ? "Ekaristi" : "Eucharist"} text={isId ? "Urutan & teks Misa" : "Order and texts of the Mass"} image="/images/spiritual/ekaristi.webp" />
        </div>
      </section>
    </div>
  );
}
