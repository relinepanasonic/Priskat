/** Everything that can be earned in the prayer game. Keys must match the 095 SQL. */

export type BadgeDef = { key: string; name: string; emoji: string; desc: string; ladder?: boolean; min?: number };

export const LADDER: BadgeDef[] = [
  { key: "ladder_pencari", name: "Pencari", emoji: "🌱", desc: "Langkah pertama dalam doa", ladder: true, min: 0 },
  { key: "ladder_peziarah", name: "Peziarah", emoji: "🥾", desc: "100 poin doa", ladder: true, min: 100 },
  { key: "ladder_setia", name: "Setia", emoji: "🕯️", desc: "300 poin doa", ladder: true, min: 300 },
  { key: "ladder_sahabat", name: "Sahabat Doa", emoji: "🤝", desc: "700 poin doa", ladder: true, min: 700 },
  { key: "ladder_pendoa", name: "Pendoa Tekun", emoji: "📿", desc: "1.500 poin doa", ladder: true, min: 1500 },
  { key: "ladder_saksi", name: "Saksi Iman", emoji: "🕊️", desc: "3.000 poin doa", ladder: true, min: 3000 },
  { key: "ladder_murid", name: "Murid", emoji: "👑", desc: "6.000 poin doa. Puncak perjalanan: Murid Kristus", ladder: true, min: 6000 },
];

export const ACHIEVEMENTS: BadgeDef[] = [
  { key: "first_bible", name: "Pembaca Firman", emoji: "📖", desc: "Membaca satu pasal Alkitab" },
  { key: "first_rosary", name: "Rosario Pertama", emoji: "📿", desc: "Menyelesaikan satu Rosario" },
  { key: "first_jalan_salib", name: "Jalan Salib", emoji: "✝️", desc: "Menyelesaikan Jalan Salib" },
  { key: "first_devotion", name: "Renungan Pertama", emoji: "🌅", desc: "Menyelesaikan satu hari renungan" },
  { key: "first_redeem", name: "Kembali Berdoa", emoji: "🔥", desc: "Menebus hari yang terlewat" },
  { key: "bible_10", name: "Penjelajah Alkitab", emoji: "🧭", desc: "Membaca 10 pasal berbeda" },
  { key: "rosary_10", name: "Setia Rosario", emoji: "🌹", desc: "Berdoa Rosario 10 kali" },
  { key: "devotion_7", name: "Seminggu Renungan", emoji: "☀️", desc: "Menyelesaikan 7 hari renungan" },
  { key: "week_full", name: "Seminggu Penuh", emoji: "🌟", desc: "Berdoa 7 hari dalam satu minggu" },
  { key: "streak_7", name: "7 Hari Berturut", emoji: "🔥", desc: "7 hari berdoa berturut-turut" },
  { key: "streak_30", name: "30 Hari Berturut", emoji: "🏅", desc: "30 hari berdoa berturut-turut" },
  { key: "challenge_7", name: "7 Tantangan Alkitab", emoji: "📜", desc: "Menyelesaikan 7 Tantangan Alkitab harian" },
  { key: "challenge_30", name: "30 Tantangan Alkitab", emoji: "🏛️", desc: "Menyelesaikan 30 Tantangan Alkitab. Gelar: Pembaca Setia" },
  { key: "camp_arwah_2026", name: "Pendoa Arwah 2026", emoji: "🕯️", desc: "Menyelesaikan kampanye Bulan Arwah 2026" },
];

export const badgeByKey = (key: string) => [...LADDER, ...ACHIEVEMENTS].find((b) => b.key === key);

export type Frame = { key: string; name: string; emoji: string; ring: string; glow?: string };
export const FRAMES: Frame[] = [
  { key: "silver_ring", name: "Cincin Perak", emoji: "", ring: "conic-gradient(#e5e7eb,#9ca3af,#f3f4f6,#9ca3af,#e5e7eb)" },
  { key: "gold_ring", name: "Cincin Emas", emoji: "", ring: "conic-gradient(#fde68a,#d6b072,#f59e0b,#d6b072,#fde68a)", glow: "rgba(214,176,114,0.55)" },
  { key: "olive_branch", name: "Ranting Zaitun", emoji: "🌿", ring: "conic-gradient(#86efac,#166534,#4ade80,#166534,#86efac)" },
  { key: "star_ring", name: "Cincin Bintang", emoji: "⭐", ring: "conic-gradient(#bfdbfe,#1d4ed8,#93c5fd,#1d4ed8,#bfdbfe)", glow: "rgba(96,165,250,0.5)" },
  { key: "dove", name: "Merpati Damai", emoji: "🕊️", ring: "conic-gradient(#ffffff,#bae6fd,#ffffff,#bae6fd,#ffffff)", glow: "rgba(186,230,253,0.6)" },
  { key: "disciple_crown", name: "Mahkota Murid", emoji: "👑", ring: "conic-gradient(#fef08a,#d6b072,#f59e0b,#fde047,#d6b072,#fef08a)", glow: "rgba(250,204,21,0.75)" },
  { key: "arwah_candle", name: "Lilin Arwah", emoji: "🕯️", ring: "conic-gradient(#c4b5fd,#6d28d9,#a78bfa,#6d28d9,#c4b5fd)", glow: "rgba(167,139,250,0.6)" },
  { key: "rosary_garland", name: "Untaian Rosario", emoji: "📿", ring: "conic-gradient(#fda4af,#be123c,#fb7185,#be123c,#fda4af)", glow: "rgba(251,113,133,0.55)" },
  { key: "advent_wreath", name: "Karangan Adven", emoji: "🌲", ring: "conic-gradient(#86efac,#7c3aed,#4ade80,#7c3aed,#86efac)" },
  { key: "lent_cross", name: "Salib Prapaskah", emoji: "✝️", ring: "conic-gradient(#d8b4fe,#581c87,#c084fc,#581c87,#d8b4fe)" },
];
export const frameByKey = (key?: string | null) => FRAMES.find((f) => f.key === key);

