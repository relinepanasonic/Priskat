import Link from "next/link";
import { Book, Heart, Sunrise, LifeBuoy, CircleDot, Cross, Church, CalendarCheck, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import { getTodayReadings } from "@/lib/bacaanHarian";
import VerseOfDayCard from "@/components/faith/VerseOfDayCard";

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

  const gospel = today?.readings.find((r) => r.label === "Injil");

  const shortcuts = [
    { href: "/faith/bible", title: isId ? "Alkitab" : "Bible", text: isId ? "Baca, cari, dan dengarkan" : "Read, search and listen", icon: Book },
    { href: "/faith/prayers", title: isId ? "Doa" : "Prayers", text: isId ? "Doa harian dan doa dasar" : "Daily and basic prayers", icon: Heart },
    { href: "/faith/devotions", title: isId ? "Renungan" : "Devotion", text: isId ? "Rencana renungan harian" : "Daily devotion plans", icon: Sunrise },
    { href: "/faith/prayers/sos", title: "SOS Doa", text: isId ? "Doa saat butuh segera" : "Prayers for urgent moments", icon: LifeBuoy },
    { href: "/faith/prayers/rosario", title: isId ? "Rosario" : "Rosary", text: isId ? "Doa rosario 3D" : "Guided rosary", icon: CircleDot },
    { href: "/faith/prayers/jalan-salib", title: isId ? "Jalan Salib" : "Stations", text: isId ? "14 perhentian" : "14 stations", icon: Cross },
    { href: "/faith/prayers/ekaristi", title: isId ? "Ekaristi" : "Eucharist", text: isId ? "Urutan & teks Misa" : "Order and texts of the Mass", icon: Church },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <VerseOfDayCard isId={isId} />

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
            {gospel && <p className="mt-1 text-white" style={serif}>{isId ? "Injil" : "Gospel"}: {gospel.display}</p>}
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

      {/* Every sub page */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-muted">{isId ? "Jelajahi" : "Explore"}</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {shortcuts.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex flex-col rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4 transition-colors hover:border-brand-gold/40 hover:bg-[#191c22] active:scale-[0.98]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: `${GOLD}1a`, color: GOLD }}>
                <s.icon className="h-[18px] w-[18px]" />
              </div>
              <span className="mt-3 font-semibold text-white">{s.title}</span>
              <span className="mt-0.5 text-xs text-brand-muted">{s.text}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
