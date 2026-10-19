import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import PrayerRemindersCard from "@/components/profile/PrayerRemindersCard";
import MainCommunityPicker, { type CommunityOption } from "@/components/profile/MainCommunityPicker";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Profile" };

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Communities this person belongs to (Catholic Indonesia is everyone's): choose one as the main community
  const [{ data: mems }, { data: ci }] = await Promise.all([
    supabase.from("community_memberships" as any).select("community:communities(id, name, logo_url)").eq("user_id", user.id),
    supabase.from("communities").select("id, name, logo_url").eq("name", "Catholic Indonesia").maybeSingle(),
  ]);
  const byId = new Map<string, CommunityOption>();
  if (ci) byId.set((ci as any).id, ci as any);
  for (const m of (mems as any[]) ?? []) if (m.community) byId.set(m.community.id, m.community);
  const communityOptions = [...byId.values()];

  return (
    <main className="flex-1 px-4 pt-6 pb-12 max-w-md mx-auto w-full">
        <h1 className="text-3xl font-bold text-white mb-8">
          Edit Profile
        </h1>

        {/* PROFILE EDIT */}
        <section className="mb-8">
          <div className="card-3d p-6 shadow-sm">
            <ProfileEditForm profile={profile} />
          </div>
        </section>

        {communityOptions.length > 1 && (
          <section id="komunitas" className="mb-8">
            <h2 className="mb-1 text-xl font-bold text-white">Komunitas Utama</h2>
            <p className="mb-4 text-xs text-brand-muted">Kamu tergabung di beberapa komunitas. Pilih satu sebagai komunitas utama yang tampil di profilmu.</p>
            <MainCommunityPicker options={communityOptions} mainId={profile.community_id ?? null} />
          </section>
        )}

        <section className="mb-8">
          <h2 className="mb-1 text-xl font-bold text-white">Pengingat Doa & Notifikasi</h2>
          <p className="mb-4 text-xs text-brand-muted">Pilih pengingat yang ingin kamu terima di aplikasi.</p>
          <PrayerRemindersCard userId={user.id} />
        </section>

        <section className="mb-8 flex flex-col gap-2 text-sm">
          <Link href="/privacy" className="text-brand-muted hover:text-white underline underline-offset-4">Kebijakan Privasi</Link>
          <Link href="/hapus-akun" className="text-red-400/80 hover:text-red-400 underline underline-offset-4">Hapus Akun</Link>
        </section>

        {/*
          My Journey and My Services will be moved to Community later. 
          Components: <JourneyEditClient /> and <ServicesEditClient />
        */}
    </main>
  );
}
