"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Loader2, Search, SearchX, X } from "lucide-react";
import { OLD_TESTAMENT, NEW_TESTAMENT, DEUTEROCANONICA, type BibleBook } from "@/lib/bibleBooks";

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };
const RECENT_KEY = "bible-recent-searches";

const ALL_BOOKS: BibleBook[] = [...OLD_TESTAMENT, ...DEUTEROCANONICA, ...NEW_TESTAMENT].sort((a, b) => a.no - b.no);
const BOOK_BY_NO = new Map(ALL_BOOKS.map((b) => [b.no, b]));
// Canonical reading order used by the distribution strip: OT, deuterocanonicals, NT
const CANON = [...OLD_TESTAMENT, ...DEUTEROCANONICA, ...NEW_TESTAMENT];

type Group = "all" | "ot" | "dc" | "nt";
const groupOf = (no: number): Exclude<Group, "all"> => (no >= 67 ? "dc" : no >= 40 ? "nt" : "ot");
const GROUP_COLOR = { ot: "#D6B072", dc: "#8b5cf6", nt: "#5BA4FF" } as const;

type BookHit = { book_no: number; book_name: string; verses: number; occurrences: number };
type Summary = { total: { occurrences: number; verses: number; books: number }; books: BookHit[]; approximate?: boolean };
type VerseHit = { chapter: number; verse: number; content: string };

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function matcher(q: string, whole: boolean) {
  const body = q.trim().split(/\s+/).map(escapeRe).join("\\s+");
  return new RegExp(whole ? `(?<![\\p{L}\\p{N}])(${body})(?![\\p{L}\\p{N}])` : `(${body})`, "giu");
}

