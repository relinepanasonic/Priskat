import { redirect } from "next/navigation";
import { ShieldCheck, ShieldAlert, ExternalLink, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Security Log" };

type Finding = { severity: string; title: string; file?: string; line?: number | string | null; detail?: string; fix?: string };
type Report = {
  id: string;
  created_at: string;
  title: string;
  severity: string;
  summary: string | null;
  findings: Finding[];
  commit_range: string | null;
  pr_url: string | null;
  emailed: boolean;
};

const BADGE: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-red-500/20 text-red-300 border border-red-500/40",
  medium: "bg-amber-500/20 text-amber-200 border border-amber-500/40",
  low: "bg-sky-500/15 text-sky-200 border border-sky-500/30",
  none: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
};

/** Founder-only log of the weekly automated security reviews. */
export default async function SecurityLogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (String(me?.role ?? "") !== "founder") redirect("/admin");

  const { data, error } = await supabase
    .from("security_reports" as any)
    .select("id, created_at, title, severity, summary, findings, commit_range, pr_url, emailed")
    .order("created_at", { ascending: false })
    .limit(100);
  const reports = ((data as unknown) as Report[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><ShieldCheck className="h-6 w-6 text-brand-gold" /> Security Log</h1>
        <p className="mt-1 text-sm text-brand-muted">Laporan mingguan dari pemeriksaan keamanan otomatis (setiap Senin 08.00 WIB). Temuan high/critical juga dikirim lewat email.</p>
      </div>

      {error && <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">Tabel laporan belum ada. Jalankan supabase/093_security_reports.sql.</p>}
      {!error && reports.length === 0 && (
        <p className="rounded-2xl border border-[#333] bg-[#1a1d24] p-8 text-center text-sm text-brand-muted">Belum ada laporan. Laporan pertama muncul setelah pemeriksaan Senin berikutnya.</p>
      )}

      <div className="space-y-3">
        {reports.map((r) => (
          <details key={r.id} className="group rounded-2xl border border-[#333] bg-[#1a1d24]" open={reports[0]?.id === r.id}>
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
              {r.severity === "none" ? <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" /> : <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{r.title}</p>
                <p className="text-xs text-brand-muted">
                  {new Date(r.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })}
                  {r.commit_range ? ` · ${r.commit_range}` : ""} · {r.findings?.length ?? 0} temuan
                </p>
              </div>
              {r.emailed && <Mail className="h-4 w-4 shrink-0 text-brand-muted" aria-label="Email terkirim" />}
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${BADGE[r.severity] ?? BADGE.low}`}>{r.severity}</span>
            </summary>

            <div className="space-y-3 border-t border-[#2a2d35] p-4">
              {r.summary && <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">{r.summary}</p>}
              {r.pr_url && (
                <a href={r.pr_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-gold">
                  Lihat usulan perbaikan (pull request) <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {(r.findings ?? []).map((f, i) => (
                <div key={i} className="rounded-xl border border-[#2a2d35] bg-[#14171c] p-3">
                  <div className="flex items-start gap-2">
                    <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${BADGE[f.severity] ?? BADGE.low}`}>{f.severity}</span>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                  </div>
                  {f.file && <p className="mt-1 font-mono text-xs text-brand-muted">{f.file}{f.line ? `:${f.line}` : ""}</p>}
                  {f.detail && <p className="mt-2 whitespace-pre-line text-sm text-gray-300">{f.detail}</p>}
                  {f.fix && <p className="mt-2 whitespace-pre-line text-sm text-emerald-200/90"><b>Perbaikan:</b> {f.fix}</p>}
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
