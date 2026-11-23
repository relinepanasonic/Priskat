import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatDateTime } from "@/lib/utils";
import { STATUS_LABEL, type RegField, type RegStatus } from "@/lib/eventReg";

export const maxDuration = 60;

/**
 * Event admins: the participant / attendance list as Excel (?format=xlsx) or PDF (?format=pdf).
 * ?all=1 lists everyone who registered (with their status), otherwise only approved people. ?group=<id> or ?group=none keeps one group.
 * Every row has the group and its Fasilitator.
 * Every row has the time the person was scanned in (Jakarta time, to the second) and which admin scanned them.
 */
export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key: eventId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) return new Response("bad event", { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });
  const { data: allowed } = await supabase.rpc("event_admin_of" as any, { p_event: eventId });
  if (allowed !== true) return new Response("forbidden", { status: 403 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "pdf" ? "pdf" : "xlsx";
  const onlyPresent = url.searchParams.get("present") === "1";
  const all = url.searchParams.get("all") === "1";
  const groupFilter = url.searchParams.get("group");

  const db = createAdminClient();
  let regQuery = db.from("event_registrations" as any).select("full_name, paroki, email, phone, answers, status, checked_in_at, checked_in_by, group_id").eq("event_id", eventId).order("full_name").limit(5000);
  if (!all) regQuery = regQuery.eq("status", "approved");
  const [{ data: ev }, { data: st }, { data: regs }, { data: grs }] = await Promise.all([
    db.from("events").select("title, event_date, location, cohort_id").eq("id", eventId).maybeSingle(),
    db.from("event_reg_settings" as any).select("fields").eq("event_id", eventId).maybeSingle(),
    regQuery,
    db.from("event_groups" as any).select("id, name, facilitator_crew_id").eq("event_id", eventId).order("created_at"),
  ]);
  const event = (ev ?? {}) as { title?: string; event_date?: string; location?: string };
  const fields = (((st as { fields?: RegField[] } | null)?.fields) ?? []).filter((f) => f.type !== "photo");
  type R = { full_name: string; paroki: string | null; email: string | null; phone: string | null; answers: Record<string, string>; status: RegStatus; checked_in_at: string | null; checked_in_by: string | null; group_id: string | null };
  let rows = ((regs as unknown as R[]) ?? []);
  if (onlyPresent) rows = rows.filter((r) => r.checked_in_at);
  if (groupFilter === "none") rows = rows.filter((r) => !r.group_id);
  else if (groupFilter && /^[0-9a-f-]{36}$/i.test(groupFilter)) rows = rows.filter((r) => r.group_id === groupFilter);

  // groups and the Fasilitator of each (a crew member of the event's workspace)
  const groups = ((grs as unknown as { id: string; name: string; facilitator_crew_id: string | null }[]) ?? []);
  const crewIds = groups.map((g) => g.facilitator_crew_id).filter(Boolean) as string[];
  const crewNames = new Map<string, string>();
  if (crewIds.length) {
    const { data: cr } = await db.from("camp_crew").select("id, name").in("id", crewIds);
    for (const c of (cr as { id: string; name: string | null }[]) ?? []) crewNames.set(c.id, c.name ?? "");
  }
  const groupName = (id: string | null) => groups.find((g) => g.id === id)?.name ?? "";
  const facilitator = (id: string | null) => { const g = groups.find((x) => x.id === id); return g?.facilitator_crew_id ? crewNames.get(g.facilitator_crew_id) ?? "" : ""; };
  // sorted by group (in the order the groups were made), then by name
  const order = (id: string | null) => { const i = groups.findIndex((g) => g.id === id); return i < 0 ? 9999 : i; };
  rows = [...rows].sort((a, b) => order(a.group_id) - order(b.group_id) || a.full_name.localeCompare(b.full_name));

  const adminIds = [...new Set(rows.map((r) => r.checked_in_by).filter(Boolean) as string[])];
  const names = new Map<string, string>();
  if (adminIds.length) {
    const { data: ps } = await db.from("profiles").select("id, full_name, nama_panggilan").in("id", adminIds);
    for (const p of (ps as { id: string; full_name: string | null; nama_panggilan: string | null }[]) ?? []) names.set(p.id, p.full_name || p.nama_panggilan || "Admin");
  }
  const stamp = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(new Date(iso).getTime() + 7 * 3600_000);
    return `${formatDateTime(iso)}:${String(d.getUTCSeconds()).padStart(2, "0")} WIB`;
  };
  const present = rows.filter((r) => r.checked_in_at).length;
  const safe = (event.title ?? "event").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "event";

  const tailCount = all ? 4 : 3;
  const head = ["No", "Nama", "Paroki", "Email", "No WhatsApp", "Grup", "Fasilitator", ...fields.map((f) => f.label), ...(all ? ["Status"] : []), "Hadir", "Waktu masuk", "Discan oleh"];
  const body = rows.map((r, i) => [
    i + 1, r.full_name, r.paroki ?? "", r.email ?? "", r.phone ?? "", groupName(r.group_id), facilitator(r.group_id), ...fields.map((f) => r.answers?.[f.key] ?? ""),
    ...(all ? [STATUS_LABEL[r.status] ?? r.status] : []),
    r.checked_in_at ? "Hadir" : "Belum", stamp(r.checked_in_at), r.checked_in_by ? names.get(r.checked_in_by) ?? "Admin" : "",
  ]);

  if (format === "xlsx") {
    const wb = new ExcelJS.Workbook();
    wb.creator = "Ruang Iman";
    const ws = wb.addWorksheet("Absensi");
    ws.addRow([event.title ?? "Event"]).font = { bold: true, size: 14 };
    ws.addRow([`${event.event_date ? formatDate(event.event_date) : ""}${event.location ? ` · ${event.location}` : ""}`]);
    ws.addRow([`Hadir ${present} dari ${rows.length} peserta. Dicetak ${formatDateTime(new Date())} WIB`]);
    ws.addRow([]);
    const h = ws.addRow(head);
    h.font = { bold: true, color: { argb: "FFFFFFFF" } };
    h.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F2A44" } };
    for (const b of body) ws.addRow(b);
    ws.columns.forEach((c, i) => { c.width = [5, 28, 24, 28, 16, 18, 22][i] ?? (i >= head.length - tailCount ? 22 : 20); });
    ws.views = [{ state: "frozen", ySplit: 5 }];
    const buf = await wb.xlsx.writeBuffer();
    return new Response(new Uint8Array(buf as ArrayBuffer), {
      headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="absensi-${safe}.xlsx"`, "Cache-Control": "no-store" },
    });
  }

  // PDF: landscape A4, a simple table over as many pages as needed
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 841.9, H = 595.3, M = 28;
  // column widths in points (the extra questions share what is left)
  const fixed = [24, 105, 80, 105, 70, 70, 80];
  const tail = all ? [66, 40, 96, 90] : [40, 96, 90];
  const extra = Math.max(0, fields.length);
  const left = W - 2 * M - fixed.reduce((a, b) => a + b, 0) - tail.reduce((a, b) => a + b, 0);
  const extraW = extra ? Math.max(40, left / extra) : 0;
  const widths = [...fixed, ...Array(extra).fill(extraW), ...tail];
  const scale = (W - 2 * M) / widths.reduce((a, b) => a + b, 0);
  const cw = widths.map((x) => x * scale);
  const fit = (t: string, w: number, f = font, size = 7.5) => {
    let s = String(t).replace(/[^\x20-\x7e\xa0-\xff]/g, "?");
    while (s.length > 1 && f.widthOfTextAtSize(s, size) > w - 6) s = s.slice(0, -2) + "…".replace("…", ".");
    return s;
  };
  let page = pdf.addPage([W, H]);
  let y = H - M;
  const header = (first: boolean) => {
    if (first) {
      page.drawText(fit(event.title ?? "Event", W - 2 * M, bold, 14), { x: M, y: y - 14, size: 14, font: bold, color: rgb(0.1, 0.12, 0.2) });
      y -= 20;
      page.drawText(fit(`${event.event_date ? formatDate(event.event_date) : ""}${event.location ? "  |  " + event.location : ""}`, W - 2 * M, font, 9), { x: M, y: y - 9, size: 9, font, color: rgb(0.35, 0.35, 0.4) });
      y -= 14;
      page.drawText(`Hadir ${present} dari ${rows.length} peserta.  Dicetak ${formatDateTime(new Date())} WIB`, { x: M, y: y - 9, size: 9, font, color: rgb(0.35, 0.35, 0.4) });
      y -= 20;
    }
    page.drawRectangle({ x: M, y: y - 16, width: W - 2 * M, height: 16, color: rgb(0.12, 0.16, 0.27) });
    let x = M;
    head.forEach((t, i) => { page.drawText(fit(t, cw[i], bold, 7.5), { x: x + 3, y: y - 11, size: 7.5, font: bold, color: rgb(1, 1, 1) }); x += cw[i]; });
    y -= 16;
  };
  header(true);
  body.forEach((row, n) => {
    if (y < M + 18) { page = pdf.addPage([W, H]); y = H - M; header(false); }
    if (n % 2 === 1) page.drawRectangle({ x: M, y: y - 14, width: W - 2 * M, height: 14, color: rgb(0.95, 0.95, 0.97) });
    let x = M;
    row.forEach((cell, i) => { page.drawText(fit(String(cell), cw[i]), { x: x + 3, y: y - 10, size: 7.5, font, color: rgb(0.1, 0.1, 0.12) }); x += cw[i]; });
    y -= 14;
  });
  const bytes = await pdf.save();
  return new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="absensi-${safe}.pdf"`, "Cache-Control": "no-store" },
  });
}
