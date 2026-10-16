// Catholic Indonesia community: identity, dioceses and history content.
// DIOCESE_SEED is the starting data for the `dioceses` table (supabase/080).
// Admins keep bishop details current from the Uskup page; pages fall back to
// this seed if the table hasn't been created yet.

export const CATHOLIC_INDONESIA = "catholic indonesia";

export function isCatholicIndonesia(name?: string | null, slug?: string | null) {
  const n = (name ?? "").trim().toLowerCase();
  const s = (slug ?? "").trim().toLowerCase().replace(/[-_]/g, "");
  return n === CATHOLIC_INDONESIA || s === "catholicindonesia";
}

export type Diocese = {
  id?: string;
  name: string;
  kind: "keuskupan_agung" | "keuskupan" | "ordinariat";
  province: string; // ecclesiastical province (metropolitan see)
  city: string;
  lat: number | null;
  lng: number | null;
  cathedral: string | null;
  bishop_name: string | null;
  bishop_note: string | null; // e.g. "Uskup Agung", "Administrator Apostolik"
  bishop_photo_url?: string | null;
  website?: string | null;
  sort_order: number;
};

const d = (
  sort_order: number,
  name: string,
  kind: Diocese["kind"],
  province: string,
  city: string,
  lat: number | null,
  lng: number | null,
  cathedral: string | null,
  bishop_name: string | null,
  bishop_note: string | null = kind === "keuskupan_agung" ? "Uskup Agung" : kind === "keuskupan" ? "Uskup" : null
): Diocese => ({ sort_order, name, kind, province, city, lat, lng, cathedral, bishop_name, bishop_note });

