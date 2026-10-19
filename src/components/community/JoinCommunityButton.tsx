"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type JoinField = {
  key: string;
  label: string;
  type: "text" | "select";
  required?: boolean;
  options?: string[];
  placeholder?: string;
};
export type JoinableCommunity = { id: string; name: string; join_mode: "open" | "request" | "closed"; join_fields: JoinField[] | null };
export type JoinStatus = "member" | "pending" | "none";

/**
 * "Gabung" for open communities, "Ajukan bergabung" for the ones that need an admin's approval
 * (with that community's own questions, e.g. Camp / Angkatan / Kota for Catholic Family Ministry).
 */
export default function JoinCommunityButton({
  community,
  status,
  className = "",
  onDone,
}: {
  community: JoinableCommunity;
  status: JoinStatus;
  className?: string;
  onDone?: (result: "joined" | "pending") => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<JoinStatus>(status);

  if (localStatus === "member") {
    return <span className={`flex items-center gap-1 text-xs font-bold text-emerald-400 ${className}`}><Check className="h-3.5 w-3.5" /> Anggota</span>;
  }
  if (localStatus === "pending") {
    return (
      <span className={`flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-300 ${className}`}>
        <Clock className="h-3 w-3" /> Menunggu persetujuan admin
      </span>
    );
  }
  if (community.join_mode === "closed") return null;

  const fields = community.join_fields ?? [];
  const needsForm = community.join_mode === "request";

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error } = await createClient().rpc("join_community", { p_community_id: community.id, p_answers: answers });
    setBusy(false);
    if (error) { setError(error.message); return; }
    const result = data === "joined" ? "joined" : "pending";
    setLocalStatus(result === "joined" ? "member" : "pending");
    setOpen(false);
    onDone?.(result);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => (needsForm && fields.length ? setOpen(true) : void submit())}
        disabled={busy}
        className={`rounded-full bg-brand-gold px-3 py-1.5 text-xs font-bold text-brand-dark transition active:scale-95 disabled:opacity-60 ${className}`}
      >
        {busy ? "…" : needsForm ? "Ajukan bergabung" : "Gabung"}
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 md:items-center" onClick={() => setOpen(false)}>
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-t-2xl border border-[#333] bg-[#1a1d24] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white shadow-2xl md:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Gabung komunitas</p>
                <h3 className="text-lg font-bold">{community.name}</h3>
                <p className="mt-1 text-xs text-brand-muted">Isi data berikut. Permintaanmu akan ditinjau oleh admin komunitas.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Tutup" className="rounded-full p-1.5 text-gray-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>

            {fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-sm font-medium text-brand-light">{f.label}{f.required && " *"}</label>
                {f.type === "select" ? (
                  <select
                    required={f.required}
                    value={answers[f.key] ?? ""}
                    onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })}
                    className="w-full rounded-lg border border-brand-border bg-[#14171c] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none"
                  >
                    <option value="">Pilih…</option>
                    {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    required={f.required}
                    value={answers[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })}
                    className="w-full rounded-lg border border-brand-border bg-[#14171c] px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none"
                  />
                )}
              </div>
            ))}

            {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

            <button type="submit" disabled={busy} className="w-full rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark disabled:opacity-60">
              {busy ? "Mengirim…" : "Kirim permintaan"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
