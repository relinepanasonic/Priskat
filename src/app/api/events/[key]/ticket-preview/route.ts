import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sizeOf, ticketPng } from "@/lib/eventTicket";

/** Event admins: how a ticket will look with the saved design (or the one passed as ?bg=...), with a sample name. */
export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key: eventId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) return new Response("bad event", { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });
  const { data: allowed } = await supabase.rpc("event_admin_of" as any, { p_event: eventId });
  if (allowed !== true) return new Response("forbidden", { status: 403 });

  const db = createAdminClient();
  const url = new URL(request.url);
  const [{ data: ev }, { data: st }] = await Promise.all([
    db.from("events").select("title").eq("id", eventId).maybeSingle(),
    db.from("event_reg_settings" as any).select("ticket_size, ticket_bg_url").eq("event_id", eventId).maybeSingle(),
  ]);
  const settings = st as { ticket_size?: string; ticket_bg_url?: string | null } | null;
  const bg = url.searchParams.get("bg") ?? settings?.ticket_bg_url ?? null;
  // only our own design bucket may be used as a background
  const okBg = bg && /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/event-designs\//.test(bg) ? bg : settings?.ticket_bg_url ?? null;
  const png = await ticketPng({
    name: "Nama Peserta", event: (ev as { title?: string } | null)?.title ?? "Event", code: "0123456789abcdef0123456789abcdef",
    size: sizeOf(url.searchParams.get("size") ?? settings?.ticket_size), bgUrl: okBg,
  });
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
}
