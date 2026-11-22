import type { SupabaseClient } from "@supabase/supabase-js";
import { BOT_POST_HOURS, BOT_THOUGHTS } from "@/lib/bots";

/**
 * Posts one short thought from a random bot when a posting hour (Jakarta time) has passed and fewer posts than
 * hours have gone out today. Called every 15 minutes by the reminders timer. Quiet when there are no bots.
 */
export async function runBotPosts(db: SupabaseClient, force = false): Promise<{ posted: boolean; reason?: string }> {
  const nowJ = new Date(Date.now() + 7 * 3600_000);
  const hour = nowJ.getUTCHours();
  const dayStartUtc = new Date(Date.UTC(nowJ.getUTCFullYear(), nowJ.getUTCMonth(), nowJ.getUTCDate()) - 7 * 3600_000).toISOString();
  const expected = BOT_POST_HOURS.filter((h) => h <= hour).length + (force ? 1 : 0);
  if (expected === 0) return { posted: false, reason: "too early" };

  const { data: botRows, error } = await db.from("profiles").select("id").eq("is_bot", true).eq("bot_ready", true);
  if (error) return { posted: false, reason: "bots not set up yet" };
  const bots = ((botRows as { id: string }[]) ?? []).map((b) => b.id);
  if (bots.length === 0) return { posted: false, reason: "no bots" };

  const { count } = await db.from("community_posts").select("id", { count: "exact", head: true }).in("author_id", bots).gte("created_at", dayStartUtc);
  if ((count ?? 0) >= expected) return { posted: false, reason: "already posted" };

  const since = new Date(Date.now() - 90 * 86400_000).toISOString();
  const { data: recent } = await db.from("community_posts").select("content").in("author_id", bots).gte("created_at", since).limit(500);
  const used = new Set(((recent as { content: string }[]) ?? []).map((r) => r.content));
  const fresh = BOT_THOUGHTS.filter((t) => !used.has(t));
  const pool = fresh.length ? fresh : BOT_THOUGHTS;
  const text = pool[Math.floor(Math.random() * pool.length)];
  const author = bots[Math.floor(Math.random() * bots.length)];

  const { error: insErr } = await db.from("community_posts").insert({ author_id: author, content: text });
  return insErr ? { posted: false, reason: insErr.message } : { posted: true };
}
