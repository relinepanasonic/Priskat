import { createClient } from "@/lib/supabase/server";
import { getTodayReadings, jakartaParts } from "@/lib/bacaanHarian";
import { loadReadingVerses } from "@/lib/readingText";
import { seasonFromCelebration } from "@/lib/ekaristi";
import { OLD_TESTAMENT, NEW_TESTAMENT, DEUTEROCANONICA } from "@/lib/bibleBooks";
import EkaristiClient, { type TodayReading } from "./EkaristiClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ekaristi" };

const BOOKS = new Map([...OLD_TESTAMENT, ...NEW_TESTAMENT, ...DEUTEROCANONICA].map((b) => [b.no, b]));

export default async function EkaristiPage() {
  const supabase = await createClient();
  const today = await getTodayReadings();
  const { day, month, year } = jakartaParts();
  const dayIso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const [{ data: { user } }, { data: override }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("liturgy_texts" as any).select("mazmur_ulangan, mazmur_text, source").eq("day", dayIso).maybeSingle(),
  ]);

  let isAdmin = false;
  if (user) {
    const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    isAdmin = ["founder", "superadmin", "admin"].includes(String(me?.role ?? ""));
  }

  // The text of each reading, from our own Bible, cited right here
  const readings: TodayReading[] = await Promise.all(
    (today?.readings ?? []).map(async (r) => {
      const verses = await loadReadingVerses(supabase, r.segments);
      const meta = r.book ? BOOKS.get(r.book) : null;
      return {
        label: r.label,
        display: meta ? `${meta.name} ${r.display.replace(/^[^\d]*\s*(?=\d)/, "")}` : r.display,
        verses: verses.map((v) => ({ verse: v.verse, text: v.text })),
      };
    })
  );

  return (
    <EkaristiClient
      defaultSeason={seasonFromCelebration(today?.celebration)}
      celebration={today?.celebration ?? null}
      readings={readings}
      day={dayIso}
      mazmurOverride={(override as { mazmur_ulangan: string | null; mazmur_text: string | null; source: string | null } | null) ?? null}
      isAdmin={isAdmin}
    />
  );
}
