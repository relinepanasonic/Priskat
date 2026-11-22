/**
 * What the bots say. Four kinds of posts: faith (the short reflections in bots.ts), everyday life, happy and sad,
 * and short replies for each. {nick} is the name of the person being talked to. All of it is general and kind:
 * the bots are labelled "Bot" everywhere, and nothing claims a real event.
 */
import { BOT_THOUGHTS } from "@/lib/bots";

export type PostKind = "faith" | "daily" | "happy" | "sad";

export const DAILY_POSTS: string[] = [
  "Macet banget hari ini, tapi untung ada lagu yang enak buat diputar.",
  "Pagi ini kopinya pas banget. Hal kecil yang bikin hari mulai dengan baik ☕",
  "Hujan dari tadi. Cocok buat diam sebentar dan berterima kasih untuk atap di atas kepala.",
  "Lagi belajar bangun lebih pagi. Hari ke-3, masih berjuang 😅",
  "Makan siang hari ini sederhana tapi nikmat. Bersyukur masih bisa makan enak.",
  "Akhir pekan ini mau istirahat total. Ada yang punya rekomendasi film yang menenangkan?",
  "Habis jalan kaki sore, kepala jadi lebih ringan. Disarankan, ya.",
  "Ternyata beres-beres kamar bisa sekalian beres-beres pikiran juga.",
  "Hari ini kerjaan lumayan banyak, tapi satu per satu pasti selesai.",
  "Tadi lihat langit sore, bagus banget. Kadang cukup berhenti dan menatap sebentar.",
  "Lagi cari playlist yang cocok buat kerja. Ada saran?",
  "Selamat hari Senin semuanya. Pelan-pelan saja, yang penting mulai.",
  "Akhirnya hari Jumat. Ayo kita tutup pekan ini dengan syukur.",
  "Ada yang suka bangun pagi buat jalan-jalan sebelum matahari terbit? Rasanya beda.",
  "Hari ini aku coba mematikan notifikasi satu jam. Ternyata damai.",
  "Lagi suka baca sebelum tidur. Beberapa halaman saja sudah cukup.",
  "Weekend begini enaknya ngobrol lama dengan orang yang disayang.",
  "Cuaca panas banget. Jangan lupa minum air putih ya, teman-teman.",
  "Hari ini belajar sabar menunggu. Ternyata menunggu juga latihan.",
  "Siapa yang hari ini lagi butuh semangat? Aku kirim satu dari sini 💛",
  "Masak sendiri ternyata menyenangkan. Rasanya mungkin biasa, tapi bangga.",
  "Kadang pulang kerja langsung rebahan itu juga bentuk merawat diri.",
  "Ada yang sedang rindu kampung halaman? Aku iya, nih.",
  "Hari ini aku cuma mau bilang: kalian hebat sudah sampai sejauh ini.",
  "Sore-sore begini paling enak teh hangat dan obrolan ringan.",
];

export const HAPPY_POSTS: string[] = [
  "Aku happy banget hari ini! 😄",
  "Hari ini rasanya ringan banget, entah kenapa senyum terus dari pagi.",
  "Ada kabar baik hari ini, hatiku penuh syukur 🙏",
  "Lagi seneng banget! Semoga semua orang punya hari yang sama indahnya.",
  "Hari ini semua terasa pas. Terima kasih, Tuhan 🥹",
  "Moodku lagi bagus banget. Ayo ceritakan hal baikmu hari ini!",
  "Tadi dapat kejutan kecil yang bikin hari ini istimewa ✨",
  "Rasanya lega dan senang. Akhirnya satu urusan selesai!",
  "Bangun tidur langsung semangat. Jarang-jarang nih 😆",
  "Hatiku hangat hari ini. Syukur untuk hal-hal sederhana.",
  "Lagi bahagia banget, pengen bagi senyum ke semua orang 😊",
  "Hari ini aku merasa dikasihi. Itu saja sudah cukup.",
];

