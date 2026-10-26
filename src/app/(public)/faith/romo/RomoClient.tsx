"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandHeart, Mic2, PlayCircle, Plus, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { youtubeId } from "@/lib/youtube";
import ActivityTimer from "@/components/home/ActivityTimer";

export type RomoPost = {
  id: string; author_id: string; kind: "doa" | "homili" | "video"; title: string; body: string | null; video_url: string | null; created_at: string;
  author: { full_name: string | null; nama_panggilan: string | null; avatar_url: string | null } | null;
};

const serif = { fontFamily: "'Lora', Georgia, serif" };
const KINDS = [
  { key: "all", label: "Semua" },
  { key: "doa", label: "Doa", icon: HandHeart },
  { key: "homili", label: "Homili", icon: Mic2 },
  { key: "video", label: "Video", icon: PlayCircle },
] as const;
const KIND_LABEL: Record<string, string> = { doa: "Doa", homili: "Homili", video: "Video" };
const input = "w-full rounded-lg border border-[#333] bg-[#14171c] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none";

export default function RomoClient({ posts, titles, canPost, userId, missing }: { posts: RomoPost[]; titles: Record<string, string>; canPost: boolean; userId: string | null; missing: boolean }) {
  const router = useRouter();
  const [kind, setKind] = useState<(typeof KINDS)[number]["key"]>("all");
  const [writing, setWriting] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const list = posts.filter((p) => kind === "all" || p.kind === kind);

  async function remove(id: string) {
    if (!confirm("Hapus tulisan ini?")) return;
    await createClient().from("romo_posts" as any).delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="p-4 md:p-6">
      <ActivityTimer kind="prayer" refId="romo" seconds={30} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-gold">Romo</p>
          <h2 className="mt-1 text-2xl font-bold text-white" style={serif}>Doa, homili, dan video dari para Romo</h2>
        </div>
        {canPost && (
          <button onClick={() => setWriting(true)} className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-gold px-3.5 py-2 text-xs font-bold text-brand-dark">
            <Plus className="h-4 w-4" /> Tulis
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1" data-noswipe>
        {KINDS.map((k) => (
          <button key={k.key} onClick={() => setKind(k.key)} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${kind === k.key ? "bg-brand-gold text-brand-dark" : "bg-[#1a1d24] text-brand-muted"}`}>{k.label}</button>
        ))}
      </div>

      {missing && <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">Bagian Romo belum aktif. Jalankan supabase/098_paroki_romo.sql.</p>}
      {!missing && list.length === 0 && (
        <p className="mt-6 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-8 text-center text-sm text-brand-muted">Belum ada tulisan. {canPost ? "Tulis doa, homili, atau bagikan video pertama." : "Para Romo akan segera berbagi di sini."}</p>
      )}

      <div className="mt-4 space-y-4">
        {list.map((p) => {
          const vid = youtubeId(p.video_url);
          const who = p.author?.nama_panggilan || p.author?.full_name || "Romo";
          const long = (p.body ?? "").length > 280;
          const expanded = open === p.id;
          return (
            <article key={p.id} className="overflow-hidden rounded-2xl border border-[#2a2d35] bg-[#14171c]">
              {vid && (
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${vid}`}
                    title={p.title}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brand-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-gold">{KIND_LABEL[p.kind]}</span>
                  <span className="text-[11px] text-brand-muted">{new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                  {userId === p.author_id && (
                    <button onClick={() => remove(p.id)} aria-label="Hapus" className="ml-auto rounded-full p-1 text-gray-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
                <h3 className="mt-2 text-lg font-bold leading-snug text-white" style={serif}>{p.title}</h3>
                <p className="mt-0.5 text-xs font-semibold text-brand-gold">{titles[p.author_id] ? `${titles[p.author_id]} ` : ""}{who}</p>
                {p.body && (
                  <>
                    <p className={`mt-3 whitespace-pre-line text-[15px] leading-[1.8] text-[#EAE5D9] ${long && !expanded ? "line-clamp-6" : ""}`} style={serif}>{p.body}</p>
                    {long && (
                      <button onClick={() => setOpen(expanded ? null : p.id)} className="mt-2 text-xs font-semibold text-brand-gold underline underline-offset-2">{expanded ? "Tutup" : "Baca selengkapnya"}</button>
                    )}
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {writing && <Composer onClose={() => setWriting(false)} onSaved={() => { setWriting(false); router.refresh(); }} />}
    </div>
  );
}

function Composer({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [kind, setKind] = useState<"doa" | "homili" | "video">("homili");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    if (!title.trim()) { setErr("Judul wajib diisi."); return; }
    if (kind === "video" && !youtubeId(url)) { setErr("Tempel tautan YouTube yang benar."); return; }
    if (kind !== "video" && !body.trim()) { setErr("Isi tulisan wajib diisi."); return; }
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("romo_posts" as any).insert({
      author_id: user?.id, kind, title: title.trim(), body: body.trim() || null, video_url: kind === "video" || url ? url.trim() || null : null,
    } as any);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 md:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-t-3xl border border-[#333] bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:rounded-3xl">
        <button onClick={onClose} aria-label="Tutup" className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
        <h3 className="text-lg font-bold text-white">Tulis untuk umat</h3>
        <div className="flex gap-2">
          {(["doa", "homili", "video"] as const).map((k) => (
            <button key={k} onClick={() => setKind(k)} className={`flex-1 rounded-full py-2 text-xs font-bold ${kind === k ? "bg-brand-gold text-brand-dark" : "bg-[#14171c] text-brand-muted"}`}>{KIND_LABEL[k]}</button>
          ))}
        </div>
        <input className={input} placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} />
        {kind !== "doa" && <input className={input} placeholder={kind === "video" ? "Tautan YouTube (wajib)" : "Tautan video YouTube (opsional)"} value={url} onChange={(e) => setUrl(e.target.value)} />}
        <textarea className={input} rows={kind === "video" ? 3 : 8} placeholder={kind === "doa" ? "Teks doa" : kind === "homili" ? "Isi homili" : "Keterangan singkat (opsional)"} value={body} onChange={(e) => setBody(e.target.value)} />
        {err && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</p>}
        <button onClick={save} disabled={busy} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60">{busy ? "Menyimpan…" : "Terbitkan"}</button>
      </div>
    </div>
  );
}
