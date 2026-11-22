import type { SupabaseClient } from "@supabase/supabase-js";
import { BOT_POST_HOURS } from "@/lib/bots";
import { fill, KIND_OF, pick, pickKind, POOL, REPLIES } from "@/lib/botTalk";

type Result = { posted: boolean; replies: number; likes: number; reason?: string };

const MIN = 60_000;

/**
 * What the bots do, run every 15 minutes by the reminders timer. Small steps each time, so it looks like a day, not a burst:
 *   1. a new post when a posting hour (Jakarta time) has passed and fewer posts than hours have gone out today
 *   2. up to two replies in the little conversations under happy, sad and daily posts (one bot asks, the author answers)
 *   3. one to three likes, on real people's thoughts first (at most 3 bot likes on any one post)
 * Quiet when there are no bots. `force` makes a new post and a round of replies and likes happen now.
 */
export async function runBotPosts(db: SupabaseClient, force = false): Promise<Result> {
  const out: Result = { posted: false, replies: 0, likes: 0 };
  const nowJ = new Date(Date.now() + 7 * 3600_000);
  const hour = nowJ.getUTCHours();
  const dayStartUtc = new Date(Date.UTC(nowJ.getUTCFullYear(), nowJ.getUTCMonth(), nowJ.getUTCDate()) - 7 * 3600_000).toISOString();

  const { data: botRows, error } = await db.from("profiles").select("id, nama_panggilan, full_name").eq("is_bot", true).eq("bot_ready", true);
  if (error) return { ...out, reason: "bots not set up yet" };
  const bots = ((botRows as { id: string; nama_panggilan: string | null; full_name: string | null }[]) ?? []);
  if (bots.length < 2) return { ...out, reason: "no bots" };
  const botIds = bots.map((b) => b.id);
  const nick = new Map(bots.map((b) => [b.id, b.nama_panggilan || (b.full_name ?? "teman").split(" ")[0]]));

  // 1) a new post
  const expected = BOT_POST_HOURS.filter((h) => h <= hour).length + (force ? 1 : 0);
  const { count: today } = await db.from("community_posts").select("id", { count: "exact", head: true }).in("author_id", botIds).gte("created_at", dayStartUtc);
  if ((today ?? 0) < expected) {
    const kind = pickKind();
    const since = new Date(Date.now() - 60 * 86400_000).toISOString();
    const { data: recent } = await db.from("community_posts").select("content").in("author_id", botIds).gte("created_at", since).limit(800);
    const used = new Set(((recent as { content: string }[]) ?? []).map((r) => r.content));
    const fresh = POOL[kind].filter((t) => !used.has(t));
    const text = pick(fresh.length ? fresh : POOL[kind]);
    const { error: e } = await db.from("community_posts").insert({ author_id: pick(botIds), content: text });
    out.posted = !e;
  }

  // 2) replies under the bots' own recent posts
  const dayAgo = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { data: posts } = await db.from("community_posts").select("id, author_id, content, created_at").in("author_id", botIds).gte("created_at", dayAgo).order("created_at", { ascending: false }).limit(40);
  let budget = force ? 3 : 2;
  for (const p of (posts as { id: string; author_id: string; content: string; created_at: string }[]) ?? []) {
    if (budget <= 0) break;
    const kind = KIND_OF.get(p.content);
    if (!kind || kind === "faith") continue;
    if (Date.now() - new Date(p.created_at).getTime() < (force ? 0 : 12 * MIN)) continue;
    const { data: cs } = await db.from("community_post_comments").select("id, author_id, created_at").eq("post_id", p.id).order("created_at", { ascending: true });
    const comments = (cs as { id: string; author_id: string; created_at: string }[]) ?? [];
    const botComments = comments.filter((c) => botIds.includes(c.author_id));
    const lastAt = botComments.length ? new Date(botComments[botComments.length - 1].created_at).getTime() : 0;
    if (lastAt && Date.now() - lastAt < (force ? 0 : 10 * MIN)) continue;
    const rep = REPLIES[kind];

    if (botComments.length === 0) {
      // another bot reacts to the post
      const other = pick(botIds.filter((id) => id !== p.author_id));
      const { error: e } = await db.from("community_post_comments").insert({ post_id: p.id, author_id: other, content: fill(pick(rep.first), nick.get(p.author_id) ?? "teman") });
      if (!e) { await db.rpc("increment_comments_count", { post_id: p.id }); out.replies += 1; budget -= 1; }
    } else if (botComments.length === 1 && rep.answer.length && botComments[0].author_id !== p.author_id) {
      // the author answers
      const { error: e } = await db.from("community_post_comments").insert({
        post_id: p.id, author_id: p.author_id, parent_comment_id: botComments[0].id, content: fill(pick(rep.answer), nick.get(botComments[0].author_id) ?? "teman"),
      });
      if (!e) { await db.rpc("increment_comments_count", { post_id: p.id }); out.replies += 1; budget -= 1; }
    }
  }

  // 3) likes: real people's thoughts first
  const { data: recentPosts } = await db.from("community_posts").select("id, author_id").gte("created_at", dayAgo).order("created_at", { ascending: false }).limit(60);
  const all = (recentPosts as { id: string; author_id: string }[]) ?? [];
  const ids = all.map((x) => x.id);
  if (ids.length) {
    const { data: lk } = await db.from("community_post_likes").select("post_id, user_id").in("post_id", ids);
    const likes = (lk as { post_id: string; user_id: string }[]) ?? [];
    const botLikeCount = new Map<string, number>();
    for (const l of likes) if (botIds.includes(l.user_id)) botLikeCount.set(l.post_id, (botLikeCount.get(l.post_id) ?? 0) + 1);
    const real = all.filter((x) => !botIds.includes(x.author_id) && (botLikeCount.get(x.id) ?? 0) < 3);
    const mine = all.filter((x) => botIds.includes(x.author_id));
    const wanted = force ? 3 : 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < wanted; i++) {
      const target = (real.length && Math.random() < 0.65 ? pick(real) : mine.length ? pick(mine) : real.length ? pick(real) : null);
      if (!target) break;
      const likers = botIds.filter((b) => b !== target.author_id && !likes.some((l) => l.post_id === target.id && l.user_id === b));
      if (!likers.length) continue;
      const who = pick(likers);
      const { error: e } = await db.from("community_post_likes").insert({ post_id: target.id, user_id: who });
      if (!e) { likes.push({ post_id: target.id, user_id: who }); await db.rpc("increment_likes_count", { post_id: target.id }); out.likes += 1; }
    }
  }
  return out;
}
