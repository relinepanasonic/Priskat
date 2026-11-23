import { PDFDocument } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sizeOf, ticketPng, TICKET_SIZES } from "@/lib/eventTicket";

export const maxDuration = 60;

/** Event admins: every approved person's ticket as one PDF, one ticket per page at the real print size (?size=a5|card, ?ids=a,b,c for a few). */
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
    db.from("event_reg_settings" as any).select("ticket_size, ticket_bg_url, ticket_template, ticket_gradient").eq("event_id", eventId).maybeSingle(),
  ]);
  const settings = st as { ticket_size?: string; ticket_bg_url?: string | null; ticket_template?: string; ticket_gradient?: string } | null;
  const size = sizeOf(url.searchParams.get("size") ?? settings?.ticket_size);
  const ids = (url.searchParams.get("ids") ?? "").split(",").filter((x) => /^[0-9a-f-]{36}$/i.test(x));

  let q = db.from("event_registrations" as any).select("full_name, ticket_code").eq("event_id", eventId).eq("status", "approved").order("full_name").limit(400);
  if (ids.length) q = q.in("id", ids);
  const { data: regs } = await q;
  const list = (regs as { full_name: string; ticket_code: string }[]) ?? [];
  if (!list.length) return new Response("Belum ada peserta yang disetujui.", { status: 404 });

  const { mm } = TICKET_SIZES[size];
  const pw = (mm[0] / 25.4) * 72;
  const ph = (mm[1] / 25.4) * 72;
  const pdf = await PDFDocument.create();
  const title = (ev as { title?: string } | null)?.title ?? "Event";
  for (const r of list) {
    const png = await ticketPng({ name: r.full_name, event: title, code: r.ticket_code, size, bgUrl: settings?.ticket_bg_url, template: settings?.ticket_template, gradient: settings?.ticket_gradient });
    const img = await pdf.embedPng(png);
    const page = pdf.addPage([pw, ph]);
    page.drawImage(img, { x: 0, y: 0, width: pw, height: ph });
  }
  const bytes = await pdf.save();
  const safe = title.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "event";
  return new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="tiket-${safe}-${size}.pdf"`, "Cache-Control": "no-store" },
  });
}
