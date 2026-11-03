import { getLanguage } from "@/lib/lang";
import PicCard from "@/components/faith/PicCard";

export const metadata = { title: "Devosi" };

export default async function DevosiPage() {
  const isId = (await getLanguage()) === "id";
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>{isId ? "Devosi" : "Devotions"}</h1>
      <p className="mt-1 text-sm text-brand-muted">{isId ? "Devosi Katolik yang bisa kamu doakan setiap hari." : "Catholic devotions to pray every day."}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <PicCard tall href="/faith/prayers/rosario" title={isId ? "Rosario" : "Rosary"} text={isId ? "Doa rosario 3D" : "Guided rosary"} image="/images/prayers/rosario-bg.jpg" />
        <PicCard tall href="/faith/prayers/jalan-salib" title={isId ? "Jalan Salib" : "Stations of the Cross"} text={isId ? "14 perhentian" : "14 stations"} image="/images/prayers/jalan-salib/station-12.jpeg" />
        <PicCard tall href="/faith/intensi" title={isId ? "Intensi Doa" : "Prayer Intentions"} text={isId ? "Doakan dan didoakan" : "Pray and be prayed for"} image="/images/devotions/open-hands.jpeg" />
      </div>
    </div>
  );
}
