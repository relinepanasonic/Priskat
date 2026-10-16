import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush } from "@/lib/push";

// Called by the Supabase trigger in supabase/081 whenever a message is inserted.
export async function POST(request: Request) {
  const secret = process.env.PUSH_WEBHOOK_SECRET;
  if (!secret || request.headers.get("x-push-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { table, record } = (await request.json()) as {
    table: string;
    record: { author_id: string; content: string; thread_id?: string; subgroup_id?: string };
  };
  if (!record?.author_id) return NextResponse.json({ ok: true, skipped: "no record" });

  const db = createAdminClient();
  let recipients: string[] = [];
  let url = "/community/messages";
  let title = "";

  const { data: author } = await db.from("profiles").select("full_name, nama_panggilan").eq("id", record.author_id).maybeSingle();
  const authorName = (author as any)?.nama_panggilan || (author as any)?.full_name || "Seseorang";

  if (table === "dm_messages" && record.thread_id) {
    const { data: thread } = await db.from("dm_threads" as any).select("user_a, user_b").eq("id", record.thread_id).maybeSingle();
    if (thread) {
      const t = thread as any;
      recipients = [t.user_a, t.user_b].filter((id: string) => id !== record.author_id);
    }
    title = authorName;
    url = `/community/messages?u=${record.author_id}`;
  } else if (table === "group_messages" && record.subgroup_id) {
    const { data: sub } = await db.from("group_subgroups" as any).select("group_id, name, group:groups(name)").eq("id", record.subgroup_id).maybeSingle();
    const s = sub as any;
    if (s?.group_id) {
      const { data: members } = await db.from("group_members").select("user_id").eq("group_id", s.group_id).eq("status", "accepted");
      recipients = ((members as any[]) ?? []).map((m) => m.user_id).filter((id) => id !== record.author_id);
    }
    title = `${authorName} · ${s?.group?.name ?? s?.name ?? "Grup"}`;
    url = "/community/messages/group";
  } else {
    return NextResponse.json({ ok: true, skipped: table });
  }

  if (recipients.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const { data: rows } = await db.from("push_tokens" as any).select("token").in("user_id", recipients);
  const tokens = ((rows as any[]) ?? []).map((r) => r.token);
  const body = record.content.length > 140 ? `${record.content.slice(0, 137)}…` : record.content;
  const { sent, invalid } = await sendPush(tokens, { title, body, url });

  if (invalid.length) await db.from("push_tokens" as any).delete().in("token", invalid);
  return NextResponse.json({ ok: true, sent });
}
