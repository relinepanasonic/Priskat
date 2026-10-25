import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * The weekly security review (a scheduled cloud agent) posts its report here.
 *   POST /api/security/report   header: x-report-secret: <SECURITY_REPORT_SECRET>
 *   body: { title, severity, summary, findings: [{ severity, title, file?, line?, detail, fix? }], commit_range?, pr_url? }
 * The report is stored for the founder's Security Log page. If anything high or critical was found,
 * an email goes to SECURITY_REPORT_EMAIL through Resend (RESEND_API_KEY).
 */
const LEVELS = ["none", "low", "medium", "high", "critical"] as const;
type Level = (typeof LEVELS)[number];
type Finding = { severity?: string; title?: string; file?: string; line?: number | string; detail?: string; fix?: string };

const clip = (s: unknown, n: number) => String(s ?? "").slice(0, n);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(request: Request) {
  const secret = process.env.SECURITY_REPORT_SECRET;
  const given = Buffer.from(request.headers.get("x-report-secret") ?? "");
  const expected = Buffer.from(secret ?? "");
  if (!secret || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const findings: Finding[] = Array.isArray(body?.findings) ? body.findings.slice(0, 100) : [];
  const clean = findings.map((f) => ({
    severity: LEVELS.includes(f.severity as Level) ? f.severity : "low",
    title: clip(f.title, 300),
    file: clip(f.file, 300),
    line: f.line ?? null,
    detail: clip(f.detail, 4000),
    fix: clip(f.fix, 4000),
  }));
  // Overall severity = the worst finding (or what the agent said, whichever is higher)
  const worst = clean.reduce((m, f) => Math.max(m, LEVELS.indexOf(f.severity as Level)), LEVELS.indexOf((LEVELS.includes(body?.severity) ? body.severity : "none") as Level));
  const severity: Level = LEVELS[Math.max(0, worst)];

  const report = {
    title: clip(body?.title || "Weekly security review", 300),
    severity,
    summary: clip(body?.summary, 8000),
    findings: clean,
    commit_range: clip(body?.commit_range, 200) || null,
    pr_url: clip(body?.pr_url, 500) || null,
  };

  // Email only when something serious was found
  let emailed = false;
  const to = process.env.SECURITY_REPORT_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;
  if ((severity === "high" || severity === "critical") && to && resendKey) {
    const rows = clean
      .filter((f) => f.severity === "high" || f.severity === "critical")
      .map((f) => `<li><b>[${esc(String(f.severity)).toUpperCase()}] ${esc(f.title)}</b>${f.file ? ` <code>${esc(f.file)}${f.line ? `:${esc(String(f.line))}` : ""}</code>` : ""}<br>${esc(f.detail)}</li>`)
      .join("");
    const html = `<div style="font-family:Arial,sans-serif">
      <h2 style="color:#b91c1c">Ruang Iman security alert: ${esc(severity.toUpperCase())}</h2>
      <p>${esc(report.summary || "")}</p>
      <ul>${rows}</ul>
      ${report.pr_url ? `<p>Proposed fix: <a href="${esc(report.pr_url)}">${esc(report.pr_url)}</a></p>` : ""}
      <p>Full report: <a href="https://apps.ruangiman.com/admin/security">apps.ruangiman.com/admin/security</a></p>
    </div>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.SECURITY_REPORT_FROM || "Ruang Iman Security <noreply@ruangiman.com>",
        to: [to],
        subject: `[${severity.toUpperCase()}] Ruang Iman security review: ${report.title}`,
        html,
      }),
    }).catch(() => null);
    emailed = !!res?.ok;
  }

  const db = createAdminClient();
  const { data, error } = await db.from("security_reports" as any).insert({ ...report, emailed }).select("id").single();
  if (error) return NextResponse.json({ error: error.message, emailed }, { status: 500 });
  return NextResponse.json({ ok: true, id: (data as any).id, severity, emailed });
}
