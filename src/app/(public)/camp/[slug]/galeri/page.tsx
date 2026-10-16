import { redirect } from "next/navigation";
import { getCommunityPageContext } from "@/lib/ciServer";
import CommunityGallery, { type GalleryItem } from "@/components/ci/CommunityGallery";

export const dynamic = "force-dynamic";
export const metadata = { title: "Galeri" };

const serif = { fontFamily: "'Lora', Georgia, serif" };

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, community, canEdit } = await getCommunityPageContext(slug);
  if (!community) redirect("/camp");

  const { data, error } = await supabase
    .from("community_gallery" as any)
    .select("id, image_url, caption, created_at")
    .eq("community_id", community.id)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="p-4 md:p-6">
      <header className="mb-6 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-[#D6B072]">Galeri</p>
        <h2 className="mt-1 text-3xl font-semibold text-white" style={serif}>Momen Bersama</h2>
        <p className="mt-2 text-[#EAE5D9]/80">Kenangan kegiatan, misa, dan persaudaraan {community.name}.</p>
        {canEdit && error && (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            Mode admin: jalankan <code>supabase/080_catholic_indonesia_pages.sql</code> untuk mengaktifkan galeri.
          </p>
        )}
      </header>
      <CommunityGallery items={(data as unknown as GalleryItem[]) ?? []} communityId={community.id} canEdit={canEdit && !error} />
    </div>
  );
}
