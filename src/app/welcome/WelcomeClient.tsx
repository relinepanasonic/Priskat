"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserPlus, Check, Users, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PrayerRemindersCard from "@/components/profile/PrayerRemindersCard";
import JoinCommunityButton, { type JoinableCommunity } from "@/components/community/JoinCommunityButton";

type Person = {
  id: string;
  full_name: string;
  nama_panggilan: string | null;
  avatar_url: string | null;
  kota: string | null;
  angkatan: string | null;
  community: { name: string | null } | null;
};
type Community = JoinableCommunity & {
  slug: string | null;
  logo_url: string | null;
  tagline: string | null;
  description: string | null;
  is_public: boolean;
};

const serif = { fontFamily: "'Lora', Georgia, serif" };

export default function WelcomeClient({
  me,
  suggestions,
  communities,
  myCommunityId,
  pendingIds,
}: {
  me: { id: string; name: string };
  suggestions: Person[];
  communities: Community[];
  myCommunityId: string | null;
  pendingIds: string[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<2 | 3 | 4>(suggestions.length ? 2 : 3);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set(pendingIds));
  const [finishing, setFinishing] = useState(false);

  async function addFriend(p: Person) {
    setSent((s) => new Set(s).add(p.id));
    const { error } = await createClient()
      .from("friendships")
      .insert({ requester_id: me.id, receiver_id: p.id, status: "pending" } as any);
    if (error) setSent((s) => { const n = new Set(s); n.delete(p.id); return n; });
  }

  async function finish() {
    setFinishing(true);
    await createClient().from("profiles").update({ onboarded_at: new Date().toISOString() } as any).eq("id", me.id);
    router.replace("/");
    router.refresh();
  }

  const pendingNames = communities.filter((c) => pending.has(c.id)).map((c) => c.name);

  return (
    <div className="min-h-[100dvh] bg-[#121417] px-4 pb-10 pt-8 text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-brand-gold" : "bg-white/10"}`} />
            ))}
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">Langkah {step} dari 4</p>
        </div>

        {step === 2 && (
          <section>
            <h1 className="text-2xl font-bold" style={serif}>Temukan teman{me.name ? `, ${me.name.split(" ")[0]}` : ""}</h1>
            <p className="mt-1 text-sm text-brand-muted">
              Terhubung dengan teman seiman supaya lebih mudah saling mendoakan dan berbagi. Bisa dilewati dan dilakukan nanti.
            </p>

            <div className="mt-5 space-y-2">
              {suggestions.map((p) => {
                const isSent = sent.has(p.id);
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-[#2a2d35] bg-[#1a1d24] p-3">
                    {p.avatar_url ? (
                      <Image src={p.avatar_url} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 font-bold text-brand-gold">
                        {(p.nama_panggilan || p.full_name)[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.nama_panggilan || p.full_name}</p>
                      <p className="truncate text-xs text-brand-muted">
                        {[p.community?.name, p.kota, p.angkatan].filter(Boolean).join(" · ") || "Anggota Ruang Iman"}
                      </p>
                    </div>
                    <button
                      onClick={() => void addFriend(p)}
                      disabled={isSent}
                      className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition active:scale-95 ${isSent ? "bg-white/10 text-gray-300" : "bg-brand-gold text-brand-dark"}`}
                    >
                      {isSent ? (<><Check className="h-3.5 w-3.5" /> Terkirim</>) : (<><UserPlus className="h-3.5 w-3.5" /> Tambah</>)}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 rounded-xl border border-[#333] py-3 text-sm font-semibold text-gray-300">Lewati</button>
              <button onClick={() => setStep(3)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-gold py-3 text-sm font-bold text-brand-dark">
                Lanjut <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h1 className="text-2xl font-bold" style={serif}>Gabung komunitas</h1>
            <p className="mt-1 text-sm text-brand-muted">
              Kamu sudah ada di Catholic Indonesia. Mau bergabung dengan komunitas lain? Beberapa komunitas perlu persetujuan admin.
            </p>

            <div className="mt-5 space-y-2">
              {communities.filter((c) => c.join_mode !== "closed").map((c) => {
                const isMember = c.id === myCommunityId;
                return (
                  <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-[#2a2d35] bg-[#1a1d24] p-3">
                    {c.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logo_url} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10">
                        <Users className="h-5 w-5 text-brand-gold" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                      <p className="line-clamp-2 text-xs text-brand-muted">
                        {c.tagline || (c.join_mode === "request" ? "Perlu persetujuan admin" : "Terbuka untuk semua")}
                      </p>
                    </div>
                    <JoinCommunityButton
                      community={c}
                      status={isMember ? "member" : pending.has(c.id) ? "pending" : "none"}
                      onDone={(r) => { if (r === "pending") setPending((s) => new Set(s).add(c.id)); }}
                    />
                  </div>
                );
              })}
            </div>

            {pendingNames.length > 0 && (
              <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
                Permintaanmu ke <b>{pendingNames.join(", ")}</b> sedang ditinjau oleh admin komunitas. Statusnya bisa kamu lihat di halaman Komunitas.
              </p>
            )}

            <button onClick={() => setStep(4)} className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-gold py-3.5 text-sm font-bold text-brand-dark">
              Lanjut <ArrowRight className="h-4 w-4" />
            </button>
            {!pendingNames.length && (
              <button onClick={() => setStep(4)} className="mt-2 w-full py-2 text-xs text-brand-muted">Lewati langkah ini</button>
            )}
          </section>
        )}

        {step === 4 && (
          <section>
            <h1 className="text-2xl font-bold" style={serif}>Pengingat doa</h1>
            <p className="mt-1 text-sm text-brand-muted">
              Mau diingatkan untuk berdoa (Angelus, Rosario, novena) dan menerima notifikasi pesan? Kami hanya mengirim yang kamu pilih, dan bisa diubah kapan saja di Profil.
            </p>
            <div className="mt-5"><PrayerRemindersCard userId={me.id} /></div>

            {pendingNames.length > 0 && (
              <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
                Permintaanmu ke <b>{pendingNames.join(", ")}</b> sedang ditinjau oleh admin komunitas.
              </p>
            )}

            <button onClick={finish} disabled={finishing} className="mt-6 w-full rounded-xl border border-brand-gold py-3.5 text-sm font-bold text-brand-gold disabled:opacity-60">
              {finishing ? "…" : "Selesai, mulai"}
            </button>
            <button onClick={finish} disabled={finishing} className="mt-2 w-full py-2 text-xs text-brand-muted">Lewati, nanti saja</button>
          </section>
        )}
      </div>
    </div>
  );
}
