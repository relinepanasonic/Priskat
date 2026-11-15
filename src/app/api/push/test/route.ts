import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush, pushConfigProblem } from "@/lib/push";

/**
 * "Kirim notifikasi uji": sends one test notification to the signed-in person's own phones
 * and says what happened (no phone registered, server not set up, Firebase refused, or sent).
 */
const last = new Map<string, number>();

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ status: "unauthorized" }, { status: 401 });

  const now = Date.now();
  if ((last.get(user.id) ?? 0) > now - 15_000) return NextResponse.json({ status: "slow_down" }, { status: 429 });
  last.set(user.id, now);

  const db = createAdminClient();
  const { data: rows } = await db.from("push_tokens" as any).select("token").eq("user_id", user.id);
  const tokens = ((rows as { token: string }[]) ?? []).map((r) => r.token);
  if (tokens.length === 0) return NextResponse.json({ status: "no_phone" });

  try {
    const r = await sendPush(tokens, { title: "Tes notifikasi Ruang Iman 🙏", body: "Kalau kamu melihat ini, notifikasi di ponselmu sudah berfungsi.", url: "/" });
    if (!r.configured) return NextResponse.json({ status: "server_not_configured", detail: pushConfigProblem });
    if (r.invalid.length) await db.from("push_tokens" as any).delete().in("token", r.invalid);
    if (r.sent > 0) return NextResponse.json({ status: "sent", phones: r.sent });
    return NextResponse.json({ status: r.invalid.length ? "token_expired" : "fcm_error", detail: [r.errors[0], pushConfigProblem].filter(Boolean).join(" · ") || null });
  } catch (e) {
    return NextResponse.json({ status: "fcm_auth_error", detail: String((e as Error).message).slice(0, 160) });
  }
}
