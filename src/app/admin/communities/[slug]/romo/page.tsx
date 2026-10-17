import { redirect } from "next/navigation";
import { getCommunityPageContext, loadDioceses } from "@/lib/ciServer";
import { isCatholicIndonesia } from "@/lib/catholicIndonesia";
import ClergyDirectory, { type ClergyRow } from "@/components/ci/ClergyDirectory";

export const dynamic = "force-dynamic";

/** Add / remove Romo — Catholic Indonesia only, and only admin, superadmin and founder can change it. */
export default async function CommunityClergyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, community, isSiteAdmin } = await getCommunityPageContext(slug);
  if (!community) redirect("/admin/communities");
  if (!isCatholicIndonesia(community.name, community.slug)) redirect(`/admin/communities/${slug}/anggota`);

  const [{ data, error }, { dioceses, fromDb }] = await Promise.all([
    supabase
      .from("clergy" as any)
      .select("user_id, title, congregation, parish, profile:profiles(id, full_name, nama_panggilan, avatar_url, kota), diocese:dioceses(name)")
      .order("created_at"),
    loadDioceses(supabase),
  ]);

  const clergy = ((data as unknown as ClergyRow[]) ?? []).sort((a, b) =>
    (a.profile?.full_name ?? "").localeCompare(b.profile?.full_name ?? "")
  );

  return (
    <div className="p-4 md:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">Romo</h2>
        <p className="text-sm text-brand-muted">Beri gelar Romo, Uskup, Diakon, Frater, Suster atau Bruder kepada anggota. Lencananya tampil di profil mereka.</p>
        {!isSiteAdmin && (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            Hanya admin atau superadmin yang dapat menambah atau menghapus Romo.
          </p>
        )}
        {isSiteAdmin && error && (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            Jalankan <code>supabase/080_catholic_indonesia_pages.sql</code> untuk mengaktifkan daftar Romo.
          </p>
        )}
      </div>
      <ClergyDirectory
        clergy={clergy}
        canEdit={isSiteAdmin && !error}
        dioceses={fromDb ? dioceses.filter((d) => d.id).map((d) => ({ id: d.id!, name: d.name })) : []}
      />
    </div>
  );
}
