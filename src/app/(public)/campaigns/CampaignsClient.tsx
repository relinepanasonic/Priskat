"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Gift, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { badgeByKey, frameByKey } from "@/lib/gameCatalog";
import { localDay } from "@/lib/activity";

export type CampaignView = {
  id: string; slug: string; title: string; description: string | null; emoji: string;
  starts_on: string; ends_on: string;
  reward: { frame: string | null; name_color: string | null; title: string | null; badge: string | null; points: number };
  tasks: { id: string; label: string; kind: string; target: number; done: number }[];
  communityTotal: number;
  claimed: boolean;
};

const serif = { fontFamily: "'Lora', Georgia, serif" };
const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long" });
const today = () => localDay();

export default function CampaignsClient({ campaigns }: { campaigns: CampaignView[] }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<CampaignView | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function claim(c: CampaignView) {
    setBusy(c.id);
    setMsg(null);
    const { error } = await createClient().rpc("claim_campaign_reward", { p_campaign: c.id });
    setBusy(null);
    if (error) { setMsg(error.message); return; }
    setMsg(`Selamat! Hadiah "${c.title}" sudah masuk ke Koleksimu.`);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 p-4 pb-32 md:p-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white"><ArrowLeft className="h-4 w-4" /> Beranda</Link>
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">Kampanye</p>
        <h1 className="mt-1 text-2xl font-bold text-white" style={serif}>Doa bersama, hadiah bersama</h1>
        <p className="mt-1 text-xs text-brand-muted">Selesaikan tugas selama masa kampanye untuk mendapat bingkai, gelar, dan lencana.</p>
      </header>

      {msg && <p className="rounded-xl border border-brand-gold/40 bg-brand-gold/10 p-3 text-sm text-brand-light">{msg}</p>}
      {campaigns.length === 0 && <p className="rounded-2xl border border-[#2a2d35] bg-[#14171c] p-8 text-center text-sm text-brand-muted">Belum ada kampanye. Kampanye berikutnya segera hadir.</p>}

      {campaigns.map((c) => {
        const open = today() >= c.starts_on && today() <= c.ends_on;
        const upcoming = today() < c.starts_on;
        const allDone = c.tasks.length > 0 && c.tasks.every((t) => t.done >= t.target);
        const frame = frameByKey(c.reward.frame);
        const badge = c.reward.badge ? badgeByKey(c.reward.badge) : null;
        return (
          <section key={c.id} className="overflow-hidden rounded-3xl border border-brand-gold/30 bg-gradient-to-b from-[#1e1a2e] to-[#14171c] p-5">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{c.emoji}</span>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-white" style={serif}>{c.title}</h2>
                <p className="text-xs font-semibold text-brand-gold">{fmt(c.starts_on)} – {fmt(c.ends_on)}{upcoming ? " · segera dimulai" : !open ? " · sudah berakhir" : ""}</p>
              </div>
            </div>
            {c.description && <p className="mt-3 text-sm leading-relaxed text-gray-300">{c.description}</p>}

            <div className="mt-4 space-y-2.5">
              {c.tasks.map((t) => {
                const pct = Math.min(100, Math.round((t.done / Math.max(1, t.target)) * 100));
                return (
                  <div key={t.id}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white">{t.label}</span>
                      <span className="font-semibold text-brand-gold">{t.kind === "quiz" ? `${t.done}/10 (min. ${t.target})` : `${t.done}/${t.target}`}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/40"><div className="h-full rounded-full bg-gradient-to-r from-brand-gold to-[#f3e5ab]" style={{ width: `${pct}%` }} /></div>
                    {t.kind === "quiz" && open && !c.claimed && (
                      <button onClick={() => setQuiz(c)} className="mt-1.5 text-xs font-semibold text-brand-gold underline underline-offset-2">{t.done > 0 ? "Ulangi kuis" : "Mulai kuis"}</button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl bg-black/25 p-3 text-xs text-brand-light">
              <p className="mb-1 font-bold uppercase tracking-widest text-brand-muted">Hadiah</p>
              <p>
                {frame ? `🖼️ Bingkai ${frame.name}` : ""}{c.reward.title ? ` · 🏷️ Gelar "${c.reward.title}"` : ""}{badge ? ` · ${badge.emoji} Lencana ${badge.name}` : ""}{c.reward.points ? ` · +${c.reward.points} poin` : ""}
              </p>
            </div>

            <p className="mt-3 text-center text-[11px] text-brand-muted">Bersama kita sudah berdoa <b className="text-amber-300">{c.communityTotal}</b> kali selama kampanye ini 🙏</p>

            {c.claimed ? (
              <p className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 py-2.5 text-sm font-bold text-emerald-300"><Check className="h-4 w-4" /> Hadiah sudah diambil</p>
            ) : allDone ? (
              <button onClick={() => claim(c)} disabled={busy === c.id} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60">
                <Gift className="h-4 w-4" /> {busy === c.id ? "…" : "Ambil hadiah"}
              </button>
            ) : null}
          </section>
        );
      })}

      {quiz && <QuizDialog campaign={quiz} onClose={() => setQuiz(null)} onFinished={() => { setQuiz(null); router.refresh(); }} />}
    </div>
  );
}

type Q = { idx: number; question: string; options: string[] };

function QuizDialog({ campaign, onClose, onFinished }: { campaign: CampaignView; onClose: () => void; onFinished: () => void }) {
  const [qs, setQs] = useState<Q[] | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [i, setI] = useState(0);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await createClient().rpc("get_campaign_quiz", { p_campaign: campaign.id });
      if (error) { setErr(error.message); return; }
      setQs(((data as Q[]) ?? []).map((q) => ({ ...q, options: q.options as unknown as string[] })));
    })();
  }, [campaign.id]);

  async function pick(n: number) {
    if (!qs) return;
    const next = [...answers];
    next[i] = n;
    setAnswers(next);
    if (i < qs.length - 1) { setI(i + 1); return; }
    const { data, error } = await createClient().rpc("submit_quiz", { p_campaign: campaign.id, p_answers: next });
    if (error) { setErr(error.message); return; }
    setResult(data as { score: number; total: number });
  }

  const need = campaign.tasks.find((t) => t.kind === "quiz")?.target ?? 0;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 md:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-brand-gold/30 bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white md:rounded-3xl">
        <button onClick={onClose} aria-label="Tutup" className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">Kuis · {campaign.title}</p>
        {err && <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</p>}
        {!qs && !err && <p className="mt-6 text-sm text-brand-muted">Memuat kuis…</p>}

        {qs && !result && qs[i] && (
          <div className="mt-3">
            <p className="text-xs text-brand-muted">Pertanyaan {i + 1} dari {qs.length}</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40"><div className="h-full bg-brand-gold" style={{ width: `${((i + 1) / qs.length) * 100}%` }} /></div>
            <h3 className="mt-4 text-lg font-bold leading-snug" style={serif}>{qs[i].question}</h3>
            <div className="mt-4 space-y-2">
              {qs[i].options.map((o, n) => (
                <button key={n} onClick={() => pick(n)} className="w-full rounded-xl border border-[#333] bg-[#14171c] px-4 py-3 text-left text-sm transition hover:border-brand-gold/60 active:scale-[0.99]">{o}</button>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="py-6 text-center">
            <div className="text-5xl">{result.score >= need ? "🎉" : "📖"}</div>
            <h3 className="mt-3 text-2xl font-bold">{result.score} / {result.total}</h3>
            <p className="mt-1 text-sm text-brand-muted">{result.score >= need ? "Lulus! Tugas kuis selesai." : `Belum lulus (minimal ${need}). Kamu boleh mengulang.`}</p>
            <button onClick={onFinished} className="mt-5 w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark">Selesai</button>
          </div>
        )}
      </div>
    </div>
  );
}
