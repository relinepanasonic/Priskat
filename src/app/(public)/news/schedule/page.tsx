import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/lang";
import MassScheduleLanding from "./MassScheduleLanding";

export const revalidate = 3600;

type Region = {
  province_slug: string;
  province_name: string;
  regency_slug: string;
  regency_name: string;
};

export default async function ChurchSchedulePage() {
  const supabase = await createClient();
  const lang = await getLanguage();

  const { data, count } = await supabase
    .from("mass_churches")
    .select("province_slug, province_name, regency_slug, regency_name", { count: "exact" });

  const rows = (data as Region[]) || [];

  // provinces (unique, sorted by name) with church counts
  const provinceMap = new Map<string, { slug: string; name: string; count: number }>();
  // regencies grouped by province slug
  const regenciesByProvince: Record<
    string,
    { slug: string; name: string; count: number }[]
  > = {};

  for (const r of rows) {
    const p = provinceMap.get(r.province_slug) || {
      slug: r.province_slug,
      name: r.province_name,
      count: 0,
    };
    p.count++;
    provinceMap.set(r.province_slug, p);

    const list = (regenciesByProvince[r.province_slug] ||= []);
    let reg = list.find((x) => x.slug === r.regency_slug);
    if (!reg) {
      reg = { slug: r.regency_slug, name: r.regency_name, count: 0 };
      list.push(reg);
    }
    reg.count++;
  }

  const provinces = [...provinceMap.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  for (const k of Object.keys(regenciesByProvince)) {
    regenciesByProvince[k].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <MassScheduleLanding
      provinces={provinces}
      regenciesByProvince={regenciesByProvince}
      totalChurches={count ?? rows.length}
      lang={lang}
    />
  );
}