/** Verse text with every match highlighted. */
function Highlighted({ text, re }: { text: string; re: RegExp }) {
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded px-0.5 font-semibold text-[#121417]" style={{ background: GOLD }}>{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export default function BibleSearchClient({
  initialQuery, initialVersion, initialWhole, isId,
}: { initialQuery: string; initialVersion: string; initialWhole: boolean; isId: boolean }) {
  const router = useRouter();
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [version, setVersion] = useState(initialVersion);
  const [whole, setWhole] = useState(initialWhole);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [group, setGroup] = useState<Group>("all");
  const [sort, setSort] = useState<"canon" | "count">("canon");
  const [open, setOpen] = useState<number | null>(null);
  const [verses, setVerses] = useState<Record<number, { items: VerseHit[]; hasMore: boolean; loading: boolean }>>({});
  const [recent, setRecent] = useState<string[]>([]);
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const label = (b: BookHit) => {
    const meta = BOOK_BY_NO.get(b.book_no);
    return meta ? (isId ? meta.name : meta.name_en) : b.book_name;
  };
  const re = useMemo(() => matcher(query, whole), [query, whole]);

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")); } catch { /* ignore */ }
  }, []);

  // Run the search whenever the query, version or whole-word option changes
  useEffect(() => {
    if (query.trim().length < 2) { setSummary(null); return; }
    const ctrl = new AbortController();
    setLoading(true);
    setError("");
    setOpen(null);
    setVerses({});
    const params = new URLSearchParams({ q: query, v: version, whole: whole ? "1" : "0" });
    fetch(`/api/bible/search?${params}`, { signal: ctrl.signal })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Gagal mencari.");
        setSummary(json);
        try {
          const next = [query, ...JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]").filter((x: string) => x.toLowerCase() !== query.toLowerCase())].slice(0, 8);
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
          setRecent(next);
        } catch { /* ignore */ }
      })
      .catch((e) => { if (e.name !== "AbortError") setError(e.message); })
      .finally(() => setLoading(false));
    router.replace(`/faith/bible/search?${params}`, { scroll: false });
    return () => ctrl.abort();
  }, [query, version, whole, router]);

  const loadVerses = useCallback(async (bookNo: number, offset = 0) => {
    setVerses((v) => ({ ...v, [bookNo]: { items: v[bookNo]?.items ?? [], hasMore: v[bookNo]?.hasMore ?? false, loading: true } }));
    const params = new URLSearchParams({ q: query, v: version, whole: whole ? "1" : "0", book: String(bookNo), offset: String(offset) });
    try {
      const r = await fetch(`/api/bible/search?${params}`);
      const json = await r.json();
      setVerses((v) => ({
        ...v,
        [bookNo]: { items: [...(offset ? v[bookNo]?.items ?? [] : []), ...(json.verses ?? [])], hasMore: !!json.hasMore, loading: false },
      }));
    } catch {
      setVerses((v) => ({ ...v, [bookNo]: { items: v[bookNo]?.items ?? [], hasMore: false, loading: false } }));
    }
  }, [query, version, whole]);

  const toggleBook = (bookNo: number) => {
    if (open === bookNo) { setOpen(null); return; }
    setOpen(bookNo);
    if (!verses[bookNo]) loadVerses(bookNo);
    setTimeout(() => rowRefs.current[bookNo]?.scrollIntoView({ block: "start", behavior: "smooth" }), 60);
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = input.trim();
    if (q.length >= 2) setQuery(q);
  };

  const books = summary?.books ?? [];
  const counts = useMemo(() => {
    const c = { all: 0, ot: 0, dc: 0, nt: 0 };
    for (const b of books) { c.all += b.occurrences; c[groupOf(b.book_no)] += b.occurrences; }
    return c;
  }, [books]);
  const shown = useMemo(() => {
    const list = books.filter((b) => group === "all" || groupOf(b.book_no) === group);
    return sort === "count" ? [...list].sort((a, b) => b.occurrences - a.occurrences) : list;
  }, [books, group, sort]);
  const maxOcc = Math.max(1, ...books.map((b) => b.occurrences));
  const hitByNo = useMemo(() => new Map(books.map((b) => [b.book_no, b])), [books]);
  const dcMissing = version === "TB"; // TB in the database has no deuterocanonical books yet
  const nf = (n: number) => n.toLocaleString(isId ? "id-ID" : "en-US");

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <Link href="/faith/bible" aria-label={isId ? "Kembali ke Alkitab" : "Back to Bible"} className="rounded-full p-2 text-brand-muted hover:bg-white/5 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <form onSubmit={submit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isId ? "Cari kata atau frasa, mis. kasih karunia" : "Search a word or phrase, e.g. grace"}
            enterKeyHint="search"
            autoFocus={!initialQuery}
            className="w-full rounded-2xl border border-[#333] bg-[#111] py-3 pl-10 pr-10 text-sm text-white placeholder-brand-muted focus:border-[#D6B072]/60 focus:outline-none"
          />
          {input && (
            <button type="button" onClick={() => setInput("")} aria-label="Hapus" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-brand-muted hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setWhole((w) => !w)}
          className="rounded-full border px-3 py-1.5 font-semibold transition-colors"
          style={whole ? { borderColor: GOLD, color: GOLD, background: `${GOLD}14` } : { borderColor: "#333", color: "#9CA3AF" }}
        >
          {isId ? "Kata utuh" : "Whole word"}
        </button>
        <select
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="rounded-full border border-[#333] bg-[#111] px-3 py-1.5 font-semibold text-brand-gold focus:outline-none"
        >
          <option value="TB">TB (Indonesia)</option>
          <option value="NRSV-CE">NRSV-CE (+ Deutero)</option>
          <option value="NKJV">NKJV</option>
          <option value="NIV">NIV</option>
        </select>
      </div>

      {/* Empty: recent searches */}
      {!query && recent.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-brand-muted">{isId ? "Pencarian terakhir" : "Recent"}</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button key={r} onClick={() => { setInput(r); setQuery(r); }} className="rounded-full border border-[#333] px-3 py-1.5 text-sm text-[#EAE5D9] hover:border-[#D6B072]/60">{r}</button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      {loading && (
        <div className="space-y-3" aria-busy="true">
          <div className="h-28 animate-pulse rounded-3xl bg-white/5" />
          <div className="h-10 animate-pulse rounded-2xl bg-white/5" />
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/5" />)}
        </div>
      )}

      {!loading && summary && query && (
        <>
          {/* Headline */}
          <section className="rounded-3xl p-5" style={{ background: "linear-gradient(160deg, #1f2a44, #14171d 70%)", border: `1px solid ${GOLD}33` }}>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">&ldquo;{query}&rdquo;</p>
            {summary.total.occurrences > 0 ? (
              <>
                <p className="mt-1 text-white" style={serif}>
                  <span className="text-4xl font-semibold" style={{ color: GOLD }}>{nf(summary.total.occurrences)}</span>
                  <span className="ml-2 text-lg">{isId ? "kali muncul" : "times"}</span>
                </p>
                <p className="mt-1 text-sm text-[#EAE5D9]/80">
                  {isId
                    ? `dalam ${nf(summary.total.verses)} ayat di ${summary.total.books} kitab`
                    : `in ${nf(summary.total.verses)} verses across ${summary.total.books} books`}
                  {summary.approximate ? (isId ? " (perkiraan)" : " (approx.)") : ""}
                </p>

                {/* Distribution across the whole Bible: one bar per book, tap to jump */}
                <div className="mt-4 flex h-12 items-end gap-[2px]" role="img" aria-label={isId ? "Sebaran di seluruh Alkitab" : "Spread across the Bible"}>
                  {CANON.map((b) => {
                    const hit = hitByNo.get(b.no);
                    const h = hit ? Math.max(12, (hit.occurrences / maxOcc) * 100) : 4;
                    return (
                      <button
                        key={b.no}
                        title={`${isId ? b.name : b.name_en}${hit ? ` · ${hit.occurrences}×` : ""}`}
                        disabled={!hit}
                        onClick={() => { setGroup("all"); toggleBook(b.no); }}
                        className="min-w-0 flex-1 rounded-t-sm transition-opacity hover:opacity-80 disabled:cursor-default"
                        style={{ height: `${h}%`, background: hit ? GROUP_COLOR[groupOf(b.no)] : "rgba(255,255,255,0.08)" }}
                      />
                    );
                  })}
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wider text-brand-muted">
                  <span>{isId ? "Kejadian" : "Genesis"}</span>
                  <span>{isId ? "Wahyu" : "Revelation"}</span>
                </div>
              </>
            ) : (
              <div className="mt-3 flex items-start gap-3">
                <SearchX className="mt-0.5 h-5 w-5 shrink-0 text-brand-muted" />
                <div className="text-sm text-[#EAE5D9]/80">
                  <p>{isId ? "Tidak ditemukan." : "No matches."}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {whole && (
                      <button onClick={() => setWhole(false)} className="rounded-full border border-[#333] px-3 py-1 text-xs text-brand-gold">
                        {isId ? "Cari juga di dalam kata" : "Include partial words"}
                      </button>
                    )}
                    {version === "TB" && (
                      <button onClick={() => setVersion("NRSV-CE")} className="rounded-full border border-[#333] px-3 py-1 text-xs text-brand-gold">
                        {isId ? "Cari dalam bahasa Inggris (NRSV-CE)" : "Search the English NRSV-CE"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {summary.total.occurrences > 0 && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1 rounded-full bg-white/5 p-1 text-xs">
                  {([
                    ["all", isId ? "Semua" : "All"],
                    ["ot", isId ? "P. Lama" : "Old T."],
                    ["dc", isId ? "Deutero" : "Deutero"],
                    ["nt", isId ? "P. Baru" : "New T."],
                  ] as [Group, string][]).map(([g, l]) => (
                    <button
                      key={g}
                      onClick={() => setGroup(g)}
                      className="rounded-full px-3 py-1.5 font-semibold transition-colors"
                      style={group === g ? { background: GOLD, color: "#121417" } : { color: "#9CA3AF" }}
                    >
                      {l} <span className="opacity-70">{nf(counts[g])}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setSort((s) => (s === "canon" ? "count" : "canon"))} className="text-xs text-brand-muted hover:text-white">
                  {sort === "canon" ? (isId ? "Urutan: Alkitab ↓" : "Order: Bible ↓") : (isId ? "Urutan: Terbanyak ↓" : "Order: Most ↓")}
                </button>
              </div>

              {group === "dc" && dcMissing && (
                <p className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 text-xs text-violet-200">
                  {isId ? "Kitab Deuterokanonika belum tersedia dalam TB. " : "Deuterocanonical books aren't in TB yet. "}
                  <button onClick={() => setVersion("NRSV-CE")} className="font-semibold underline">
                    {isId ? "Cari di NRSV-CE" : "Search NRSV-CE"}
                  </button>
                </p>
              )}

              {/* Books */}
              <div className="space-y-2">
                {shown.length === 0 && <p className="py-6 text-center text-sm text-brand-muted">{isId ? "Tidak ada di bagian ini." : "None in this section."}</p>}
                {shown.map((b) => {
                  const isOpen = open === b.book_no;
                  const v = verses[b.book_no];
                  const color = GROUP_COLOR[groupOf(b.book_no)];
                  return (
                    <div key={b.book_no} ref={(el) => { rowRefs.current[b.book_no] = el; }} className="scroll-mt-24 overflow-hidden rounded-2xl border bg-[#14171d]" style={{ borderColor: isOpen ? `${GOLD}66` : "#2a2d35" }}>
                      <button onClick={() => toggleBook(b.book_no)} aria-expanded={isOpen} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate font-semibold text-white" style={serif}>{label(b)}</span>
                            <span className="shrink-0 text-sm font-bold" style={{ color }}>{nf(b.occurrences)}×</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                            <div className="h-full rounded-full" style={{ width: `${(b.occurrences / maxOcc) * 100}%`, background: color }} />
                          </div>
                          <div className="mt-1 text-[11px] text-brand-muted">{nf(b.verses)} {isId ? "ayat" : "verses"}</div>
                        </div>
                        <ChevronDown className={`h-4 w-4 shrink-0 text-brand-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isOpen && (
                        <div className="border-t border-white/5 px-2 pb-2">
                          {v?.items.map((x) => (
                            <Link
                              key={`${x.chapter}:${x.verse}`}
                              href={`/faith/bible/${b.book_no}/${x.chapter}?ayat=${x.verse}${version !== "TB" ? `&version=${version}` : ""}`}
                              className="block rounded-xl px-3 py-2.5 text-sm leading-relaxed text-[#EAE5D9]/90 hover:bg-white/5"
                            >
                              <span className="mr-2 text-xs font-bold" style={{ color }}>{BOOK_BY_NO.get(b.book_no)?.abbr ?? ""} {x.chapter}:{x.verse}</span>
                              <Highlighted text={x.content} re={re} />
                            </Link>
                          ))}
                          {v?.loading && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-brand-gold" /></div>}
                          {v && !v.loading && v.hasMore && (
                            <button onClick={() => loadVerses(b.book_no, v.items.length)} className="w-full rounded-xl py-2.5 text-sm font-semibold text-brand-gold hover:bg-white/5">
                              {isId ? "Muat lebih banyak" : "Load more"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
