import { sendPush } from "@/lib/push";

type ProfileRow = {
  id: string;
  full_name: string | null;
  nama_panggilan: string | null;
  avatar_url: string | null;
  community_id: string | null;
  kota: string | null;
  is_bot?: boolean | null;
};

/**
 * Facebook-style Friend Suggestion push notifications.
 * Runs inside the 15-minute reminders cron at 19:00 local Jakarta time (WIB),
 * sending at most 1 suggestion every 3 days per user so it feels helpful and never spammy.
 */
export async function sendFriendSuggestions(db: any): Promise<number> {
  // Run only at 19:00–19:14 Jakarta time (UTC+7)
  const jakarta = new Date(Date.now() + 7 * 3600_000);
  if (jakarta.getUTCHours() !== 19 || jakarta.getUTCMinutes() >= 15) return 0;

  // 1. Users who actually have an app push token
  const { data: tokenRows } = await db.from("push_tokens").select("token, user_id");
  const tokensByUser = new Map<string, string[]>();
  for (const r of (tokenRows as { token: string; user_id: string }[]) ?? []) {
    const list = tokensByUser.get(r.user_id) ?? [];
    list.push(r.token);
    tokensByUser.set(r.user_id, list);
  }
  const recipientIds = [...tokensByUser.keys()];
  if (recipientIds.length === 0) return 0;

  // 2. Skip users who received a suggestion in the last 3 days
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600_000).toISOString();
  const { data: logs, error: logErr } = await db
    .from("friend_suggestion_log")
    .select("user_id, suggested_id, sent_at")
    .in("user_id", recipientIds);
  if (logErr) return 0; // 144_rich_push.sql not run yet

  const recentRecipient = new Set<string>();
  const alreadySuggested = new Map<string, Set<string>>();
  for (const row of (logs as { user_id: string; suggested_id: string; sent_at: string }[]) ?? []) {
    if (row.sent_at >= threeDaysAgo) recentRecipient.add(row.user_id);
    const set = alreadySuggested.get(row.user_id) ?? new Set<string>();
    set.add(row.suggested_id);
    alreadySuggested.set(row.user_id, set);
  }

  const eligibleRecipients = recipientIds.filter((id) => !recentRecipient.has(id));
  if (eligibleRecipients.length === 0) return 0;

  // 3. Load recipient profiles & candidate profiles (real people with a photo)
  const [{ data: recProfiles }, { data: candidates }, { data: friendships }] = await Promise.all([
    db.from("profiles").select("id, full_name, nama_panggilan, avatar_url, community_id, kota").in("id", eligibleRecipients),
    db.from("profiles")
      .select("id, full_name, nama_panggilan, avatar_url, community_id, kota, is_bot")
      .not("avatar_url", "is", null)
      .neq("avatar_url", "")
      .limit(300),
    db.from("friendships")
      .select("requester_id, receiver_id")
      .or(`requester_id.in.(${eligibleRecipients.join(",")}),receiver_id.in.(${eligibleRecipients.join(",")})`),
  ]);

  const pool = ((candidates as ProfileRow[]) ?? []).filter(
    (c) => !c.is_bot && c.avatar_url && /^https:\/\/.+/i.test(c.avatar_url) && (c.full_name || c.nama_panggilan),
  );
  if (pool.length === 0) return 0;

  const connectedByUser = new Map<string, Set<string>>();
  for (const f of (friendships as { requester_id: string; receiver_id: string }[]) ?? []) {
    const a = connectedByUser.get(f.requester_id) ?? new Set<string>();
    a.add(f.receiver_id);
    connectedByUser.set(f.requester_id, a);
    const b = connectedByUser.get(f.receiver_id) ?? new Set<string>();
    b.add(f.requester_id);
    connectedByUser.set(f.receiver_id, b);
  }

  let sentTotal = 0;
  const invalidTokens: string[] = [];

  for (const rec of (recProfiles as ProfileRow[]) ?? []) {
    const connected = connectedByUser.get(rec.id) ?? new Set<string>();
    const seen = alreadySuggested.get(rec.id) ?? new Set<string>();

    const options = pool.filter((c) => c.id !== rec.id && !connected.has(c.id) && !seen.has(c.id));
    if (options.length === 0) continue;

    // Prioritize same community or same city, then pick randomly among top tier
    const sameCommunity = rec.community_id ? options.filter((c) => c.community_id === rec.community_id) : [];
    const sameCity = rec.kota ? options.filter((c) => c.kota && c.kota.toLowerCase() === rec.kota!.toLowerCase()) : [];
    const tier = sameCommunity.length ? sameCommunity : sameCity.length ? sameCity : options;
    const pick = tier[Math.floor(Math.random() * tier.length)];

    const recName = rec.nama_panggilan || rec.full_name || "Sahabat";
    const pickName = pick.full_name || pick.nama_panggilan || "Anggota Ruang Iman";
    const tokens = tokensByUser.get(rec.id) ?? [];
    if (tokens.length === 0) continue;

    const res = await sendPush(tokens, {
      title: "Saran Teman Baru",
      body: `${recName}, kamu punya saran teman baru: ${pickName}`,
      url: `/community/friends?u=${pick.id}`,
      channel: "chat",
      avatar: pick.avatar_url,
      image: pick.avatar_url,
      actions: [
        { label: "Tambah Teman", url: `/community/friends?add=${pick.id}` },
        { label: "Lihat Profil", url: `/community/friends?u=${pick.id}` },
      ],
    });

    if (res.sent > 0) {
      sentTotal += res.sent;
      await db.from("friend_suggestion_log").upsert(
        { user_id: rec.id, suggested_id: pick.id, sent_at: new Date().toISOString() },
        { onConflict: "user_id,suggested_id" },
      );
    }
    invalidTokens.push(...res.invalid);
  }

  if (invalidTokens.length) {
    await db.from("push_tokens").delete().in("token", invalidTokens);
  }
  return sentTotal;
}
