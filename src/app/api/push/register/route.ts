import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Saves this phone's Firebase token for the signed-in person.
 * Done on the server because a token can only belong to one account: when the phone was used with another
 * account before, the database rules (own rows only) silently refused to move the token, so the notifications
 * kept going to the other account. Here the token always moves to whoever is signed in on the phone now.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { token?: string; platform?: string; richSupported?: boolean };
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  const token = String(body.token ?? "").trim();
  if (token.length < 20 || token.length > 4096 || /\s/.test(token)) return NextResponse.json({ ok: false }, { status: 400 });
  const platform = body.platform === "ios" ? "ios" : "android";

  const db = createAdminClient();
  const row: Record<string, unknown> = { token, user_id: user.id, platform, updated_at: new Date().toISOString() };
  if (typeof body.richSupported === "boolean") row.rich_supported = body.richSupported;
  let { error } = await db.from("push_tokens" as any).upsert(row);
  // If 144_rich_push.sql hasn't been run yet, retry without rich_supported so registration never breaks
  if (error && "rich_supported" in row) {
    delete row.rich_supported;
    ({ error } = await db.from("push_tokens" as any).upsert(row));
  }
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
