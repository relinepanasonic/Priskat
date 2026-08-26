import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import { deletePrayer } from "@/app/actions/prayers";
import type { Prayer } from "@/lib/types/database.types";
import { PRAYER_CATEGORIES } from "@/lib/types/database.types";

export default async function AdminPrayersPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("prayers" as any)
    .select("*")
    .order("sort_order", { ascending: true });

  const prayers = (data ?? []) as unknown as Prayer[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Prayers / Doa</h1>
          <p className="text-sm text-brand-muted">{prayers.length} total prayers</p>
        </div>
        <Link href="/admin/prayers/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Add Prayer</Button>
        </Link>
      </div>

      <div className="card-3d overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-brand-border bg-brand-bg">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase">Title (ID / EN)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase hidden md:table-cell">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-brand-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {prayers.map((prayer) => {
              const cat = PRAYER_CATEGORIES.find((c) => c.value === prayer.category);
              return (
                <tr key={prayer.id} className="hover:bg-brand-surface-hover transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white text-sm">{prayer.title_id}</p>
                    <p className="text-xs text-brand-muted">{prayer.title_en}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-brand-muted">
                    {cat?.label_id}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      prayer.is_published
                        ? "bg-green-900/40 text-green-300 border border-green-500/30"
                        : "bg-brand-bg text-brand-muted border border-brand-border"
                    }`}>
                      {prayer.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex justify-end gap-2">
                    <Link href={`/admin/prayers/${prayer.id}/edit`}
                      className="text-sm text-brand-gold hover:underline px-2 py-1">
                      Edit
                    </Link>
                    <form action={async () => { await deletePrayer(prayer.id); }}>
                      <button type="submit" className="text-sm text-red-400 hover:text-red-300 px-2 py-1"
                        onClick={(e) => { if (!confirm("Delete this prayer?")) e.preventDefault(); }}>
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {prayers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-brand-muted text-sm">
                  No prayers yet. Add your first prayer!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
