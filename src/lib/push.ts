import { createSign } from "crypto";

// Firebase Cloud Messaging (HTTP v1). Needs FIREBASE_SERVICE_ACCOUNT: the service
// account JSON from Firebase Console → Project settings → Service accounts.

type ServiceAccount = { project_id: string; client_email: string; private_key: string };

let cached: { token: string; expires: number } | null = null;

function serviceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const sa = JSON.parse(raw);
    return { ...sa, private_key: String(sa.private_key).replace(/\\n/g, "\n") };
  } catch {
    return null;
  }
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

export type PushMessage = { title: string; body: string; url?: string };

/** Sends to each token; returns the tokens FCM says are no longer valid. */
export async function sendPush(tokens: string[], msg: PushMessage): Promise<{ sent: number; invalid: string[] }> {
  const sa = serviceAccount();
  if (!sa || tokens.length === 0) return { sent: 0, invalid: [] };
  const auth = await accessToken(sa);
  const invalid: string[] = [];
  let sent = 0;

  await Promise.all(tokens.map(async (token) => {
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          token,
          notification: { title: msg.title, body: msg.body },
          data: { url: msg.url ?? "/" },
          android: { priority: "high", notification: { channel_id: "messages", color: "#D6B072" } },
        },
      }),
    });
    if (res.ok) { sent++; return; }
    const text = await res.text();
    // Only drop tokens FCM says are gone; other errors (e.g. a bad payload) must not wipe tokens
    if (res.status === 404 || text.includes("UNREGISTERED") || text.includes("registration token is not a valid")) invalid.push(token);
    else console.error("FCM send failed", res.status, text);
  }));
  return { sent, invalid };
}
