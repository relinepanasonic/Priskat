import { getLanguage } from "@/lib/lang";
import PlansListClient from "@/components/faith/PlansListClient";

export const metadata = {
  title: "Rencana Baca Alkitab | Ruang Iman",
  description: "Perjalanan baca Alkitab harian berstruktur untuk pertumbuhan rohani.",
};

export default async function PlansPage() {
  const lang = await getLanguage();
  return <PlansListClient lang={lang} />;
}
