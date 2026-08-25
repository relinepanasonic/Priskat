import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import DevotionForm from "@/components/admin/DevotionForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditDevotionPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: devotion } = await supabase
    .from("daily_devotions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!devotion) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/devotions" className="mb-4 inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-gold">
          <ArrowLeft className="h-4 w-4" /> Back to Devotions
        </Link>
        <h1 className="text-2xl font-bold text-white">Edit Devotion</h1>
      </div>

      <div className="card-3d p-6 shadow-sm">
        <DevotionForm initialData={devotion} />
      </div>
    </div>
  );
}

