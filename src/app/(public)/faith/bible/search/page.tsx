import { getLanguage } from "@/lib/lang";
import BibleSearchClient from "@/components/faith/BibleSearchClient";

export const metadata = { title: "Cari di Alkitab" };

export default async function BibleSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; v?: string; whole?: string }>;
}) {
  const [{ q, v, whole }, lang] = await Promise.all([searchParams, getLanguage()]);
  const isId = lang === "id";
  return (
    <BibleSearchClient
      initialQuery={(q ?? "").slice(0, 60)}
      initialVersion={v ?? (isId ? "TB" : "NRSV-CE")}
      initialWhole={whole !== "0"}
      isId={isId}
    />
  );
}
