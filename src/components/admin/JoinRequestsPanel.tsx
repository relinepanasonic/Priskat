"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, X, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type JoinRequestRow = {
  id: string;
  created_at: string;
  answers: Record<string, string> | null;
  profile: { full_name: string | null; username: string | null; avatar_url: string | null } | null;
};

const LABELS: Record<string, string> = { camp: "Camp Modul 1", angkatan: "Angkatan", kota: "Kota Camp" };

/** Pending "ask to join" requests of one community: approve adds the person, reject closes it. */
export default function JoinRequestsPanel({ requests }: { requests: JoinRequestRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (requests.length === 0) return null;

  async function decide(id: string, approve: boolean) {
    setBusy(id);
    setError(null);
    const { error } = await createClient().rpc("decide_join_request", { p_request_id: id, p_approve: approve });
    setBusy(null);
    if (error) { setError(error.message); return; }
    router.refresh();
  }

  return (
    <section className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-200">
        <UserPlus className="h-4 w-4" /> Permintaan bergabung ({requests.length})
      </h3>
      {error && <p className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}

      <div className="space-y-2">
        {requests.map((r) => (
          <div key={r.id} className="flex flex-col gap-3 rounded-xl border border-[#2a2d35] bg-[#15181e] p-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {r.profile?.avatar_url ? (
                <Image src={r.profile.avatar_url} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 font-bold text-brand-gold">
                  {(r.profile?.full_name || "?")[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{r.profile?.full_name || r.profile?.username || "Anggota"}</p>
                <p className="text-xs text-brand-muted">
                  {Object.entries(r.answers ?? {})
                    .filter(([, v]) => v)
                    .map(([k, v]) => `${LABELS[k] ?? k}: ${v}`)
                    .join(" · ") || "Tanpa data tambahan"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => void decide(r.id, false)}
                disabled={busy === r.id}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#333] px-3 py-2 text-xs font-semibold text-gray-300 hover:border-red-500/50 hover:text-red-300 disabled:opacity-60 sm:flex-none"
              >
                <X className="h-3.5 w-3.5" /> Tolak
              </button>
              <button
                onClick={() => void decide(r.id, true)}
                disabled={busy === r.id}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-brand-gold px-3 py-2 text-xs font-bold text-brand-dark disabled:opacity-60 sm:flex-none"
              >
                <Check className="h-3.5 w-3.5" /> Setujui
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
