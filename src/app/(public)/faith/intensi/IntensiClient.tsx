"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HandHeart, Check, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#D6B072";
const serif = { fontFamily: "'Lora', Georgia, serif" };

type Intention = { id: string; body: string; who: string | null; mine: boolean; is_answered: boolean; prayed_count: number; i_prayed: boolean; created_at: string };

function ago(iso: string, isId: boolean) {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return isId ? `${m} mnt lalu` : `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return isId ? `${h} jam lalu` : `${h}h ago`;
  const d = Math.round(h / 24);
  return isId ? `${d} hari lalu` : `${d}d ago`;
}

export default function IntensiClient({ isId, signedIn }: { isId: boolean; signedIn: boolean }) {
  const supabase = createClient();
  const [items, setItems] = useState<Intention[] | null>(null);
  const [body, setBody] = useState("");
  const [anon, setAnon] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.rpc("list_intentions" as any, { p_limit: 50 } as any);
    setItems(((data as unknown) as Intention[]) ?? []);
  }, [supabase]);

  useEffect(() => { if (signedIn) load(); }, [signedIn, load]);

  async function post() {
    setBusy(true);
    setErr(null);
    const { error } = await supabase.rpc("add_intention" as any, { p_body: body, p_anonymous: anon } as any);
    setBusy(false);
    if (error) {
      setErr(error.message.includes("daily limit") ? (isId ? "Maksimal 3 intensi per hari." : "Maximum 3 intentions per day.") : error.message);
      return;
    }
    setBody("");
    load();
  }

  async function pray(it: Intention) {
    if (it.i_prayed) return;
    setItems((cur) => cur?.map((x) => (x.id === it.id ? { ...x, i_prayed: true, prayed_count: x.prayed_count + 1 } : x)) ?? cur);
    const { error } = await supabase.rpc("pray_for_intention" as any, { p_id: it.id } as any);
    // Tell the author (the server decides if and when it is worth a notification)
    if (!error) fetch("/api/push/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "intention_prayed", id: it.id }) }).catch(() => {});
  }

  async function answered(it: Intention) {
    setItems((cur) => cur?.map((x) => (x.id === it.id ? { ...x, is_answered: true } : x)) ?? cur);
    await supabase.rpc("answer_intention" as any, { p_id: it.id } as any);
  }

  async function remove(it: Intention) {
    if (!confirm(isId ? "Hapus intensi ini?" : "Delete this intention?")) return;
    setItems((cur) => cur?.filter((x) => x.id !== it.id) ?? cur);
    await supabase.rpc("delete_intention" as any, { p_id: it.id } as any);
  }

  if (!signedIn) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-brand-muted">{isId ? "Masuk dulu untuk berbagi dan mendoakan intensi." : "Sign in to share and pray for intentions."}</p>
        <Link href="/login" className="mt-3 inline-block rounded-xl bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-dark">{isId ? "Masuk" : "Sign in"}</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-bold text-white" style={serif}>{isId ? "Intensi Doa" : "Prayer Intentions"}</h1>
        <p className="mt-1 text-sm text-brand-muted">{isId ? "Titipkan intensimu. Saudara-saudari seiman akan mendoakannya." : "Share your intention. Your brothers and sisters will pray for it."}</p>
      </div>

      <div className="rounded-2xl border bg-[#14171c] p-4" style={{ borderColor: `${GOLD}33` }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 300))}
          rows={3}
          placeholder={isId ? "Mohon doakan…" : "Please pray for…"}
          className="w-full resize-none rounded-lg border border-[#333] bg-[#0f1115] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-brand-gold focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-brand-muted">
            <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} className="accent-[#D6B072]" />
            {isId ? "Tanpa nama" : "Anonymous"}
          </label>
          <span className="text-[11px] text-brand-muted">{body.length}/300</span>
        </div>
        {err && <p className="mt-2 text-xs text-red-300">{err}</p>}
        <button onClick={post} disabled={busy || body.trim().length < 3} className="mt-3 w-full rounded-xl bg-brand-gold py-2.5 text-sm font-bold text-brand-dark disabled:opacity-50">
          {busy ? (isId ? "Mengirim…" : "Sending…") : isId ? "Titipkan intensi" : "Share intention"}
        </button>
      </div>

      {items === null ? (
        <p className="text-center text-sm text-brand-muted">{isId ? "Memuat…" : "Loading…"}</p>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-brand-muted">{isId ? "Belum ada intensi. Jadilah yang pertama." : "No intentions yet. Be the first."}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.id} className="rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4">
              <p className="text-[15px] leading-relaxed text-white" style={serif}>{it.body}</p>
              <p className="mt-1.5 text-[11px] text-brand-muted">
                {it.who ?? (isId ? "Tanpa nama" : "Anonymous")} · {ago(it.created_at, isId)}
                {it.is_answered && <span className="ml-2 font-semibold text-emerald-400">{isId ? "Terkabul 🙏" : "Answered 🙏"}</span>}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => pray(it)}
                  disabled={it.i_prayed}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${it.i_prayed ? "bg-brand-gold/15 text-brand-gold" : "bg-brand-gold text-brand-dark active:scale-95"}`}
                >
                  <HandHeart className="h-4 w-4" />
                  {it.i_prayed ? (isId ? "Kamu mendoakan" : "You prayed") : isId ? "Aku mendoakan" : "I prayed"}
                  <span className="opacity-70">· {it.prayed_count}</span>
                </button>
                <span className="flex-1" />
                {it.mine && !it.is_answered && (
                  <button onClick={() => answered(it)} aria-label={isId ? "Tandai terkabul" : "Mark answered"} className="rounded-full p-2 text-emerald-400 hover:bg-white/5"><Check className="h-4 w-4" /></button>
                )}
                {it.mine && (
                  <button onClick={() => remove(it)} aria-label={isId ? "Hapus" : "Delete"} className="rounded-full p-2 text-gray-500 hover:bg-white/5 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
