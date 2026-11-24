import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { googleConfigured } from "@/lib/googleCalendar";

/** Connect the Ruang Iman Gmail to Google Calendar. Only the founder or a superadmin, signed in, can start it. */
export async function GET() {
  if (!googleConfigured()) return new NextResponse("Google belum diatur (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI).", { status: 500 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect("https://apps.ruangiman.com/login?next=/api/google/connect");
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!["founder", "superadmin"].includes(String(prof?.role ?? "").toLowerCase())) return new NextResponse("Hanya founder atau superadmin.", { status: 403 });

  const state = randomBytes(24).toString("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
    state,
  }).toString();
  const res = NextResponse.redirect(url.toString());
  res.cookies.set("g_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/google", maxAge: 600 });
  return res;
}
