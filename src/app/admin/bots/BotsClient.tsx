"use client";

import { useState } from "react";

export default function BotsClient({ ready }: { ready: number }) {
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<string[]>([]);

  async function run(action: "setup" | "post") {
    setBusy(true);
    setOut([]);
    try {
      const res = await fetch("/api/admin/bots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, count: 20 }) });
      const j = await res.json();
      setOut(j.log ?? [j.error ?? (j.posted ? "Satu pikiran bot sudah diposting." : `Tidak diposting: ${j.reason ?? "?"}`)]);
    } catch {
      setOut(["Gagal menghubungi server."]);
    }
    setBusy(false);
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold text-white">Bot komunitas</h1>
      <p className="text-sm text-brand-muted">
        Bot menulis pikiran singkat setiap hari (sekitar pukul 07.00, 12.00, dan 18.00) supaya komunitas terasa hidup. Mereka selalu diberi label
        &quot;Bot&quot; dan tidak masuk papan peringkat, saran teman, atau jumlah anggota. Saat ini ada <b className="text-white">{ready}</b> bot siap.
      </p>
      <div className="flex flex-wrap gap-3">
        <button onClick={() => run("setup")} disabled={busy} className="rounded-xl bg-brand-gold px-5 py-3 text-sm font-bold text-brand-dark disabled:opacity-60">Siapkan bot (akun lama dan 20 baru)</button>
        <button onClick={() => run("post")} disabled={busy} className="rounded-xl border border-brand-gold/50 px-5 py-3 text-sm font-semibold text-brand-gold disabled:opacity-60">Posting satu sekarang</button>
      </div>
      {busy && <p className="text-sm text-brand-muted">Bekerja… ini bisa sampai satu menit.</p>}
      {out.length > 0 && <ul className="space-y-1 rounded-xl bg-white/5 p-3 text-xs text-brand-light">{out.map((l, i) => <li key={i}>{l}</li>)}</ul>}
    </div>
  );
}
