import { getLanguage } from "@/lib/lang";
import SoakingPlayerClient from "@/components/faith/SoakingPlayerClient";

export const metadata = {
  title: "Ruang Soaking & Ketenangan | Ruang Iman",
  description: "Musik instrumen rohani & pembacaan firman untuk renungan malam dan ketenangan tidur.",
};

export default async function SoakingPage() {
  const lang = await getLanguage();
  return <SoakingPlayerClient lang={lang} />;
}
