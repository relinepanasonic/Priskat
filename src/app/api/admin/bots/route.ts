import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { avatarUrlFor, BOT_EMAIL_DOMAIN, BOT_PERSONAS, type BotPersona } from "@/lib/bots";
import { runBotPosts } from "@/lib/botTick";
import { randomBytes } from "crypto";

export const maxDuration = 60;

/**
 * Founder only.
 *   { action: "setup", count?: 20 }  gives every flagged test account a new name, bio and picture, and creates new bot accounts
 *   { action: "post" }               makes a bot post one thought right now
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (String((me as { role?: string } | null)?.role ?? "").toLowerCase() !== "founder") return NextResponse.json({ error: "founder only" }, { status: 403 });

  let body: { action?: string; count?: number } = {};
  try { body = await request.json(); } catch { /* defaults */ }
  const db = createAdminClient();

  if (body.action === "post") return NextResponse.json(await runBotPosts(db, true));
  if (body.action !== "setup") return NextResponse.json({ error: "unknown action" }, { status: 400 });

  const log: string[] = [];
  // names already used by a bot, so a second click never repeats a person
  const { data: usedRows, error: usedErr } = await db.from("profiles").select("full_name").eq("is_bot", true).eq("bot_ready", true);
  if (usedErr) return NextResponse.json({ error: "Jalankan 111_bots.sql dulu." }, { status: 400 });
  const used = new Set(((usedRows as { full_name: string }[]) ?? []).map((r) => r.full_name));
  const free = () => BOT_PERSONAS.filter((p) => !used.has(p.name));

  async function avatarFor(id: string, seed: string): Promise<string | null> {
    try {
      const r = await fetch(avatarUrlFor(seed));
      if (!r.ok) return null;
      const buf = Buffer.from(await r.arrayBuffer());
      const path = `bots/${id}.png`;
      const up = await db.storage.from("avatars").upload(path, buf, { contentType: "image/png", upsert: true });
      if (up.error) return null;
      return db.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    } catch {
      return null;
    }
  }
  const profileRow = async (id: string, p: BotPersona) => ({
    full_name: p.name, nama_panggilan: p.nick, gender: p.gender, kota: p.city, bio: p.bio, favorite_verse: p.verse,
    interests: p.interests, avatar_url: await avatarFor(id, p.name), is_bot: true, bot_ready: true, onboarded_at: new Date().toISOString(),
  });

  // 1) accounts flagged as bots (the old test accounts) get a new identity
  const { data: old } = await db.from("profiles").select("id").eq("is_bot", true).eq("bot_ready", false);
  for (const o of (old as { id: string }[]) ?? []) {
    const p = free().reverse()[0];
    if (!p) break;
    used.add(p.name);
    const { error } = await db.from("profiles").update(await profileRow(o.id, p)).eq("id", o.id);
    log.push(error ? `gagal ${o.id}: ${error.message}` : `akun lama menjadi ${p.name}`);
  }

  // 2) new bot accounts
  const want = Math.min(Math.max(Number(body.count) || 20, 0), 30);
  let made = 0;
  for (let i = 0; i < want; i++) {
    const p = free()[0];
    if (!p) { log.push("persona habis"); break; }
    used.add(p.name);
    const tag = randomBytes(3).toString("hex");
    const username = `${p.nick.toLowerCase().replace(/[^a-z]/g, "")}${tag}`;
    const { data: created, error } = await db.auth.admin.createUser({
      email: `${username}@${BOT_EMAIL_DOMAIN}`, password: randomBytes(24).toString("base64url"), email_confirm: true,
      user_metadata: { full_name: p.name, username },
    });
    if (error || !created.user) { log.push(`gagal ${p.name}: ${error?.message}`); continue; }
    const { error: upErr } = await db.from("profiles").update(await profileRow(created.user.id, p)).eq("id", created.user.id);
    if (upErr) { log.push(`profil ${p.name}: ${upErr.message}`); continue; }
    made += 1;
  }
  log.push(`${made} bot baru dibuat`);
  return NextResponse.json({ ok: true, log });
}