/** 38 dioceses in 10 ecclesiastical provinces, plus the Military Ordinariate. */
export const DIOCESE_SEED: Diocese[] = [
  // Provinsi Gerejawi Medan
  d(10, "Keuskupan Agung Medan", "keuskupan_agung", "Medan", "Medan", 3.5952, 98.6722, "Katedral Santa Maria Tak Bernoda", "Mgr. Kornelius Sipayung, OFMCap"),
  d(11, "Keuskupan Sibolga", "keuskupan", "Medan", "Sibolga", 1.7427, 98.7792, null, "Mgr. Fransiskus Tuaman Sasfo Sinaga"),
  d(12, "Keuskupan Padang", "keuskupan", "Medan", "Padang", -0.9471, 100.4172, null, "Mgr. Vitus Rubianto Solichin, SX"),
  // Provinsi Gerejawi Palembang
  d(20, "Keuskupan Agung Palembang", "keuskupan_agung", "Palembang", "Palembang", -2.9761, 104.7754, "Katedral Santa Maria", "Mgr. Yohanes Harun Yuwono"),
  d(21, "Keuskupan Pangkalpinang", "keuskupan", "Palembang", "Pangkalpinang", -2.1291, 106.109, null, "Mgr. Adrianus Sunarko, OFM"),
  d(22, "Keuskupan Tanjungkarang", "keuskupan", "Palembang", "Bandar Lampung", -5.4292, 105.261, null, "Mgr. Vinsensius Setiawan Triatmojo"),
  // Provinsi Gerejawi Jakarta
  d(30, "Keuskupan Agung Jakarta", "keuskupan_agung", "Jakarta", "Jakarta", -6.1693, 106.8331, "Katedral Santa Maria Diangkat ke Surga", "Ignatius Kardinal Suharyo"),
  d(31, "Keuskupan Bandung", "keuskupan", "Jakarta", "Bandung", -6.9147, 107.6098, "Katedral Santo Petrus", "Mgr. Antonius Subianto Bunjamin, OSC"),
  d(32, "Keuskupan Bogor", "keuskupan", "Jakarta", "Bogor", -6.595, 106.797, "Katedral Beatae Mariae Virginis", "Mgr. Paskalis Bruno Syukur, OFM"),
  // Provinsi Gerejawi Semarang
  d(40, "Keuskupan Agung Semarang", "keuskupan_agung", "Semarang", "Semarang", -6.9824, 110.4093, "Katedral Santa Perawan Maria Ratu Rosario Suci", "Mgr. Robertus Rubiyatmoko"),
  d(41, "Keuskupan Purwokerto", "keuskupan", "Semarang", "Purwokerto", -7.4245, 109.2396, null, "Mgr. Christophorus Tri Harsono"),
  d(42, "Keuskupan Malang", "keuskupan", "Semarang", "Malang", -7.9666, 112.6326, "Katedral Santa Perawan Maria dari Gunung Karmel", "Mgr. Henricus Pidyarto Gunawan, O.Carm"),
  d(43, "Keuskupan Surabaya", "keuskupan", "Semarang", "Surabaya", -7.2575, 112.7521, "Katedral Hati Kudus Yesus", "Mgr. Agustinus Tri Budi Utomo"),
  // Provinsi Gerejawi Pontianak
  d(50, "Keuskupan Agung Pontianak", "keuskupan_agung", "Pontianak", "Pontianak", -0.0263, 109.3425, "Katedral Santo Yosef", "Mgr. Agustinus Agus"),
  d(51, "Keuskupan Ketapang", "keuskupan", "Pontianak", "Ketapang", -1.85, 109.9833, null, "Mgr. Pius Riana Prapdi"),
  d(52, "Keuskupan Sanggau", "keuskupan", "Pontianak", "Sanggau", 0.124, 110.597, null, "Mgr. Valentinus Saeng, CP"),
  d(53, "Keuskupan Sintang", "keuskupan", "Pontianak", "Sintang", 0.07, 111.5, null, "Mgr. Samuel Oton Sidin, OFMCap"),
  // Provinsi Gerejawi Samarinda
  d(60, "Keuskupan Agung Samarinda", "keuskupan_agung", "Samarinda", "Samarinda", -0.5022, 117.1536, null, "Mgr. Yustinus Harjosusanto, MSF"),
  d(61, "Keuskupan Banjarmasin", "keuskupan", "Samarinda", "Banjarmasin", -3.3186, 114.5944, null, "Mgr. Victorius Dwiardy, OFMCap"),
  d(62, "Keuskupan Palangkaraya", "keuskupan", "Samarinda", "Palangka Raya", -2.2161, 113.9135, null, "Mgr. Aloysius Maryadi Sutrisnaatmaka, MSF"),
  d(63, "Keuskupan Tanjung Selor", "keuskupan", "Samarinda", "Tanjung Selor", 2.8375, 117.3653, null, "Mgr. Paulinus Yan Olla, MSF"),
  // Provinsi Gerejawi Makassar
  d(70, "Keuskupan Agung Makassar", "keuskupan_agung", "Makassar", "Makassar", -5.1477, 119.4327, "Katedral Hati Yesus Yang Mahakudus", "Mgr. Fransiskus Nipa"),
  d(71, "Keuskupan Amboina", "keuskupan", "Makassar", "Ambon", -3.6954, 128.1814, "Katedral Santo Fransiskus Xaverius", "Mgr. Seno Ngutra"),
  d(72, "Keuskupan Manado", "keuskupan", "Makassar", "Manado", 1.4748, 124.8421, null, "Mgr. Benedictus Estephanus Rolly Untu, MSC"),
  // Provinsi Gerejawi Ende
  d(80, "Keuskupan Agung Ende", "keuskupan_agung", "Ende", "Ende", -8.8432, 121.6623, null, "Mgr. Paulus Budi Kleden, SVD"),
  d(81, "Keuskupan Denpasar", "keuskupan", "Ende", "Denpasar", -8.6705, 115.2126, "Katedral Roh Kudus", "Mgr. Silvester San"),
  d(82, "Keuskupan Larantuka", "keuskupan", "Ende", "Larantuka", -8.35, 122.9833, "Katedral Reinha Rosari", "Mgr. Fransiskus Kopong Kung"),
  d(83, "Keuskupan Maumere", "keuskupan", "Ende", "Maumere", -8.6199, 122.2111, null, "Mgr. Ewaldus Martinus Sedu"),
  d(84, "Keuskupan Ruteng", "keuskupan", "Ende", "Ruteng", -8.6118, 120.4655, null, "Mgr. Siprianus Hormat"),
  d(85, "Keuskupan Labuan Bajo", "keuskupan", "Ende", "Labuan Bajo", -8.4964, 119.8877, null, "Mgr. Maksimus Regus"),
  // Provinsi Gerejawi Kupang
  d(90, "Keuskupan Agung Kupang", "keuskupan_agung", "Kupang", "Kupang", -10.1772, 123.607, null, "Mgr. Hironimus Pakaenoni"),
  d(91, "Keuskupan Atambua", "keuskupan", "Kupang", "Atambua", -9.1061, 124.8923, null, "Mgr. Dominikus Saku"),
  d(92, "Keuskupan Weetebula", "keuskupan", "Kupang", "Weetebula", -9.43, 119.25, null, "Mgr. Edmund Woga, CSsR"),
  // Provinsi Gerejawi Merauke
  d(100, "Keuskupan Agung Merauke", "keuskupan_agung", "Merauke", "Merauke", -8.4932, 140.4018, null, "Mgr. Petrus Canisius Mandagi, MSC"),
  d(101, "Keuskupan Agats", "keuskupan", "Merauke", "Agats", -5.5432, 138.1346, null, null),
  d(102, "Keuskupan Jayapura", "keuskupan", "Merauke", "Jayapura", -2.5337, 140.7181, null, "Mgr. Yanuarius Teofilus Matopai You"),
  d(103, "Keuskupan Manokwari-Sorong", "keuskupan", "Merauke", "Manokwari", -0.8615, 134.064, null, "Mgr. Hilarion Datus Lega"),
  d(104, "Keuskupan Timika", "keuskupan", "Merauke", "Timika", -4.55, 136.8833, null, "Mgr. Bernardus Bofitwos Baru, OSA"),
  // Ordinariat Militer (no territory of its own)
  d(200, "Ordinariat Militer Indonesia", "ordinariat", "—", "Jakarta", null, null, null, null, "Uskup Ordinariat"),
];

