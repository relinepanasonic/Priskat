import { getLanguage } from "@/lib/lang";
import PicCard from "@/components/faith/PicCard";

export const metadata = { title: "Hidup Doa" };

export default async function HidupDoaPage() {
  const isId = (await getLanguage()) === "id";
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>{isId ? "Hidup Doa" : "Prayer Life"}</h1>
      <p className="mt-1 text-sm text-brand-muted">{isId ? "Berdoa, merenung, dan mendengarkan." : "Pray, reflect and listen."}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <PicCard tall href="/faith/prayers" title={isId ? "Doa" : "Prayers"} text={isId ? "Doa harian dan doa dasar" : "Daily and basic prayers"} image="/images/spiritual/doa.webp" />
        <PicCard tall href="/faith/devotions" title={isId ? "Renungan" : "Devotion"} text={isId ? "Rencana renungan harian" : "Daily devotion plans"} image="/images/spiritual/renungan.webp" />
        <PicCard tall href="/faith/romo" title={isId ? "Kotbah Romo" : "Romo's Homilies"} text={isId ? "Doa, homili, dan video" : "Prayers, homilies, videos"} image="/images/spiritual/kotbah-romo.webp" />
        <PicCard tall href="/faith/prayers/sos" title={isId ? "SOS Doa" : "SOS Prayer"} text={isId ? "Doa saat butuh segera" : "Prayers for urgent moments"} image="/images/spiritual/sos-doa.webp" />
      </div>
    </div>
  );
}
