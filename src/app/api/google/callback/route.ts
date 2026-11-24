import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { googleConfigured } from "@/lib/googleCalendar";

const page = (title: string, text: string, ok: boolean) =>
  new NextResponse(
    `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#121417;color:#fff;font-family:system-ui,sans-serif"><div style="max-width:420px;padding:24px;text-align:center"><div style="font-size:44px">${ok ? "✅" : "⚠️"}</div><h1 style="font-size:20px">${title}</h1><p style="color:#bbb;line-height:1.5">${text}</p><a href="https://communitycenter.ruangiman.com/admin/communities" style="display:inline-block;margin-top:12px;background:#D6B072;color:#121417;padding:12px 22px;border-radius:12px;font-weight:700;text-decoration:none">Ke Community Center</a></div></body></html>`,
    { status: ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

export async function GET(request: NextRequest) {
  if (!googleConfigured()) return page("Google belum diatur", "Isi variabel GOOGLE_* di Vercel.", false);
  const q = request.nextUrl.searchParams;
  if (q.get("error")) return page("Dibatalkan", "Sambungan ke Google Calendar dibatalkan.", false);
  const state = q.get("state");
  const cookie = request.cookies.get("g_state")?.value;
  if (!state || !cookie || state !== cookie) return page("Sesi tidak cocok", "Mulai lagi dari tombol sambung.", false);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return page("Belum masuk", "Masuk ke Ruang Iman dulu, lalu mulai lagi.", false);
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!["founder", "superadmin"].includes(String(prof?.role ?? "").toLowerCase())) return page("Tidak diizinkan", "Hanya founder atau superadmin.", false);

  const code = q.get("code");
  if (!code) return page("Tidak ada kode", "Google tidak mengirim kode. Mulai lagi.", false);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: process.env.GOOGLE_REDIRECT_URI!, grant_type: "authorization_code" }),
  });
  const j = (await res.json().catch(() => ({}))) as { refresh_token?: string; error_description?: string };
  if (!res.ok || !j.refresh_token) return page("Belum tersambung", `Google tidak memberi izin tetap. ${j.error_description ?? "Coba lagi, dan pilih Izinkan."}`, false);

  const { error } = await (createAdminClient() as any).from("google_calendar_link").upsert({ id: true, refresh_token: j.refresh_token, connected_by: user.id, connected_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) return page("Belum tersimpan", "Jalankan 140_google_calendar.sql di Supabase, lalu coba lagi.", false);
  const out = page("Google Calendar tersambung", "Setiap pendaftar yang sudah disetujui akan diundang ke acara di kalender Google Ruang Iman, dan acaranya masuk ke kalender mereka.", true);
  out.cookies.delete("g_state");
  return out;
}