export const PROVINCE_ORDER = ["Medan", "Palembang", "Jakarta", "Semarang", "Pontianak", "Samarinda", "Makassar", "Ende", "Kupang", "Merauke", "—"];

// One colour per ecclesiastical province (map + cards)
export const PROVINCE_COLORS: Record<string, string> = {
  Medan: "#f59e0b", Palembang: "#ef4444", Jakarta: "#D6B072", Semarang: "#22c55e", Pontianak: "#06b6d4",
  Samarinda: "#3b82f6", Makassar: "#8b5cf6", Ende: "#ec4899", Kupang: "#f97316", Merauke: "#14b8a6", "—": "#9ca3af",
};

export const KIND_LABEL: Record<Diocese["kind"], string> = {
  keuskupan_agung: "Keuskupan Agung",
  keuskupan: "Keuskupan",
  ordinariat: "Ordinariat",
};

// ─── History timeline ─────────────────────────────────────────────────────────
export const HISTORY: { year: string; title: string; text: string }[] = [
  { year: "1534", title: "Benih iman di Maluku", text: "Pedagang dan misionaris Portugis membawa iman Katolik ke Maluku. Komunitas Katolik pertama di Nusantara tumbuh di Halmahera dan Ambon." },
  { year: "1546–1547", title: "Santo Fransiskus Xaverius", text: "Rasul Asia ini berkarya di Ambon, Ternate, dan Morotai, membaptis dan meneguhkan umat yang baru tumbuh." },
  { year: "1556", title: "Misi di Solor dan Flores", text: "Para imam Dominikan memulai karya di Solor, lalu Flores Timur. Tradisi Katolik di Larantuka, seperti Semana Santa, berakar sejak masa ini." },
  { year: "1605–1806", title: "Masa sulit di bawah VOC", text: "Setelah VOC berkuasa, karya Katolik dibatasi. Di banyak tempat umat hanya bertahan lewat iman keluarga dan pemimpin awam." },
  { year: "1807", title: "Prefektur Apostolik Batavia", text: "Kebebasan beragama di Hindia Belanda membuka kembali karya Gereja. Prefektur Apostolik Batavia didirikan dan imam pertama tiba tahun 1808." },
  { year: "1859", title: "Para Yesuit datang", text: "Serikat Yesus mulai berkarya di Jawa dan wilayah lain, disusul banyak tarekat religius yang membuka sekolah, rumah sakit, dan karya sosial." },
  { year: "1904", title: "Pembaptisan di Sendangsono", text: "Romo Fransiskus van Lith, SJ membaptis 171 orang Jawa di Sendangsono pada 14 Desember 1904, tonggak tumbuhnya Gereja yang berakar dalam budaya setempat." },
  { year: "1940", title: "Uskup pribumi pertama", text: "Mgr. Albertus Soegijapranata, SJ ditahbiskan sebagai Vikaris Apostolik Semarang, uskup pertama asli Indonesia dan kelak Pahlawan Nasional." },
  { year: "1961", title: "Hierarki Gereja Indonesia", text: "Paus Yohanes XXIII menetapkan hierarki Gereja Katolik Indonesia pada 3 Januari 1961, dengan keuskupan-keuskupan agung dan keuskupan sufragan." },
  { year: "1967", title: "Kardinal pertama", text: "Mgr. Justinus Darmojuwono, Uskup Agung Semarang, diangkat menjadi kardinal pertama dari Indonesia." },
  { year: "1970", title: "Kunjungan Paus Paulus VI", text: "Paus Paulus VI menjadi paus pertama yang mengunjungi Indonesia." },
  { year: "1989", title: "Kunjungan Paus Yohanes Paulus II", text: "Paus Yohanes Paulus II mengunjungi Jakarta, Yogyakarta, Maumere, Dili, dan Medan." },
  { year: "2024", title: "Kunjungan Paus Fransiskus", text: "Paus Fransiskus mengunjungi Jakarta pada September 2024, merayakan Misa di Gelora Bung Karno dan menegaskan persaudaraan lintas iman." },
];

/** Shown on the About page when the community record has no description yet. */
export const ABOUT_FALLBACK = {
  description:
    "Catholic Indonesia adalah komunitas terbuka bagi seluruh umat Katolik Indonesia di Ruang Iman: tempat berdoa, membaca Sabda, mengenal Gereja, dan bertumbuh bersama sebagai satu keluarga Allah.",
  pillars: [
    { title: "Sabda", text: "Alkitab, renungan, dan rencana bacaan harian." },
    { title: "Doa", text: "Doa-doa Gereja, Rosario, dan Jalan Salib." },
    { title: "Gereja", text: "Mengenal keuskupan, para gembala, dan sejarah Gereja Indonesia." },
    { title: "Persaudaraan", text: "Saling meneguhkan, melayani, dan mendoakan." },
  ],
};
