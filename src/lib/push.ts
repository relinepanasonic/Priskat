import { createSign } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Firebase Cloud Messaging (HTTP v1). Needs FIREBASE_SERVICE_ACCOUNT: the service
// account JSON from Firebase Console → Project settings → Service accounts.

type ServiceAccount = { project_id: string; client_email: string; private_key: string };

let cached: { token: string; expires: number } | null = null;

/** Why the key cannot be used (never its content): null when it is fine. */
export let pushConfigProblem: string | null = null;

/**
 * Reads FIREBASE_SERVICE_ACCOUNT and forgives the usual paste mistakes: the whole value wrapped in quotes,
 * real line breaks inside the private key, or the file pasted as base64.
 */
function serviceAccount(): ServiceAccount | null {
  let raw = (process.env.FIREBASE_SERVICE_ACCOUNT ?? "").trim();
  if (!raw) { pushConfigProblem = "missing"; return null; }
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"') && !raw.startsWith('"{'))) raw = raw.slice(1, -1).trim();
  if (raw.startsWith('"{')) { try { raw = JSON.parse(raw); } catch { /* keep */ } }
  if (!raw.startsWith("{")) {
    try { const decoded = Buffer.from(raw, "base64").toString("utf8").trim(); if (decoded.startsWith("{")) raw = decoded; } catch { /* keep */ }
  }
  let sa: Record<string, unknown> | null = null;
  try {
    sa = JSON.parse(raw);
  } catch {
    // real line breaks inside the private key make the JSON invalid: turn them back into \n
    const fixed = raw.replace(/("private_key"\s*:\s*")([\s\S]*?)(")/, (_m, a: string, key: string, b: string) => a + key.replace(/\r?\n/g, "\\n") + b);
    try { sa = JSON.parse(fixed); } catch { pushConfigProblem = "invalid_json"; return null; }
  }
  if (!sa || !sa.project_id || !sa.client_email || !sa.private_key) { pushConfigProblem = "missing_fields"; return null; }
  if (sa.project_id !== "ruang-iman") { pushConfigProblem = `wrong_project:${String(sa.project_id)}`; }
  else pushConfigProblem = null;
  return { project_id: String(sa.project_id), client_email: String(sa.client_email), private_key: String(sa.private_key).replace(/\\n/g, "\n") };
}

const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url");

async function accessToken(sa: ServiceAccount) {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const signature = createSign("RSA-SHA256").update(`${header}.${claims}`).sign(sa.private_key);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${b64url(signature)}`,
    }),
  });
  if (!res.ok) throw new Error(`FCM auth failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  cached = { token: json.access_token, expires: Date.now() + json.expires_in * 1000 };
  return cached.token;
}

/**
 * channel:
 *   "prayer" = prayer reminders and "chat" = chat and friends: each person chooses sound or vibrate only (prayer_reminders.prayer_mode / chat_mode)
 *   "auto"   = the automatic ones: the app's tone, and the phone decides (tone, vibrate or silent by its own setting)
 *   "messages" (default) = the plain channel
 * Older app builds do not have the newer channels; Android then falls back to its default channel.
 */
export type PushMessage = { title: string; body: string; url?: string; channel?: "messages" | "chat" | "prayer" | "auto" };

/** Each token's choice for "prayer" or "chat": sound (default) or vibrate only. */
async function modesFor(tokens: string[], kind: "chat" | "prayer"): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  try {
    const db = createAdminClient() as any;
    const { data: tk } = await db.from("push_tokens").select("token, user_id").in("token", tokens);
    const owner = new Map<string, string>(((tk as { token: string; user_id: string }[]) ?? []).map((r) => [r.token, r.user_id]));
    const ids = [...new Set(owner.values())];
    if (ids.length === 0) return out;
    const { data: pr, error } = await db.from("prayer_reminders").select(`user_id, ${kind}_mode`).in("user_id", ids);
    if (error) return out; // 137_notification_sound_mode.sql not run yet: everybody gets sound
    const mode = new Map<string, string>(((pr as Record<string, string>[]) ?? []).map((r) => [r.user_id, r[`${kind}_mode`]]));
    for (const [token, uid] of owner) out.set(token, mode.get(uid) ?? "sound");
  } catch { /* everybody gets sound */ }
  return out;
}

/** Sends to each token; returns the tokens FCM says are no longer valid. */
export async function sendPush(tokens: string[], msg: PushMessage): Promise<{ sent: number; invalid: string[]; errors: string[]; configured: boolean }> {
  const sa = serviceAccount();
  if (!sa) return { sent: 0, invalid: [], errors: [], configured: false };
  if (tokens.length === 0) return { sent: 0, invalid: [], errors: [], configured: true };
  const errors: string[] = [];
  const auth = await accessToken(sa);
  const invalid: string[] = [];
  let sent = 0;

  const modes = msg.channel === "chat" || msg.channel === "prayer" ? await modesFor(tokens, msg.channel) : null;
  const channelOf = (token: string) => {
    if (msg.channel === "auto") return "auto";
    if (msg.channel === "chat" || msg.channel === "prayer") return `${msg.channel}_${modes?.get(token) === "vibrate" ? "vibrate" : "sound"}`;
    return "messages";
  };

  await Promise.all(tokens.map(async (token) => {
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          token,
          notification: { title: msg.title, body: msg.body },
          data: { url: msg.url ?? "/" },
          android: { priority: "high", notification: { channel_id: channelOf(token), color: "#D6B072" } },
        },
      }),
    });
    if (res.ok) { sent++; return; }
    const text = await res.text();
    // Only drop tokens FCM says are gone; other errors (e.g. a bad payload) must not wipe tokens
    if (res.status === 404 || text.includes("UNREGISTERED") || text.includes("registration token is not a valid")) invalid.push(token);
    else console.error("FCM send failed", res.status, text);
    errors.push(`${res.status} ${(text.match(/"status":\s*"([A-Z_]+)"/)?.[1] ?? text.slice(0, 120))}`);
  }));
  return { sent, invalid, errors, configured: true };
}
