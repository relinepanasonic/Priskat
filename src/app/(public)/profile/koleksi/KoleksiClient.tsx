"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ACHIEVEMENTS, CARDS, FRAMES, LADDER, NAME_COLORS } from "@/lib/gameCatalog";
import { levelFor } from "@/lib/activity";
import { FramedAvatar, NameText } from "@/components/game/Cosmetics";

type Me = { name: string; avatar: string | null; frame: string | null; color: string | null; title: string | null; onBoard: boolean };
const serif = { fontFamily: "'Lora', Georgia, serif" };
const TABS = ["Lencana", "Penampilan", "Album"] as const;

export default function KoleksiClient({ badges, items, me, points }: { badges: string[]; items: { item_type: string; item_key: string }[]; me: Me; points: number }) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Lencana");
  const [worn, setWorn] = useState({ frame: me.frame, name_color: me.color, title: me.title });
  const [onBoard, setOnBoard] = useState(me.onBoard);
  const [err, setErr] = useState<string | null>(null);

  const owned = (type: string, key: string) => items.some((i) => i.item_type === type && i.item_key === key);
  const { level, next } = levelFor(points);

  async function wear(type: "frame" | "name_color" | "title", key: string | null) {
    setErr(null);
    const { error } = await createClient().rpc("equip_item", { p_type: type, p_key: key ?? "" });
    if (error) { setErr(error.message); return; }
    setWorn((w) => ({ ...w, [type]: key }));
    router.refresh();
  }

  async function toggleBoard() {
    const v = !onBoard;
    setOnBoard(v);
    const { error } = await createClient().from("profiles").update({ show_on_leaderboard: v } as any).eq("id", (await createClient().auth.getUser()).data.user?.id ?? "");
    if (error) { setOnBoard(!v); setErr(error.message); }
  }

  const titles = items.filter((i) => i.item_type === "title").map((i) => i.item_key);
  const cards = new Set(items.filter((i) => i.item_type === "card").map((i) => i.item_key));

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 p-4 pb-32 md:p-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white"><ArrowLeft className="h-4 w-4" /> Beranda</Link>

      {/* Preview of how others see you */}
      <section className="flex items-center gap-4 rounded-2xl border border-brand-gold/30 bg-[#14171c] p-4">
        <FramedAvatar frame={worn.frame} size={64}>
          {me.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={me.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-gold/20 text-2xl font-bold text-brand-gold">{me.name[0]}</div>
          )}
        </FramedAvatar>
        <div className="min-w-0">
          <p className="truncate text-xl font-bold" style={serif}><NameText name={me.name} color={worn.name_color} /></p>
          {worn.title && <p className="text-xs font-semibold text-brand-gold">{worn.title}</p>}
          <p className="mt-0.5 text-xs text-brand-muted">{level.emoji} {level.name} · {points} poin{next ? ` · ${next.min - points} lagi ke ${next.name}` : ""}</p>
        </div>
      </section>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-full py-2 text-sm font-semibold ${tab === t ? "bg-brand-gold text-brand-dark" : "bg-[#1a1d24] text-brand-muted"}`}>{t}</button>
        ))}
      </div>
      {err && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</p>}

      {tab === "Lencana" && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Tangga Doa</h2>
            <div className="space-y-2">
              {LADDER.map((b) => {
                const got = points >= (b.min ?? 0);
                return (
                  <div key={b.key} className={`flex items-center gap-3 rounded-2xl border p-3 ${got ? "border-brand-gold/40 bg-brand-gold/10" : "border-[#2a2d35] bg-[#14171c] opacity-70"}`}>
                    <span className="text-2xl">{got ? b.emoji : "🔒"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{b.name}</p>
                      <p className="text-xs text-brand-muted">{b.desc}</p>
                    </div>
                    {got && <Check className="h-4 w-4 text-brand-gold" />}
                  </div>
                );
              })}
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Pencapaian</h2>
            <div className="grid grid-cols-2 gap-2">
              {ACHIEVEMENTS.map((b) => {
                const got = badges.includes(b.key);
                return (
                  <div key={b.key} className={`rounded-2xl border p-3 ${got ? "border-brand-gold/40 bg-[#1b1810]" : "border-[#2a2d35] bg-[#14171c] opacity-60"}`}>
                    <div className="text-2xl">{got ? b.emoji : "🔒"}</div>
                    <p className="mt-1 text-sm font-semibold text-white">{b.name}</p>
                    <p className="text-[11px] leading-snug text-brand-muted">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {tab === "Penampilan" && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Bingkai foto</h2>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => wear("frame", null)} className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-[11px] ${!worn.frame ? "border-brand-gold bg-brand-gold/10" : "border-[#2a2d35] bg-[#14171c]"} text-brand-muted`}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-lg">∅</span>Tanpa bingkai
              </button>
              {FRAMES.map((f) => {
                const has = owned("frame", f.key);
                return (
                  <button key={f.key} disabled={!has} onClick={() => wear("frame", f.key)} className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-[11px] ${worn.frame === f.key ? "border-brand-gold bg-brand-gold/10" : "border-[#2a2d35] bg-[#14171c]"} ${has ? "text-white" : "opacity-50"}`}>
                    <FramedAvatar frame={has ? f.key : null} size={44}>
                      <div className="flex h-full w-full items-center justify-center bg-white/10">{has ? "🙂" : <Lock className="h-4 w-4 text-gray-500" />}</div>
                    </FramedAvatar>
                    <span className="text-center leading-tight">{f.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Warna nama</h2>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => wear("name_color", null)} className={`rounded-2xl border p-3 text-sm text-brand-muted ${!worn.name_color ? "border-brand-gold bg-brand-gold/10" : "border-[#2a2d35] bg-[#14171c]"}`}>Biasa</button>
              {NAME_COLORS.map((c) => {
                const has = owned("name_color", c.key);
                return (
                  <button key={c.key} disabled={!has} onClick={() => wear("name_color", c.key)} className={`rounded-2xl border p-3 text-sm font-bold ${worn.name_color === c.key ? "border-brand-gold bg-brand-gold/10" : "border-[#2a2d35] bg-[#14171c]"} ${has ? "" : "opacity-40"}`}>
                    {has ? <NameText name={c.name} color={c.key} /> : <span className="flex items-center justify-center gap-1 text-gray-500"><Lock className="h-3.5 w-3.5" /> {c.name}</span>}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">Gelar</h2>
            {titles.length === 0 ? (
              <p className="rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4 text-sm text-brand-muted">Belum ada gelar. Selesaikan kampanye atau naik tangga doa.</p>
            ) : (
              <div className="space-y-2">
                <button onClick={() => wear("title", null)} className={`w-full rounded-2xl border p-3 text-left text-sm text-brand-muted ${!worn.title ? "border-brand-gold bg-brand-gold/10" : "border-[#2a2d35] bg-[#14171c]"}`}>Tanpa gelar</button>
                {titles.map((t) => (
                  <button key={t} onClick={() => wear("title", t)} className={`w-full rounded-2xl border p-3 text-left text-sm font-semibold text-brand-gold ${worn.title === t ? "border-brand-gold bg-brand-gold/10" : "border-[#2a2d35] bg-[#14171c]"}`}>{t}</button>
                ))}
              </div>
            )}
          </section>

          <section className="flex items-center justify-between gap-3 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4">
            <div>
              <p className="text-sm font-semibold text-white">Tampil di papan peringkat</p>
              <p className="text-xs text-brand-muted">Matikan jika kamu lebih suka berdoa tanpa dilihat orang lain.</p>
            </div>
            <button onClick={toggleBoard} aria-label="Tampil di papan peringkat" className={`relative h-7 w-12 shrink-0 rounded-full transition ${onBoard ? "bg-brand-gold" : "bg-gray-600"}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${onBoard ? "left-6" : "left-1"}`} />
            </button>
          </section>
        </div>
      )}

      {tab === "Album" && (
        <section>
          <p className="mb-3 text-sm text-brand-muted">{cards.size} dari {CARDS.length} kartu. Dapatkan kartu baru dari Berkat Harian.</p>
          <div className="grid grid-cols-2 gap-3">
            {CARDS.map((c) => {
              const got = cards.has(c.key);
              return (
                <div key={c.key} className={`rounded-2xl border p-3 text-center ${got ? "border-brand-gold/50 bg-gradient-to-b from-[#2a2414] to-[#15130c]" : "border-[#2a2d35] bg-[#14171c]"}`}>
                  <div className="text-4xl">{got ? c.emoji : "❔"}</div>
                  <p className={`mt-2 text-xs font-bold ${got ? "text-brand-gold" : "text-gray-600"}`} style={serif}>{got ? c.name : "???"}</p>
                  {got && <p className="mt-1 text-[11px] leading-snug text-gray-300">{c.text}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
