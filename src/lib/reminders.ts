/** Prayer reminders a person can switch on. Times are local (the phone's time zone is saved with the choice). */
export type ReminderSlot = {
  key: string;
  label: string;
  desc: string;
  times: string[]; // "HH:MM", multiples of 15 minutes
  title: string;
  body: string;
  url: string;
  /** only send when the person has not prayed on the day that just ended */
  onlyIfMissedYesterday?: boolean;
  /** only send when the person has not prayed yet today (local time) */
  onlyIfNotPrayedToday?: boolean;
  /** only on this weekday, local time (0 = Sunday ... 6 = Saturday) */
  weekday?: number;
  /** not on a clock: sent when something happens (someone prays for your intention ...); the switch only allows or stops it */
  event?: boolean;
};

export const REMINDER_SLOTS: ReminderSlot[] = [
  {
    key: "angelus", label: "Angelus", desc: "Pukul 06.00, 12.00, dan 18.00",
    times: ["06:00", "12:00", "18:00"],
    title: "Waktunya Doa Angelus", body: "Malaikat Tuhan mewartakan kepada Maria … Mari berhenti sejenak untuk berdoa.", url: "/faith/prayers",
  },
  {
    key: "bacaan", label: "Bacaan Hari Ini", desc: "Bacaan Misa harian, pukul 06.30",
    times: ["06:30"],
    title: "Bacaan Hari Ini", body: "Bacaan Misa hari ini sudah siap. Ketuk untuk membaca.", url: "/faith/bible/bacaan",
  },
  {
    key: "kerahiman", label: "Jam Kerahiman Ilahi", desc: "Pukul 15.00",
    times: ["15:00"],
    title: "Jam Kerahiman Ilahi", body: "Pukul tiga, saat Yesus wafat. Mari berdoa Koronka atau doa singkat kerahiman.", url: "/faith/prayers",
  },
  {
    key: "rosario", label: "Rosario", desc: "Doa rosario malam, pukul 20.00",
    times: ["20:00"],
    title: "Waktunya Doa Rosario", body: "Luangkan beberapa menit untuk berdoa Rosario bersama Bunda Maria.", url: "/faith/prayers/rosario",
  },
  {
    key: "novena", label: "Doa malam & Novena", desc: "Pukul 21.00",
    times: ["21:00"],
    title: "Doa Malam", body: "Tutup hari ini dengan doa syukur dan novena.", url: "/faith/prayers",
  },
  {
    key: "tebus", label: "Tebus Hari", desc: "Pukul 00.00, hanya jika kemarin belum berdoa",
    times: ["00:00"],
    title: "Kemarin terlewat", body: "Tidak apa-apa. Buka Ruang Iman dan Tebus Hari dengan satu doa singkat 🙏", url: "/",
    onlyIfMissedYesterday: true,
  },
  {
    key: "streak", label: "Jaga api doamu", desc: "Pukul 19.30, hanya jika hari ini belum berdoa",
    times: ["19:30"],
    title: "Apimu masih menyala?", body: "Belum ada doa hari ini. Satu doa singkat cukup untuk menjaga apimu 🔥", url: "/",
    onlyIfNotPrayedToday: true,
  },
  {
    key: "peringkat", label: "Hasil mingguan", desc: "Senin pukul 08.00: peringkat dan lencana pekan lalu",
    times: ["08:00"], weekday: 1,
    title: "Peringkat mingguan sudah keluar", body: "Lihat posisimu dan lencana yang kamu dapat pekan ini.", url: "/leaderboard",
  },
  {
    key: "intensi", label: "Intensi doamu didoakan", desc: "Saat ada saudara seiman mendoakan intensimu",
    times: [], title: "", body: "", url: "/faith/intensi", event: true,
  },
  {
    key: "komunitas", label: "Permintaan bergabung", desc: "Saat permintaanmu masuk komunitas disetujui atau belum",
    times: [], title: "", body: "", url: "/camp", event: true,
  },
];

export const DEFAULT_SLOTS = ["angelus", "bacaan", "streak", "intensi", "komunitas"];
