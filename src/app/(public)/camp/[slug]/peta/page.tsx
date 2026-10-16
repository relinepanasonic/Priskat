import { createClient } from "@/lib/supabase/server";
import { loadDioceses } from "@/lib/ciServer";
import DioceseMap from "@/components/ci/DioceseMap";

export const dynamic = "force-dynamic";
export const metadata = { title: "Peta Keuskupan" };

const serif = { fontFamily: "'Lora', Georgia, serif" };

export default async function DioceseMapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { dioceses } = await loadDioceses(await createClient());

  return (
    <div className="pb-24">
      <header className="mb-5 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-[#D6B072]">Peta</p>
        <h2 className="mt-1 text-3xl font-semibold text-white" style={serif}>Keuskupan di Indonesia</h2>
        <p className="mt-2 text-[#EAE5D9]/80">Dari Medan hingga Merauke. Titik besar menandai keuskupan agung.</p>
      </header>
      <DioceseMap dioceses={dioceses} slug={slug} />
    </div>
  );
}
