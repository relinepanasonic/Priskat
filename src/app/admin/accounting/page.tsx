import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import AccountingClient, { type FinanceEntry } from "./AccountingClient";

export const dynamic = "force-dynamic";

export default async function AdminAccountingPage() {
  const supabase = (await createClient()) as any;
  const [{ data: { user } }, lang, entriesRes] = await Promise.all([
    supabase.auth.getUser(),
    getLanguage(),
    supabase
      .from("erp_finance_entries")
      .select("*")
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(300),
  ]);

  const needsSql = Boolean(entriesRes.error && /erp_finance_entries/i.test(entriesRes.error.message ?? ""));

  return (
    <AccountingClient
      initialEntries={(entriesRes.data as FinanceEntry[] | null) ?? []}
      userId={user?.id ?? null}
      needsSql={needsSql}
      lang={lang}
    />
  );
}
