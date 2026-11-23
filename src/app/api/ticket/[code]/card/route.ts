import { createAdminClient } from "@/lib/supabase/admin";
import { sizeOf, ticketPng } from "@/lib/eventTicket";
import { guestPhoto, ticketExtras } from "@/lib/ticketData";

/**
 * The printable ticket of one person (name + QR on the event's design): ?size=a5|card, &dl=1 to download.
 * Whoever holds the long ticket code can open it, which is the same as holding the ticket.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[0-9a-f]{32}$/i.test(code)) return new Response("bad code", { status: 400 });
  const db = createAdminClient();
  const { data: reg } = await db.from("event_registrations" as any).select("full_name, event_id, status, group_id, answers").eq("ticket_code", code.toLowerCase()).maybeSingle();
  const r = reg as { full_name: string; event_id: string; status: string; group_id: string | null; answers: Record<string, string> | null } | null;
  if (!r || r.status !== "approved") return new Response("not found", { status: 404 });
  const [{ data: ev }, { data: st }] = await Promise.all([
    db.from("events").select("title").eq("id", r.event_id).maybeSingle(),
    db.from("event_reg_settings" as any).select("ticket_size, ticket_bg_url, ticket_template, ticket_gradient").eq("event_id", r.event_id).maybeSingle(),
  ]);
  const settings = st as { ticket_size?: string; ticket_bg_url?: string | null; ticket_template?: string; ticket_gradient?: string } | null;
  const url = new URL(request.url);
  const size = sizeOf(url.searchParams.get("size") ?? settings?.ticket_size);
  const extras = await ticketExtras(db, r.event_id);
  const photo = await guestPhoto(db, r.answers);
  const png = await ticketPng({ group: r.group_id ? extras.groups.get(r.group_id) : null, photo, logoUrl: extras.logoUrl, name: r.full_name, event: (ev as { title?: string } | null)?.title ?? "Event", code: code.toLowerCase(), size, bgUrl: settings?.ticket_bg_url, template: settings?.ticket_template, gradient: settings?.ticket_gradient });
  const safe = r.full_name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "tiket";
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=300",
      ...(url.searchParams.get("dl") ? { "Content-Disposition": `attachment; filename="tiket-${safe}.png"` } : {}),
    },
  });
}
