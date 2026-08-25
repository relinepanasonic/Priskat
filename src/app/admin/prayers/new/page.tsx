import PrayerForm from "@/components/admin/PrayerForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewPrayerPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/prayers" className="mb-4 inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-gold">
          <ArrowLeft className="h-4 w-4" /> Back to Prayers
        </Link>
        <h1 className="text-2xl font-bold text-white">Add New Prayer / Tambah Doa</h1>
      </div>
      <div className="card-3d p-6">
        <PrayerForm />
      </div>
    </div>
  );
}
