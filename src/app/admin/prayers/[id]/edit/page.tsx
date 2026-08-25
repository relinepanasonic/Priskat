import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PrayerForm from "@/components/admin/PrayerForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Prayer } from "@/lib/types/database.types";

export default async function EditPrayerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("prayers" as any)
    .select("*")
    .eq("id", params.id)
    .single();

  if (!data) notFound();
  const prayer = data as unknown as Prayer;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/prayers" className="mb-4 inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-gold">
          <ArrowLeft className="h-4 w-4" /> Back to Prayers
        </Link>
        <h1 className="text-2xl font-bold text-white">Edit Prayer</h1>
      </div>
      <div className="card-3d p-6">
        <PrayerForm initialData={prayer} />
      </div>
    </div>
  );
}
