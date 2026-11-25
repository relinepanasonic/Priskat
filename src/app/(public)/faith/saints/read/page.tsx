import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getSaintStory, fetchWikiPortraits, isValidKatakombeSaintUrl, MONTH_NAMES, type SaintStory } from "@/lib/katakombe";
import { findFamousSaintByName, getFamousSaintBySlug } from "@/lib/data/famousSaints";
import SaintNovelReader from "@/components/faith/SaintNovelReader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kisah Santo & Santa" };

export default async function SaintReadPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; url?: string; name?: string; m?: string; d?: string }>;
}) {
  const sp = await searchParams;
  const month = Number(sp.m) || 0;
  const day = Number(sp.d) || 0;
  const backHref = month >= 1 && month <= 12 && day >= 1 && day <= 31 ? `/faith/saints?m=${month}&d=${day}` : "/faith/saints";
  const dateLabel = month >= 1 && month <= 12 && day >= 1 && day <= 31 ? `${day} ${MONTH_NAMES[month - 1]}` : null;

  // 1. Check curated novel-style famous saints first (by explicit slug OR matching name from daily calendar)
  const famous =
    (sp.slug ? getFamousSaintBySlug(sp.slug) : null) ??
    (sp.name ? findFamousSaintByName(sp.name) : null);

  let story: SaintStory | null = null;
  let refId = "saint";

  if (famous) {
    const portraits = await fetchWikiPortraits([famous.wikiTitle]);
    story = {
      title: famous.name,
      subtitle: famous.subtitle,
      feastDay: famous.feastDay,
      era: famous.era,
      patronOf: famous.patronOf,
      quote: famous.quote,
      image: portraits.get(famous.wikiTitle) ?? null,
      chapters: famous.chapters,
      reflection: famous.reflection,
      prayer: famous.prayer,
      sourceLabel: "Pustaka Ruang Iman",
    };
    refId = `saint:${famous.slug}`;
  } else {
    const url = sp.url ?? "";
    if (!url || !isValidKatakombeSaintUrl(url)) notFound();
    story = await getSaintStory(url, sp.name);
    refId = `saint:${url.slice(-40)}`;
  }

  if (!story) {
    return (
      <div className="w-full max-w-2xl space-y-5 p-4 pb-28 md:p-6">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Kalender Para Kudus
        </Link>
        <div className="space-y-3 rounded-2xl border border-[#333] bg-[#1a1d24] p-6 text-center">
          <p className="text-sm text-brand-muted">Maaf, riwayat santo/santa ini belum bisa dimuat di dalam aplikasi.</p>
          {sp.url && isValidKatakombeSaintUrl(sp.url) && (
            <a
              href={sp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold px-4 py-2 text-xs font-bold text-brand-dark"
            >
              Buka referensi <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return <SaintNovelReader story={story} backHref={backHref} dateLabel={dateLabel} refId={refId} />;
}
