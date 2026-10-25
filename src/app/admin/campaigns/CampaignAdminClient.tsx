"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FRAMES, NAME_COLORS } from "@/lib/gameCatalog";

type Existing = { id: string; slug: string; title: string; emoji: string; starts_on: string; ends_on: string; is_active: boolean; reward_frame: string | null; reward_title: string | null };
type Task = { kind: string; target: number; label: string };

const KINDS = [
  ["prayer", "Berdoa (doa apa saja)"], ["rosary", "Rosario"], ["bible", "Baca Alkitab"], ["devotion", "Renungan"],
  ["jalan_salib", "Jalan Salib"], ["ekaristi", "Ekaristi"], ["aramaic", "Doa Aram"], ["reading", "Bacaan Hari Ini"], ["quiz", "Kuis (target = nilai lulus)"],
];

const input = "w-full rounded-lg border border-[#333] bg-[#14171c] px-3 py-2 text-sm text-white focus:border-brand-gold focus:outline-none";
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function CampaignAdminClient({ existing }: { existing: Existing[] }) {
  const router = useRouter();
  const [f, setF] = useState({ title: "", emoji: "🎯", description: "", starts_on: "", ends_on: "", reward_frame: "", reward_name_color: "", reward_title: "", reward_points: 100 });
  const [tasks, setTasks] = useState<Task[]>([{ kind: "prayer", target: 10, label: "" }]);
  const [quiz, setQuiz] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Quiz format, one question per line:  Pertanyaan | opsi A | opsi B | opsi C | opsi D | nomor jawaban benar (1-4)
  function parseQuiz() {
    return quiz.split("\n").map((l) => l.trim()).filter(Boolean).map((line, idx) => {
      const p = line.split("|").map((x) => x.trim());
      const ans = Number(p[p.length - 1]) - 1;
      const options = p.slice(1, -1);
      if (p.length < 4 || !Number.isInteger(ans) || ans < 0 || ans >= options.length) throw new Error(`Baris kuis ${idx + 1} tidak sesuai format.`);
      return { idx, question: p[0], options, answer: ans };
    });
  }

  async function create() {
    setBusy(true);
    setMsg(null);
    try {
      if (!f.title || !f.starts_on || !f.ends_on) throw new Error("Judul dan tanggal wajib diisi.");
      const supabase = createClient();
      const slug = `${slugify(f.title)}-${f.starts_on.slice(0, 4)}`;
      const { data: user } = await supabase.auth.getUser();
      const { data: camp, error } = await supabase.from("campaigns" as any).insert({
        slug, title: f.title, emoji: f.emoji || "🎯", description: f.description || null, starts_on: f.starts_on, ends_on: f.ends_on,
        reward_frame: f.reward_frame || null, reward_name_color: f.reward_name_color || null, reward_title: f.reward_title || null,
        reward_badge: null, reward_points: Number(f.reward_points) || 0, created_by: user.user?.id,
      } as any).select("id").single();
      if (error) throw new Error(error.message);
      const id = (camp as any).id;
      const rows = tasks.filter((t) => t.label.trim()).map((t, i) => ({ campaign_id: id, kind: t.kind, target: Number(t.target) || 1, label: t.label.trim(), sort: i + 1 }));
      if (rows.length) {
        const r = await supabase.from("campaign_tasks" as any).insert(rows as any);
        if (r.error) throw new Error(r.error.message);
      }
      const qs = parseQuiz();
      if (qs.length) {
        const r = await supabase.from("campaign_quiz" as any).insert(qs.map((q) => ({ ...q, campaign_id: id })) as any);
        if (r.error) throw new Error(r.error.message);
      }
      setMsg("Kampanye dibuat.");
      setF({ title: "", emoji: "🎯", description: "", starts_on: "", ends_on: "", reward_frame: "", reward_name_color: "", reward_title: "", reward_points: 100 });
      setTasks([{ kind: "prayer", target: 10, label: "" }]);
      setQuiz("");
      router.refresh();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(c: Existing) {
    await createClient().from("campaigns" as any).update({ is_active: !c.is_active } as any).eq("id", c.id);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Kampanye</h1>
        <p className="mt-1 text-sm text-brand-muted">Buat kampanye doa dengan tugas, hadiah, dan kuis opsional. Anggota melihatnya di Beranda → Kampanye.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gold">Kampanye yang ada</h2>
        {existing.length === 0 && <p className="text-sm text-brand-muted">Belum ada.</p>}
        {existing.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-[#333] bg-[#1a1d24] p-3">
            <span className="text-2xl">{c.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{c.title}</p>
              <p className="text-xs text-brand-muted">{c.starts_on} → {c.ends_on}{c.reward_title ? ` · gelar "${c.reward_title}"` : ""}</p>
            </div>
            <button onClick={() => toggle(c)} className={`rounded-full px-3 py-1 text-xs font-bold ${c.is_active ? "bg-emerald-500/20 text-emerald-300" : "bg-gray-600/30 text-gray-400"}`}>{c.is_active ? "Aktif" : "Nonaktif"}</button>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-[#333] bg-[#1a1d24] p-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gold">Kampanye baru</h2>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-3"><label className="mb-1 block text-xs text-brand-muted">Judul</label><input className={input} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="mis. Bulan Rosario" /></div>
          <div><label className="mb-1 block text-xs text-brand-muted">Emoji</label><input className={input} value={f.emoji} onChange={(e) => setF({ ...f, emoji: e.target.value })} /></div>
        </div>
        <div><label className="mb-1 block text-xs text-brand-muted">Deskripsi</label><textarea className={input} rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="mb-1 block text-xs text-brand-muted">Mulai</label><input type="date" className={input} value={f.starts_on} onChange={(e) => setF({ ...f, starts_on: e.target.value })} /></div>
          <div><label className="mb-1 block text-xs text-brand-muted">Selesai</label><input type="date" className={input} value={f.ends_on} onChange={(e) => setF({ ...f, ends_on: e.target.value })} /></div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-brand-muted">Tugas (berapa hari melakukan sesuatu, atau lulus kuis)</label>
          <div className="space-y-2">
            {tasks.map((t, i) => (
              <div key={i} className="flex gap-2">
                <select className={`${input} w-40 shrink-0`} value={t.kind} onChange={(e) => setTasks(tasks.map((x, j) => (j === i ? { ...x, kind: e.target.value } : x)))}>
                  {KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <input type="number" min={1} className={`${input} w-20 shrink-0`} value={t.target} onChange={(e) => setTasks(tasks.map((x, j) => (j === i ? { ...x, target: Number(e.target.value) } : x)))} />
                <input className={input} placeholder="Teks tugas, mis. Berdoa Rosario 20 hari" value={t.label} onChange={(e) => setTasks(tasks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <button onClick={() => setTasks(tasks.filter((_, j) => j !== i))} aria-label="Hapus" className="rounded-lg p-2 text-gray-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setTasks([...tasks, { kind: "prayer", target: 10, label: "" }])} className="mt-2 flex items-center gap-1 text-xs font-semibold text-brand-gold"><Plus className="h-3.5 w-3.5" /> Tambah tugas</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="mb-1 block text-xs text-brand-muted">Hadiah: bingkai</label>
            <select className={input} value={f.reward_frame} onChange={(e) => setF({ ...f, reward_frame: e.target.value })}><option value="">(tidak ada)</option>{FRAMES.map((x) => <option key={x.key} value={x.key}>{x.name}</option>)}</select></div>
          <div><label className="mb-1 block text-xs text-brand-muted">Hadiah: warna nama</label>
            <select className={input} value={f.reward_name_color} onChange={(e) => setF({ ...f, reward_name_color: e.target.value })}><option value="">(tidak ada)</option>{NAME_COLORS.map((x) => <option key={x.key} value={x.key}>{x.name}</option>)}</select></div>
          <div><label className="mb-1 block text-xs text-brand-muted">Hadiah: gelar</label><input className={input} value={f.reward_title} onChange={(e) => setF({ ...f, reward_title: e.target.value })} placeholder="mis. Peziarah Rosario 2027" /></div>
          <div><label className="mb-1 block text-xs text-brand-muted">Hadiah: poin</label><input type="number" className={input} value={f.reward_points} onChange={(e) => setF({ ...f, reward_points: Number(e.target.value) })} /></div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-brand-muted">Kuis (opsional, satu pertanyaan per baris)</label>
          <textarea className={`${input} font-mono text-xs`} rows={6} value={quiz} onChange={(e) => setQuiz(e.target.value)} placeholder={"Pertanyaan | opsi 1 | opsi 2 | opsi 3 | opsi 4 | nomor jawaban benar (1-4)\nBerapa dekade dalam satu Rosario? | 3 | 4 | 5 | 6 | 3"} />
          <p className="mt-1 text-[11px] text-brand-muted">Jika ada kuis, tambahkan satu tugas jenis "Kuis" di atas dan isi targetnya dengan nilai lulus.</p>
        </div>

        {msg && <p className="rounded-lg bg-white/5 p-3 text-sm text-brand-light">{msg}</p>}
        <button onClick={create} disabled={busy} className="rounded-xl bg-brand-gold px-6 py-3 text-sm font-bold text-brand-dark disabled:opacity-60">{busy ? "Menyimpan…" : "Buat kampanye"}</button>
      </section>
    </div>
  );
}
