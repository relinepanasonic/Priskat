import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";

export default async function AdminDevotionsPage() {
  const supabase = await createClient();

  const { data: devotions } = await supabase
    .from("daily_devotions")
    .select("*")
    .order("publish_date", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Devotions</h1>
          <p className="text-sm text-brand-muted">Schedule daily verses and prayers</p>
        </div>
        <Link href="/admin/devotions/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Schedule New</Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-brand-border bg-brand-surface overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-brand-border bg-brand-surface-hover">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase">Verse</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-brand-muted uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {devotions?.map((devotion) => (
              <tr key={devotion.id} className="hover:bg-brand-surface-hover">
                <td className="px-4 py-3 text-white font-medium">{devotion.publish_date}</td>
                <td className="px-4 py-3 text-brand-light text-sm max-w-md truncate">
                  <span className="font-semibold text-brand-gold">{devotion.verse_reference}</span> — {devotion.verse_text}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/devotions/${devotion.id}/edit`} className="text-sm text-brand-gold hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {(!devotions || devotions.length === 0) && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-brand-muted text-sm">
                  No devotions scheduled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
