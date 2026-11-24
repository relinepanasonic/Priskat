import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendRegistrationEmail } from "@/lib/eventMail";
import { inviteToCalendar } from "@/lib/googleCalendar";
import { isRegisterKey, registerKeyFilter, type RegField } from "@/lib/eventReg";

export const maxDuration = 30;

/**
 * Registration by the short link /e/<code>, without logging in.
 * Makes (or finds) the person's Ruang Iman account by email, registers them, saves the answers and photos,
 * sends the confirmation email and returns the ticket code for the QR on screen.
 */
const hits = new Map<string, number[]>();
function tooMany(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}

const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

export async function POST(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key: code } = await params;
  if (!isRegisterKey(code)) return NextResponse.json({ error: "Link tidak valid." }, { status: 400 });
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (tooMany(`ip:${ip}`, 15, 3600_000)) return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });

  let form: FormData;
  try { form = await request.formData(); } catch { return NextResponse.json({ error: "Data tidak terbaca." }, { status: 400 }); }

  const name = clean(form.get("name"), 120);
  const paroki = clean(form.get("paroki"), 120);
  const email = clean(form.get("email"), 160).toLowerCase();
  let phone = clean(form.get("phone"), 30).replace(/[^\d+]/g, "");
  if (phone.startsWith("+62")) phone = "0" + phone.slice(3);
  else if (phone.startsWith("62") && phone.length > 10) phone = "0" + phone.slice(2);
  if (name.length < 2) return NextResponse.json({ error: "Isi nama lengkap." }, { status: 400 });
  if (paroki.length < 2) return NextResponse.json({ error: "Isi paroki." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: "Isi email yang benar." }, { status: 400 });
  if (!/^0\d{8,14}$/.test(phone)) return NextResponse.json({ error: "Isi nomor WhatsApp yang benar, contoh 08123456789." }, { status: 400 });
  if (tooMany(`mail:${email}`, 4, 3600_000)) return NextResponse.json({ error: "Email ini sudah mencoba beberapa kali. Coba lagi nanti." }, { status: 429 });

  const db = createAdminClient();
  const { data: st } = await db.from("event_reg_settings" as any).select("*").or(registerKeyFilter(code)).maybeSingle();
  const settings = st as { event_id: string; open: boolean; link_open?: boolean; link_auto_approve?: boolean; deadline: string | null; fields: RegField[]; price: number } | null;
  if (!settings) return NextResponse.json({ error: "Link pendaftaran tidak ditemukan." }, { status: 404 });
  const { data: evRow } = await db.from("events").select("id, title, event_date, location, capacity, status").eq("id", settings.event_id).maybeSingle();
  const ev = evRow as { id: string; title: string; event_date: string | null; location: string | null; capacity: number | null; status: string } | null;
  if (!ev || ev.status !== "published") return NextResponse.json({ error: "Acara tidak ditemukan." }, { status: 404 });
  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  if (!settings.open || settings.link_open === false) return NextResponse.json({ error: "Pendaftaran acara ini belum dibuka." }, { status: 403 });
  if (settings.deadline && settings.deadline < today) return NextResponse.json({ error: "Pendaftaran sudah ditutup." }, { status: 403 });

  // the admin's own questions
  const answers: Record<string, string> = {};
  const photos: { key: string; file: File }[] = [];
  for (const f of settings.fields ?? []) {
    if (f.type === "photo") {
      const file = form.get(`photo_${f.key}`);
      if (file instanceof File && file.size > 0) {
        if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 4 * 1024 * 1024) return NextResponse.json({ error: `Foto untuk "${f.label}" harus JPG, PNG, atau WEBP di bawah 4 MB.` }, { status: 400 });
        photos.push({ key: f.key, file });
      } else if (f.required) return NextResponse.json({ error: `Unggah foto: ${f.label}` }, { status: 400 });
      continue;
    }
    const v = clean(form.get(`a_${f.key}`), f.type === "textarea" ? 600 : 200);
    if (f.required && !v) return NextResponse.json({ error: `Isi: ${f.label}` }, { status: 400 });
    if (f.type === "select" && v && !(f.options ?? []).includes(v)) return NextResponse.json({ error: `Pilihan tidak valid: ${f.label}` }, { status: 400 });
    if (v) answers[f.key] = v;
  }

  // the person's Ruang Iman account, by email
  let uid: string | null = null;
  const found = await db.rpc("admin_user_id_by_email", { p_email: email });
  if (!found.error && found.data) uid = found.data as string;
  let created = false;
  if (!uid) {
    const { data: u, error } = await db.auth.admin.createUser({ email, password: randomBytes(24).toString("base64url"), email_confirm: true, user_metadata: { full_name: name } });
    if (error || !u.user) {
      const again = await db.rpc("admin_user_id_by_email", { p_email: email });
      if (!again.data) return NextResponse.json({ error: "Akun belum bisa dibuat. Coba lagi sebentar lagi." }, { status: 500 });
      uid = again.data as string;
    } else { uid = u.user.id; created = true; }
  }

  // profile details: a new account gets all of them, an existing one only the blanks
  const { data: prof } = await db.from("profiles").select("full_name, paroki").eq("id", uid).maybeSingle();
  const p = (prof ?? {}) as { full_name?: string | null; paroki?: string | null };
  const patch: Record<string, string> = {};
  if (created || !p.full_name) patch.full_name = name;
  if (created || !p.paroki) patch.paroki = paroki;
  if (Object.keys(patch).length) await db.from("profiles").update(patch).eq("id", uid);
  try { await db.from("profile_private" as any).upsert({ user_id: uid, phone }, { onConflict: "user_id", ignoreDuplicates: !created }); } catch { /* the phone stays on the registration */ }

  // already registered: show the same ticket again
  const { data: existing } = await db.from("event_registrations" as any).select("id, status, ticket_code, full_name").eq("event_id", ev.id).eq("user_id", uid).maybeSingle();
  const ex = existing as { id: string; status: string; ticket_code: string; full_name: string } | null;
  if (ex && ex.status !== "cancelled" && ex.status !== "rejected") {
    return NextResponse.json({ ok: true, already: true, ticket_code: ex.ticket_code, name: ex.full_name, approved: ex.status === "approved" });
  }

  if (ev.capacity != null) {
    const { count } = await db.from("event_registrations" as any).select("id", { count: "exact", head: true }).eq("event_id", ev.id).in("status", ["awaiting_payment", "pending_review", "approved"]);
    if ((count ?? 0) >= ev.capacity) return NextResponse.json({ error: "Maaf, kuota acara ini sudah penuh." }, { status: 409 });
  }

  // A paid event starts as "Belum bayar" with no QR; the Ketua, Wakil Ketua, Sekretaris or Bendahara mark it paid later.
  // A free event is approved straight away (unless auto approve is off).
  const price = Math.max(0, Number(settings.price) || 0);
  const status = price > 0 ? "awaiting_payment" : settings.link_auto_approve === false ? "pending_review" : "approved";
  const row = {
    event_id: ev.id, user_id: uid, full_name: name, phone, email, paroki, answers, status, amount: price, source: "link",
    decided_at: status === "approved" ? new Date().toISOString() : null, created_at: new Date().toISOString(),
    proof_path: null, reject_reason: null, checked_in_at: null, checked_in_by: null,
  };
  let regId = ex?.id ?? "";
  let ticketCode = ex?.ticket_code ?? "";
  if (ex) {
    const { error } = await db.from("event_registrations" as any).update(row).eq("id", ex.id);
    if (error) return NextResponse.json({ error: "Pendaftaran belum tersimpan. Coba lagi." }, { status: 500 });
  } else {
    const { data: ins, error } = await db.from("event_registrations" as any).insert(row).select("id, ticket_code").single();
    if (error || !ins) return NextResponse.json({ error: "Pendaftaran belum tersimpan. Coba lagi." }, { status: 500 });
    regId = (ins as { id: string }).id;
    ticketCode = (ins as { ticket_code: string }).ticket_code;
  }

  // photos (private bucket; the event's admins can read them)
  if (photos.length) {
    const withPaths = { ...answers };
    for (const ph of photos) {
      const ext = ph.file.type === "image/png" ? "png" : ph.file.type === "image/webp" ? "webp" : "jpg";
      const path = `${ev.id}/${regId}-${ph.key}.${ext}`;
      const up = await db.storage.from("event-guest-photos").upload(path, Buffer.from(await ph.file.arrayBuffer()), { contentType: ph.file.type, upsert: true });
      if (!up.error) withPaths[ph.key] = `photo:${path}`;
    }
    await db.from("event_registrations" as any).update({ answers: withPaths }).eq("id", regId);
  }

  // confirmation email with the reminder to bring the QR code; a new account also gets a link to set a password
  let passwordLink: string | null = null;
  if (created) {
    try {
      const { data: link } = await db.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: "https://apps.ruangiman.com/reset-password" } });
      passwordLink = (link as { properties?: { action_link?: string } } | null)?.properties?.action_link ?? null;
    } catch { /* no link, the email still goes out */ }
  }
  let emailed = false;
  if (status === "approved") {
    emailed = await sendRegistrationEmail({ to: email, name, event: ev.title, start: ev.event_date, location: ev.location, code: ticketCode, passwordLink });
    if (emailed) await db.from("event_registrations" as any).update({ emailed_at: new Date().toISOString() }).eq("id", regId);
    // the event goes into their Google Calendar (invitation from the Ruang Iman Gmail), when that is connected
    await inviteToCalendar(ev.id, email, name);
  }

  return NextResponse.json({ ok: true, ticket_code: ticketCode, name, approved: status === "approved", emailed });
}