export const SAD_POSTS: string[] = [
  "Hari ini berat banget buat aku.",
  "Lagi merasa capek, bukan cuma badan tapi juga hati.",
  "Hari ini rasanya sepi. Butuh doa dari teman-teman.",
  "Kadang kita merasa sendirian walau banyak orang di sekitar.",
  "Lagi sedih tanpa alasan yang jelas. Mungkin cuma butuh istirahat.",
  "Hari ini banyak hal yang tidak berjalan sesuai harapan.",
  "Aku lagi kangen seseorang yang sudah jauh. Butuh kekuatan.",
  "Rasanya semua terlalu banyak hari ini. Mau tarik napas dulu.",
  "Lagi down. Mohon doanya ya, teman-teman 🙏",
  "Hati lagi kurang baik hari ini. Tidak apa-apa, besok mulai lagi.",
];

// ── replies ─────────────────────────────────────────────────────────────────
export const REPLIES: Record<Exclude<PostKind, "faith">, { first: string[]; answer: string[] }> = {
  happy: {
    first: [
      "Wah, happy kenapa {nick}? 😄",
      "Yeay! Ikut senang! Ada kabar baik apa nih?",
      "Senengnya! Cerita dong {nick} 🥰",
      "Aww, ikut tersenyum bacanya. Kenapa kenapa?",
      "Selamat {nick}! Semoga bahagianya awet 🙌",
    ],
    answer: [
      "Makasih ya {nick}! Intinya lagi banyak yang disyukuri hari ini 🙏",
      "Ada beberapa urusan yang akhirnya lancar. Rasanya lega banget!",
      "Hehe, cuma lagi merasa dikasihi aja, {nick}. Itu saja sudah cukup 😊",
      "Kabar kecil tapi bikin hati hangat. Terima kasih sudah nanya ya!",
    ],
  },
  sad: {
    first: [
      "Peluk dulu {nick} 🤗 Kalau mau cerita, aku dengerin.",
      "Semangat ya {nick}. Aku doain hari ini cepat lewat 🙏",
      "Boleh istirahat dulu kok, {nick}. Kamu tidak sendirian.",
      "Pelan-pelan saja ya. Kami di sini kalau kamu butuh teman ngobrol.",
      "Aku ikut mendoakan, {nick}. Besok semoga lebih ringan 💛",
    ],
    answer: [
      "Makasih ya {nick}, dibaca saja sudah bikin agak lega 🥹",
      "Terima kasih doanya. Pelan-pelan aku coba lagi besok.",
      "Makasih sudah peduli, {nick}. Hatiku jadi lebih hangat.",
      "Iya, aku mau istirahat dulu. Terima kasih ya 🙏",
    ],
  },
  daily: {
    first: [
      "Setuju banget {nick}!",
      "Hehe iya, aku juga ngerasa gitu hari ini.",
      "Relate banget 😅",
      "Wah, bener juga ya. Makasih sudah berbagi, {nick}!",
      "Noted, {nick}! Semoga harimu menyenangkan ☺️",
    ],
    answer: [],
  },
};

export const KIND_OF = new Map<string, PostKind>([
  ...BOT_THOUGHTS.map((t) => [t, "faith"] as [string, PostKind]),
  ...DAILY_POSTS.map((t) => [t, "daily"] as [string, PostKind]),
  ...HAPPY_POSTS.map((t) => [t, "happy"] as [string, PostKind]),
  ...SAD_POSTS.map((t) => [t, "sad"] as [string, PostKind]),
]);

export const POOL: Record<PostKind, string[]> = { faith: BOT_THOUGHTS, daily: DAILY_POSTS, happy: HAPPY_POSTS, sad: SAD_POSTS };

/** Pick a kind: faith is the most common, but not always */
export function pickKind(): PostKind {
  const r = Math.random();
  return r < 0.35 ? "faith" : r < 0.65 ? "daily" : r < 0.85 ? "happy" : "sad";
}

export const fill = (t: string, nick: string) => t.replace(/\{nick\}/g, nick);
export const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
