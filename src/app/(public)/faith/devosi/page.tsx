import { getLanguage } from "@/lib/lang";
import PicCard from "@/components/faith/PicCard";
import { TRADISI } from "@/lib/spiritualNames";

export const metadata = { title: TRADISI.id.name };

export default async function TradisiPage() {
  const isId = (await getLanguage()) === "id";
  const t = isId ? TRADISI.id : TRADISI.en;
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>{t.name}</h1>
      <p className="mt-1 text-sm text-brand-muted">{isId ? "Doa-doa tradisi Gereja yang bisa kamu doakan setiap hari." : "Traditional prayers of the Church to pray every day."}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <PicCard tall href="/faith/prayers/rosario" title={isId ? "Rosario" : "Rosary"} text={isId ? "Doa rosario 3D" : "Guided rosary"} image="/images/spiritual/rosario.webp" />
        <PicCard tall href="/faith/prayers/jalan-salib" title={isId ? "Jalan Salib" : "Stations of the Cross"} text={isId ? "14 perhentian" : "14 stations"} image="/images/spiritual/jalan-salib.webp" />
      </div>
    </div>
  );
}
