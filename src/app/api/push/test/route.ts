import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush, pushConfigProblem } from "@/lib/push";

/**
 * "Kirim notifikasi uji": sends one test notification to THIS phone (the token the app sends along),
 * and says what happened (no phone registered, server not set up, Firebase refused, or sent).
 * The token is (re)attached to the signed-in person first, so a token left on another account is fixed too.
 */
const last = new Map<string, number>();

export const maxDuration = 30;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ status: "unauthorized" }, { status: 401 });

  const now = Date.now();
  if ((last.get(user.id) ?? 0) > now - 15_000) return NextResponse.json({ status: "slow_down" }, { status: 429 });
  last.set(user.id, now);

  let body: { token?: string } = {};
  try { body = await request.json(); } catch { /* no body: older app page */ }
  const phoneToken = String(body.token ?? "").trim();

  const db = createAdminClient();
  let tokens: string[];
  let moved = false;
  if (phoneToken.length >= 20 && phoneToken.length <= 4096 && !/\s/.test(phoneToken)) {
    const { data: row } = await db.from("push_tokens" as any).select("user_id").eq("token", phoneToken).maybeSingle();
    const owner = (row as { user_id: string } | null)?.user_id;
    moved = !!owner && owner !== user.id;
    if (owner !== user.id) {
      await db.from("push_tokens" as any).upsert({ token: phoneToken, user_id: user.id, platform: "android", updated_at: new Date().toISOString() });
    }
    tokens = [phoneToken];
  } else {
    const { data: rows } = await db.from("push_tokens" as any).select("token").eq("user_id", user.id);
    tokens = ((rows as { token: string }[]) ?? []).map((r) => r.token);
  }
  if (tokens.length === 0) return NextResponse.json({ status: "no_phone" });

  // Wait a little so the person can leave the app: Android only shows a notification when the app is not on screen
  await new Promise((r) => setTimeout(r, 8000));

  try {
    const r = await sendPush(tokens, { title: "Tes notifikasi Ruang Iman 🙏", body: "Kalau kamu melihat ini, notifikasi di ponselmu sudah berfungsi.", url: "/" });
    if (!r.configured) return NextResponse.json({ status: "server_not_configured", detail: pushConfigProblem });
    if (r.invalid.length) await db.from("push_tokens" as any).delete().in("token", r.invalid);
    if (r.sent > 0) return NextResponse.json({ status: "sent", phones: r.sent, thisPhone: !!phoneToken, moved });
    return NextResponse.json({ status: r.invalid.length ? "token_expired" : "fcm_error", detail: [r.errors[0], pushConfigProblem].filter(Boolean).join(" · ") || null });
  } catch (e) {
    return NextResponse.json({ status: "fcm_auth_error", detail: String((e as Error).message).slice(0, 160) });
  }
}
