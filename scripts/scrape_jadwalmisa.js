/**
 * One-time scraper for jadwalmisa.id Mass schedules.
 *
 * Strategy (light on their servers): the church-detail SSG endpoint
 *   /_next/data/<buildId>/cari/<province>/<regency>.json
 * returns EVERY church in that regency with full schedules. So we only need
 * one request per regency (~284) instead of one per church (~875).
 *
 * Output: scratch/jadwalmisa_churches.json
 *
 *   node scripts/scrape_jadwalmisa.js
 */

const fs = require("fs");
const path = require("path");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const BASE = "https://jadwalmisa.id";
const OUT = path.join(__dirname, "..", "scratch", "jadwalmisa_churches.json");
const SLEEP_MS = 300;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, asJson = false) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return asJson ? res.json() : res.text();
}

async function getBuildId() {
  const html = await get(BASE + "/");
  const m = html.match(/"buildId":"([^"]+)"/);
  if (!m) throw new Error("Could not read buildId from homepage");
  return m[1];
}

async function getRegencyPairs() {
  const xml = await get(BASE + "/gereja-sitemap.xml");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const pairs = new Set();
  for (const loc of locs) {
    const rest = loc.replace(BASE + "/cari/", "");
    const parts = rest.split("/");
    if (parts.length >= 3) pairs.add(parts[0] + "/" + parts[1]);
  }
  return [...pairs].sort();
}

function normalizeChurch(c) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    address: c.address || null,
    maps_url: c.maps_url || null,
    image_url: c.image?.file
      ? `${BASE}/api/file?name=${encodeURIComponent(c.image.file)}`
      : null,
    time_zone: c.timeZone || null,
    province_slug: c.province?.slug || null,
    province_name: c.provinceName || c.province?.name || null,
    regency_slug: c.regency?.slug || null,
    regency_name: c.regencyName || c.regency?.name || null,
    schedules: (c.schedules || []).map((s) => ({
      title: (s.title || "").trim(),
      times: (s.time || []).map((t) => (t.start || "").trim()).filter(Boolean),
      is_special: !!s.is_special,
    })),
    special_schedules: (c.specialSchedules || []).map((s) => ({
      title: (s.title || "").trim(),
      date: s.date || null,
      times: (s.time || []).map((t) => (t.start || "").trim()).filter(Boolean),
    })),
    source_url: c.province?.slug
      ? `${BASE}/cari/${c.province.slug}/${c.regency.slug}/${c.slug}`
      : null,
  };
}

async function main() {
  const buildId = await getBuildId();
  console.log("buildId:", buildId);

  const pairs = await getRegencyPairs();
  console.log("regency pages to fetch:", pairs.length);

  const byId = new Map();
  let done = 0;
  for (const pair of pairs) {
    const url = `${BASE}/_next/data/${buildId}/cari/${pair}.json`;
    try {
      const json = await get(url, true);
      const churches = json?.pageProps?.data || [];
      for (const c of churches) {
        if (c && c.id != null && !byId.has(c.id)) byId.set(c.id, normalizeChurch(c));
      }
      done++;
      if (done % 20 === 0 || done === pairs.length)
        console.log(`  ${done}/${pairs.length} regencies — ${byId.size} churches`);
    } catch (e) {
      console.warn("  !", pair, e.message);
    }
    await sleep(SLEEP_MS);
  }

  const list = [...byId.values()].sort((a, b) => a.id - b.id);
  fs.writeFileSync(OUT, JSON.stringify(list, null, 2));
  console.log(`\nWrote ${list.length} churches -> ${path.relative(process.cwd(), OUT)}`);

  const provinces = new Set(list.map((c) => c.province_name).filter(Boolean));
  console.log("provinces:", provinces.size);
  const withSched = list.filter((c) => c.schedules.length).length;
  console.log("churches with >=1 regular schedule:", withSched);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
