/** Rough coordinates [lng, lat] of Indonesian cities and provinces, used to place coverage pins on the map. */
const CITIES: Record<string, [number, number]> = {
  jakarta: [106.8456, -6.2088], bogor: [106.806, -6.595], depok: [106.8186, -6.4025], tangerang: [106.6319, -6.1783],
  bekasi: [106.9896, -6.2383], bandung: [107.6191, -6.9175], cirebon: [108.5571, -6.7063], sukabumi: [106.9267, -6.9277],
  semarang: [110.4203, -6.9667], solo: [110.8245, -7.5755], surakarta: [110.8245, -7.5755], yogyakarta: [110.3695, -7.7956],
  jogja: [110.3695, -7.7956], magelang: [110.2178, -7.4797], purwokerto: [109.2344, -7.4214], salatiga: [110.4929, -7.3305],
  surabaya: [112.7508, -7.2575], malang: [112.6304, -7.9666], kediri: [112.0162, -7.848], jember: [113.7002, -8.1845],
  madiun: [111.5239, -7.6298], denpasar: [115.2167, -8.65], bali: [115.2167, -8.65], mataram: [116.1167, -8.5833],
  kupang: [123.607, -10.1772], ende: [121.65, -8.84], maumere: [122.2128, -8.62], ruteng: [120.4667, -8.6167],
  labuanbajo: [119.887, -8.4963], larantuka: [122.995, -8.35], atambua: [124.8933, -9.1061], waingapu: [120.2642, -9.6567],
  medan: [98.6722, 3.5952], pematangsiantar: [99.0687, 2.9595], sibolga: [98.7792, 1.7427], padang: [100.3543, -0.9471],
  pekanbaru: [101.4478, 0.5071], batam: [104.0305, 1.0456], tanjungpinang: [104.4455, 0.9186], jambi: [103.6131, -1.6101],
  palembang: [104.7458, -2.9761], bengkulu: [102.2655, -3.7956], bandarlampung: [105.261, -5.4292], lampung: [105.261, -5.4292],
  pangkalpinang: [106.1056, -2.1316], pontianak: [109.3425, -0.0263], singkawang: [108.9873, 0.9065], sintang: [111.4947, 0.0866],
  palangkaraya: [113.9213, -2.2161], banjarmasin: [114.5933, -3.3186], balikpapan: [116.8312, -1.2379], samarinda: [117.1536, -0.5022],
  tarakan: [117.5787, 3.3], manado: [124.8413, 1.4748], tomohon: [124.8408, 1.3249], palu: [119.8707, -0.9003],
  makassar: [119.4327, -5.1477], makasar: [119.4327, -5.1477], kendari: [122.5149, -3.9985], gorontalo: [123.0568, 0.5435],
  ambon: [128.1814, -3.6954], ternate: [127.3817, 0.7893], sorong: [131.261, -0.8762], manokwari: [134.062, -0.8615],
  jayapura: [140.7181, -2.5337], merauke: [140.4, -8.4667], timika: [136.889, -4.5466], biak: [136.0833, -1.1833],
  bandaaceh: [95.3222, 5.5483], mamuju: [118.8909, -2.6741], mamasa: [119.3667, -2.9333], toraja: [119.8667, -3.0],
  rantepao: [119.8944, -2.9722], kasri: [114.0, -2.0],
};

const PROVINCES: Record<string, [number, number]> = {
  aceh: [96.7, 4.2], sumaterautara: [99.0, 2.2], sumaterabarat: [100.4, -0.9], riau: [101.7, 0.6], kepulauanriau: [104.5, 0.9],
  jambi: [102.7, -1.6], sumateraselatan: [104.0, -3.2], bengkulu: [102.3, -3.8], lampung: [105.0, -4.9],
  bangkabelitung: [106.5, -2.4], kepulauanbangkabelitung: [106.5, -2.4], dkijakarta: [106.85, -6.2], jakarta: [106.85, -6.2],
  banten: [106.1, -6.4], jawabarat: [107.6, -6.9], jawatengah: [110.0, -7.3], diyogyakarta: [110.4, -7.9], yogyakarta: [110.4, -7.9],
  jawatimur: [112.5, -7.6], bali: [115.2, -8.4], nusatenggarabarat: [117.0, -8.6], nusatenggaratimur: [121.5, -9.5],
  kalimantanbarat: [110.8, -0.3], kalimantantengah: [113.5, -1.7], kalimantanselatan: [115.3, -3.0], kalimantantimur: [116.6, 0.5],
  kalimantanutara: [116.0, 3.0], sulawesiutara: [124.5, 1.0], gorontalo: [122.4, 0.7], sulawesitengah: [120.8, -1.4],
  sulawesibarat: [119.3, -2.5], sulawesiselatan: [120.0, -3.8], sulawesitenggara: [122.2, -4.0], maluku: [129.0, -3.2],
  malukuutara: [127.8, 1.2], papuabarat: [132.9, -1.3], papua: [138.0, -4.5], papuaselatan: [139.5, -7.5], papuatengah: [136.5, -4.0],
};

const norm = (s: string | null | undefined) => (s ?? "").toLowerCase().replace(/^(kota|kab\.?|kabupaten)\s+/, "").replace(/[^a-z]/g, "");

/** Position for a branch: its city if known, otherwise the middle of its province, otherwise null. */
export function branchPosition(kota: string, provinsi: string, branch?: string | null): [number, number] | null {
  for (const name of [branch, kota]) {
    const c = CITIES[norm(name)];
    if (c) return c;
  }
  return PROVINCES[norm(provinsi)] ?? null;
}
