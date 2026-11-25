import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { getSaintStory, isValidKatakombeSaintUrl, MONTH_NAMES } from "@/lib/katakombe";
import ActivityTimer from "@/components/home/ActivityTimer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Riwayat Santo & Santa" };

const serif = { fontFamily: "'Lora', Georgia, serif" };

export default async function SaintReadPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; m?: string; d?: string }>;
}) {
  const sp = await searchParams;
  const url = sp.url ?? "";
  if (!isValidKatakombeSaintUrl(url)) notFound();

  const month = Number(sp.m) || 0;
  const day = Number(sp.d) || 0;
  const backHref = month >= 1 && month <= 12 && day >= 1 && day <= 31 ? `/faith/saints?m=${month}&d=${day}` : "/faith/saints";
  const dateLabel = month >= 1 && month <= 12 && day >= 1 && day <= 31 ? `${day} ${MONTH_NAMES[month - 1]}` : null;

  const story = await getSaintStory(url);

  return (
    <div className="w-full max-w-2xl space-y-5 p-4 pb-28 md:p-6">
      <ActivityTimer kind="reading" refId={`saint:${url.slice(-40)}`} seconds={15} />

      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Kalender Para Kudus
      </Link>

      {!story ? (
        <div className="rounded-2xl border border-[#333] bg-[#1a1d24] p-6 text-center space-y-3">
          <p className="text-sm text-brand-muted">Maaf, riwayat santo/santa ini belum bisa dimuat di dalam aplikasi.</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold px-4 py-2 text-xs font-bold text-brand-dark"
          >
            Buka di katakombe.org <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : (
        <>
          {/* Hero Card */}
          <header className="card-lux overflow-hidden p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {story.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={story.image}
                  alt={story.title}
                  className="h-40 w-full rounded-2xl border border-brand-gold/30 object-cover sm:h-28 sm:w-28 sm:shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-gold">
                  <Sparkles className="h-3.5 w-3.5" />
                  Kalender Para Kudus{dateLabel ? ` · ${dateLabel}` : ""}
                </p>
                <h1 className="mt-1.5 text-2xl font-bold leading-snug text-white" style={serif}>
                  {story.title}
                </h1>
              </div>
            </div>
          </header>

          {/* Full Biography Body */}
          <article className="space-y-3.5 rounded-2xl border border-[#333] bg-[#1a1d24] p-5">
            {story.paragraphs.map((p, idx) =>
              p.heading ? (
                <h2 key={idx} className="pt-2 text-base font-bold text-brand-gold" style={serif}>
                  {p.text}
                </h2>
              ) : (
                <p key={idx} className="text-[15px] leading-[1.9] text-[#EAE5D9]" style={serif}>
                  {p.text}
                </p>
              ),
            )}
          </article>

          <p className="flex flex-wrap items-center justify-center gap-x-1 text-center text-[11px] text-brand-muted">
            Sumber: Kalender Para Kudus,{" "}
            <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-gold">
              katakombe.org <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </>
      )}
    </div>
  );
}
