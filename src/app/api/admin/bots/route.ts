import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BOT_EMAIL_DOMAIN, BOT_PERSONAS, type BotPersona } from "@/lib/bots";
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
  if (body.action === "tidy") return NextResponse.json({ ok: true, log: await tidyBots(db) });
  if (body.action !== "setup") return NextResponse.json({ error: "unknown action" }, { status: 400 });

  const log: string[] = [];
  const { data: botRows, error: botErr } = await db.from("profiles").select("id, full_name").eq("is_bot", true).order("created_at", { ascending: true });
  if (botErr) return NextResponse.json({ error: "Jalankan 111_bots.sql dulu." }, { status: 400 });
  const bots = (botRows as { id: string; full_name: string | null }[]) ?? [];

  // The 20 people with a portrait in /public/people. Bots that already are one of them stay as they are.
  // A real test account that already carries one of these names (e.g. Damar) counts as taken, so no second copy is made
  const { data: named } = await db.from("profiles").select("full_name").in("full_name", BOT_PERSONAS.map((p) => p.name));
  const have = new Set([...bots.map((b) => b.full_name), ...((named as { full_name: string }[]) ?? []).map((r) => r.full_name)]);
  const missing = BOT_PERSONAS.filter((p) => !have.has(p.name));
  const personaNames = new Set(BOT_PERSONAS.map((p) => p.name));
  // accounts that should become one of them: the old test accounts, and bots made with an earlier set of names
  const convertible = bots.filter((b) => !personaNames.has(b.full_name ?? ""));

  const profileRow = (p: BotPersona) => ({
    full_name: p.name, nama_panggilan: p.nick, gender: p.gender, kota: p.city, bio: p.bio, favorite_verse: p.verse,
    interests: p.interests, avatar_url: p.photo ?? null, is_bot: true, bot_ready: true, onboarded_at: new Date().toISOString(),
  });

  // 1) existing bot accounts become these people (oldest first)
  let converted = 0;
  const queue = [...missing];
  for (const acct of convertible) {
    const p = queue.shift();
    if (!p) break;
    const { error } = await db.from("profiles").update(profileRow(p)).eq("id", acct.id);
    if (error) { log.push(`gagal ${p.name}: ${error.message}`); queue.unshift(p); continue; }
    converted += 1;
  }
  if (converted) log.push(`${converted} akun bot lama diganti menjadi orang-orang dengan foto`);

  // 2) new accounts for the rest
  let made = 0;
  for (const p of queue) {
    const tag = randomBytes(3).toString("hex");
    const username = `${p.nick.toLowerCase().replace(/[^a-z]/g, "")}${tag}`;
    const { data: created, error } = await db.auth.admin.createUser({
      email: `${username}@${BOT_EMAIL_DOMAIN}`, password: randomBytes(24).toString("base64url"), email_confirm: true,
      user_metadata: { full_name: p.name, username },
    });
    if (error || !created.user) { log.push(`gagal ${p.name}: ${error?.message}`); continue; }
    const { error: upErr } = await db.from("profiles").update(profileRow(p)).eq("id", created.user.id);
    if (upErr) { log.push(`profil ${p.name}: ${upErr.message}`); continue; }
    made += 1;
  }
  log.push(`${made} bot baru dibuat`);
  log.push(...(await tidyBots(db)));
  return NextResponse.json({ ok: true, log });
}

/**
 * Bots are not community members: they leave every community (and the default one they start in), and they become
 * friends with a few of each other so the conversations between them make sense. Safe to run again.
 */
async function tidyBots(db: ReturnType<typeof createAdminClient>): Promise<string[]> {
  const log: string[] = [];
  const { data: rows } = await db.from("profiles").select("id").eq("is_bot", true);
  const ids = ((rows as { id: string }[]) ?? []).map((r) => r.id);
  if (ids.length === 0) return ["belum ada bot"];

  await db.from("community_memberships").delete().in("user_id", ids);
  const { error: cErr } = await db.from("profiles").update({ community_id: null }).in("id", ids);
  log.push(cErr ? `komunitas: ${cErr.message}` : `${ids.length} bot tidak lagi menjadi anggota komunitas`);

  // each bot gets about four bot friends
  const { data: existing } = await db.from("friendships").select("requester_id, receiver_id").in("requester_id", ids).in("receiver_id", ids);
  const have = new Set(((existing as { requester_id: string; receiver_id: string }[]) ?? []).flatMap((f) => [`${f.requester_id}|${f.receiver_id}`, `${f.receiver_id}|${f.requester_id}`]));
  const degree = new Map<string, number>(ids.map((i) => [i, 0]));
  for (const k of have) degree.set(k.split("|")[0], (degree.get(k.split("|")[0]) ?? 0) + 0.5);
  const add: { requester_id: string; receiver_id: string; status: string }[] = [];
  for (const a of ids) {
    const pool = ids.filter((b) => b !== a && !have.has(`${a}|${b}`)).sort(() => Math.random() - 0.5);
    for (const b of pool) {
      if ((degree.get(a) ?? 0) >= 4) break;
      if ((degree.get(b) ?? 0) >= 6) continue;
      add.push({ requester_id: a, receiver_id: b, status: "accepted" });
      have.add(`${a}|${b}`); have.add(`${b}|${a}`);
      degree.set(a, (degree.get(a) ?? 0) + 1); degree.set(b, (degree.get(b) ?? 0) + 1);
    }
  }
  if (add.length) {
    const { error } = await db.from("friendships").insert(add);
    log.push(error ? `pertemanan: ${error.message}` : `${add.length} pertemanan antar bot dibuat`);
  } else log.push("pertemanan antar bot sudah ada");

  // every bot is a friend of the founder (Nico Japar), so they show up in his friends list
  const { data: founders } = await db.from("profiles").select("id, full_name").eq("role", "founder");
  const list = (founders as { id: string; full_name: string | null }[]) ?? [];
  const nico = list.find((f) => /nico\s*japar/i.test(f.full_name ?? "")) ?? list.find((f) => /nico/i.test(f.full_name ?? "")) ?? list[0];
  if (!nico) {
    log.push("akun founder tidak ditemukan");
  } else {
    const { data: fr } = await db.from("friendships").select("requester_id, receiver_id").or(`requester_id.eq.${nico.id},receiver_id.eq.${nico.id}`);
    const linked = new Set(((fr as { requester_id: string; receiver_id: string }[]) ?? []).map((f) => (f.requester_id === nico.id ? f.receiver_id : f.requester_id)));
    const toAdd = ids.filter((b) => b !== nico.id && !linked.has(b)).map((b) => ({ requester_id: b, receiver_id: nico.id, status: "accepted" }));
    if (toAdd.length) {
      const { error } = await db.from("friendships").insert(toAdd);
      log.push(error ? `teman founder: ${error.message}` : `${toAdd.length} bot menjadi teman ${nico.full_name ?? "founder"}`);
    } else log.push(`semua bot sudah berteman dengan ${nico.full_name ?? "founder"}`);
  }
  return log;
}