export type NameColor = { key: string; name: string; className: string };
export const NAME_COLORS: NameColor[] = [
  { key: "emerald", name: "Zamrud", className: "text-emerald-300" },
  { key: "rose", name: "Mawar", className: "text-rose-300" },
  { key: "sky", name: "Langit", className: "text-sky-300" },
  { key: "violet", name: "Ungu Prapaskah", className: "text-violet-300" },
  { key: "gold", name: "Emas", className: "bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 bg-clip-text text-transparent" },
  { key: "disciple", name: "Murid Kristus", className: "bg-gradient-to-r from-yellow-200 via-amber-400 to-rose-300 bg-clip-text text-transparent" },
];
export const nameColorClass = (key?: string | null) => NAME_COLORS.find((c) => c.key === key)?.className ?? "";

export type Card = { key: string; name: string; emoji: string; text: string; kind: "santo" | "maria" | "ayat" };
export const CARDS: Card[] = [
  { key: "card_maria", name: "Bunda Maria", emoji: "🌹", kind: "maria", text: "Bunda Allah dan Bunda Gereja." },
  { key: "card_yosef", name: "Santo Yosef", emoji: "🪚", kind: "santo", text: "Bapa pelindung Yesus dan pelindung Gereja semesta." },
  { key: "card_fransiskus", name: "Santo Fransiskus dari Assisi", emoji: "🐦", kind: "santo", text: "Pendiri Ordo Fransiskan, pelindung ekologi." },
  { key: "card_theresia", name: "Santa Theresia dari Kanak-Kanak Yesus", emoji: "🌸", kind: "santo", text: "Si Bunga Kecil, pelindung misi." },
  { key: "card_agustinus", name: "Santo Agustinus", emoji: "📚", kind: "santo", text: "Uskup Hippo dan Pujangga Gereja." },
  { key: "card_ignatius", name: "Santo Ignatius dari Loyola", emoji: "🔥", kind: "santo", text: "Pendiri Serikat Yesus (Jesuit)." },
  { key: "card_antonius", name: "Santo Antonius dari Padua", emoji: "🔍", kind: "santo", text: "Pelindung barang yang hilang." },
  { key: "card_yohanes_paulus_2", name: "Santo Yohanes Paulus II", emoji: "🕊️", kind: "santo", text: "Paus dari tahun 1978 sampai 2005." },
  { key: "card_teresa_kalkuta", name: "Santa Teresa dari Kalkuta", emoji: "🤲", kind: "santo", text: "Melayani kaum termiskin di antara yang miskin." },
  { key: "card_katarina_siena", name: "Santa Katarina dari Siena", emoji: "✒️", kind: "santo", text: "Pujangga Gereja dan pelindung Eropa." },
  { key: "card_dominikus", name: "Santo Dominikus", emoji: "📿", kind: "santo", text: "Pendiri Ordo Dominikan, penyebar devosi Rosario." },
  { key: "card_benediktus", name: "Santo Benediktus", emoji: "⛪", kind: "santo", text: "Bapa monastisisme Barat: ora et labora." },
  { key: "card_faustina", name: "Santa Faustina Kowalska", emoji: "💛", kind: "santo", text: "Rasul Kerahiman Ilahi." },
  { key: "card_padre_pio", name: "Santo Padre Pio", emoji: "🙏", kind: "santo", text: "Imam Kapusin yang dikenal karena doanya." },
  { key: "card_yohanes_bosco", name: "Santo Yohanes Bosco", emoji: "🎈", kind: "santo", text: "Bapa dan guru kaum muda." },
  { key: "verse_yoh_3_16", name: "Yohanes 3:16", emoji: "📖", kind: "ayat", text: "Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal." },
  { key: "verse_mzm_23_1", name: "Mazmur 23:1", emoji: "🐑", kind: "ayat", text: "TUHAN adalah gembalaku, takkan kekurangan aku." },
  { key: "verse_mat_11_28", name: "Matius 11:28", emoji: "☁️", kind: "ayat", text: "Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu." },
];
export const cardByKey = (key: string) => CARDS.find((c) => c.key === key);
