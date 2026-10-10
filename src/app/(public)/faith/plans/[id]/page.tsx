import { getLanguage } from "@/lib/lang";
import PlanDetailClient from "@/components/faith/PlanDetailClient";

export const metadata = {
  title: "Detail Rencana Baca | Ruang Iman",
  description: "BACA Alkitab harian dan renungan harian berstruktur.",
};

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const lang = await getLanguage();
  const resolvedParams = await params;
  return <PlanDetailClient planId={resolvedParams.id} lang={lang} />;
}
