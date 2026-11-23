"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Share the event: to your Ruang Iman Beranda (your friends and the community see it) and to WhatsApp. */
export default function EventShare({ text }: { text: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; login?: boolean } | null>(null);

  async function toRuangIman() {
    setBusy(true); setMsg(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setMsg({ ok: false, text: "Masuk ke Ruang Iman dulu untuk membagikan.", login: true }); return; }
      const { error } = await supabase.from("community_posts").insert({ author_id: user.id, content: text });
      setMsg(error ? { ok: false, text: "Belum bisa dibagikan. Coba lagi." } : { ok: true, text: "Dibagikan ke Beranda-mu di Ruang Iman." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-2.5 w-full max-w-md space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => void toRuangIman()} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-brand-gold/50 py-2.5 text-sm font-semibold text-brand-gold hover:bg-brand-gold/10 disabled:opacity-60">
          <Send className="h-4 w-4" /> {busy ? "Membagikan..." : "Ruang Iman"}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
      {msg && (
        <p className={`rounded-lg px-3 py-2 text-center text-xs ${msg.ok ? "bg-emerald-500/15 text-emerald-300" : "bg-black/50 text-amber-200"}`}>
          {msg.text} {msg.login && <Link href="/login" className="font-bold text-brand-gold underline">Masuk</Link>}
        </p>
      )}
    </div>
  );
}
