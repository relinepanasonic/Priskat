import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Google Calendar for event registrations. The Ruang Iman Gmail (connected once at /api/google/connect) owns one calendar
 * event per Ruang Iman event and invites every registrant by email, so it lands in their own calendar.
 * Everything here is best effort: when it is not connected or Google is down, registration still works.
 */

const API = "https://www.googleapis.com/calendar/v3";

export const googleConfigured = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI);

async function accessToken(): Promise<string | null> {
  if (!googleConfigured()) return null;
  const db = createAdminClient() as any;
  const { data } = await db.from("google_calendar_link").select("refresh_token").eq("id", true).maybeSingle();
  const refresh = (data as { refresh_token?: string } | null)?.refresh_token;
  if (!refresh) return null;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, refresh_token: refresh, grant_type: "refresh_token" }),
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { access_token?: string };
  return j.access_token ?? null;
}

const calendarId = () => encodeURIComponent(process.env.GOOGLE_CALENDAR_ID || "primary");

type Ev = { id: string; title: string; event_date: string | null; end_date: string | null; location: string | null; maps_url?: string | null };

function body(ev: Ev) {
  const start = new Date(ev.event_date as string);
  const end = ev.end_date && !isNaN(new Date(ev.end_date).getTime()) ? new Date(ev.end_date) : new Date(start.getTime() + 3 * 3600_000);
  return {
    summary: ev.title,
    location: ev.location ?? undefined,
    description: `Tiket QR ada di Ruang Iman (apps.ruangiman.com). Mohon bawa QR Code saat hadir.${ev.maps_url ? `\nPeta: ${ev.maps_url}` : ""}`,
    start: { dateTime: start.toISOString(), timeZone: "Asia/Jakarta" },
    end: { dateTime: end.toISOString(), timeZone: "Asia/Jakarta" },
    guestsCanSeeOtherGuests: false,
    guestsCanInviteOthers: false,
  };
}

/** Adds the person as a guest of the event in the Ruang Iman calendar (made on first use). Returns true when they were invited. */
export async function inviteToCalendar(eventId: string, email: string, name: string): Promise<boolean> {
  try {
    const token = await accessToken();
    if (!token) return false;
    const db = createAdminClient() as any;
    const { data: row } = await db.from("events").select("id, title, event_date, end_date, location, maps_url").eq("id", eventId).maybeSingle();
    const ev = row as Ev | null;
    if (!ev || !ev.event_date || isNaN(new Date(ev.event_date).getTime())) return false;
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const { data: map } = await db.from("event_google_calendar").select("google_event_id").eq("event_id", eventId).maybeSingle();
    let gid = (map as { google_event_id?: string } | null)?.google_event_id ?? "";

    let current: { attendees?: { email: string; displayName?: string }[] } | null = null;
    if (gid) {
      const r = await fetch(`${API}/calendars/${calendarId()}/events/${gid}`, { headers });
      if (r.ok) current = await r.json(); else gid = ""; // deleted in Google: make a new one
    }
    if (!gid) {
      const r = await fetch(`${API}/calendars/${calendarId()}/events?sendUpdates=none`, { method: "POST", headers, body: JSON.stringify(body(ev)) });
      if (!r.ok) return false;
      gid = ((await r.json()) as { id: string }).id;
      current = { attendees: [] };
      await db.from("event_google_calendar").upsert({ event_id: eventId, google_event_id: gid }, { onConflict: "event_id" });
    }

    const attendees = current?.attendees ?? [];
    if (attendees.some((a) => a.email.toLowerCase() === email.toLowerCase())) return true;
    const r = await fetch(`${API}/calendars/${calendarId()}/events/${gid}?sendUpdates=all`, {
      method: "PATCH", headers, body: JSON.stringify({ attendees: [...attendees, { email, displayName: name }] }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
