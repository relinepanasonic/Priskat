import Link from "next/link";
import { ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTodayReadings } from "@/lib/bacaanHarian";
import { cleanVerse } from "@/lib/bibleText";
import { OLD_TESTAMENT, NEW_TESTAMENT, DEUTEROCANONICA } from "@/lib/bibleBooks";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bacaan Hari Ini" };

const BOOKS = new Map([...OLD_TESTAMENT, ...NEW_TESTAMENT, ...DEUTEROCANONICA].map((b) => [b.no, b]));
const serif = { fontFamily: "'Lora', Georgia, serif" };

export default async function TodayReadingPage() {
  const day = await getTodayReadings();
  const supabase = await createClient();

  // First verses of each reading, from our own Bible (TB; deuterocanonical books only exist in NRSV-CE)
  const snippets = await Promise.all(
    (day?.readings ?? []).map(async (r) => {
      if (!r.book || !r.chapter) return "";
      const { data } = await supabase
        .from("bible_verses")
        .select("content")
        .eq("translation", r.book >= 67 ? "NRSV-CE" : "TB")
        .eq("book_no", r.book)
        .eq("chapter", r.chapter)
        .gte("verse", r.from)
        .lte("verse", Math.min(r.to, r.from + 1))
        .order("verse");
      const text = ((data as { content: string }[]) ?? []).map((d) => cleanVerse(d.content)).join(" ");
      return text.length > 190 ? `${text.slice(0, 187).trimEnd()}…` : text;
    })
  );

  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

  return (
    <div className="w-full max-w-2xl space-y-5">
      <Link href="/faith/bible" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Alkitab
      </Link>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">Bacaan Hari Ini</p>
        <h1 className="mt-1 text-2xl font-bold text-white" style={serif}>{today}</h1>
        {day?.celebration && <p className="mt-1 text-sm text-brand-light">{day.celebration}</p>}
      </div>

      {!day ? (
        <div className="rounded-2xl border border-[#333] bg-[#1a1d24] p-6 text-center text-sm text-brand-muted">
          Bacaan hari ini belum bisa dimuat. Coba lagi sebentar lagi.
          <a href="https://www.imankatolik.or.id/kalender.php" target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-1.5 text-brand-gold">
            Buka kalender liturgi <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {day.readings.map((r, i) => {
            const meta = r.book ? BOOKS.get(r.book) : null;
            const inner = (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">{r.label}</p>
                  <p className="mt-0.5 font-semibold text-white">{meta ? `${meta.name} ${r.display.replace(/^[^\d]*\s*(?=\d)/, "")}` : r.display}</p>
                  {snippets[i] && <p className="mt-1.5 text-sm leading-relaxed text-gray-300" style={serif}>&ldquo;{snippets[i]}&rdquo;</p>}
                </div>
                {r.book && <ChevronRight className="h-5 w-5 shrink-0 text-brand-muted" />}
              </>
            );
            const cls = "flex items-center gap-3 rounded-2xl border border-[#333] bg-[#1a1d24] p-4 transition-colors";
            return r.book && r.chapter ? (
              <Link key={i} href={`/faith/bible/${r.book}/${r.chapter}?ayat=${r.from}`} className={`${cls} hover:border-brand-gold/50 hover:bg-[#1e2129] active:scale-[0.99]`}>{inner}</Link>
            ) : (
              <div key={i} className={cls}>{inner}</div>
            );
          })}
          <p className="pt-1 text-center text-[11px] text-brand-muted">Bacaan Misa Gereja Katolik Indonesia · sumber: imankatolik.or.id</p>
        </div>
      )}
    </div>
  );
}
