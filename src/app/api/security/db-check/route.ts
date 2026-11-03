import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Live database check for the weekly security review (a scheduled cloud agent).
 *   GET /api/security/db-check   header: x-report-secret: <SECURITY_REPORT_SECRET>
 * Returns public.security_snapshot(): tables without RLS, open write policies, risky definer functions, etc.
 * Catalog only, never member data. The agent gets no database password.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.SECURITY_REPORT_SECRET;
  const given = Buffer.from(request.headers.get("x-report-secret") ?? "");
  const expected = Buffer.from(secret ?? "");
  if (!secret || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await createAdminClient().rpc("security_snapshot" as any);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
