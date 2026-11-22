import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABEL, type RegStatus } from "@/lib/eventReg";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tiket saya" };

type Row = { id: string; status: RegStatus; checked_in_at: string | null; event: { id: string; title: string; event_date: string } | null };

/** Every event the person registered for, with its status. The QR ticket opens on the event page once approved. */
export default async function MyTicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase
    .from("event_registrations" as any)
    .select("id, status, checked_in_at, event:events!event_id(id, title, event_date)")
    .eq("user_id", user.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });
  const rows = ((data as unknown as Row[]) ?? []).filter((r) => r.event);

  return (
    <div className="w-full max-w-2xl space-y-4 p-4 pb-28 md:p-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><Ticket className="h-6 w-6 text-brand-gold" /> Tiket saya</h1>
      {rows.length === 0 && <p className="rounded-2xl border border-[#333] bg-[#1a1d24] p-6 text-center text-sm text-brand-muted">Kamu belum mendaftar di acara apa pun.</p>}
      {rows.map((r) => (
        <Link key={r.id} href={`/acara/${r.event!.id}`} className="flex items-center gap-3 rounded-2xl border border-[#2a2d35] bg-[#14171c] p-4 hover:border-brand-gold/40">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white">{r.event!.title}</p>
            <p className="text-xs text-brand-muted">{new Date(r.event!.event_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })}</p>
            <p className={`mt-1 text-xs font-semibold ${r.status === "approved" ? "text-emerald-300" : r.status === "rejected" ? "text-red-300" : "text-amber-300"}`}>
              {r.checked_in_at ? "Sudah hadir" : STATUS_LABEL[r.status]}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-brand-muted" />
        </Link>
      ))}
    </div>
  );
}
