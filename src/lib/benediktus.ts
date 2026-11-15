/**
 * The prayer of the Medal of Saint Benedict: the Latin words are the letters stamped on the medal.
 * Public domain (traditional, 11th century or older). `say` is what the phone reads aloud; the Italian voice
 * pronounces church Latin well, and the spelling is kept as the medal has it.
 */
export type BenedictLine = { letters: string; latin: string; indo: string; where: string };

export const BENEDICT_CROSS: BenedictLine = {
  letters: "C S P B",
  latin: "Crux Sancti Patris Benedicti.",
  indo: "Salib Bapa Benediktus yang kudus.",
  where: "Huruf pada keempat sudut salib",
};

export const BENEDICT_LINES: BenedictLine[] = [
  { letters: "C S S M L", latin: "Crux sacra sit mihi lux.", indo: "Semoga salib suci menjadi terangku.", where: "Batang tegak salib" },
  { letters: "N D S M D", latin: "Non draco sit mihi dux.", indo: "Semoga sang naga tidak menjadi penuntunku.", where: "Palang mendatar salib" },
  { letters: "V R S", latin: "Vade retro, Satana.", indo: "Menyingkirlah di belakangku, Iblis.", where: "Lingkaran luar medali" },
  { letters: "N S M V", latin: "Numquam suade mihi vana.", indo: "Jangan pernah membujukku dengan hal-hal yang sia-sia.", where: "Lingkaran luar medali" },
  { letters: "S M Q L", latin: "Sunt mala quae libas.", indo: "Jahatlah apa yang kautawarkan.", where: "Lingkaran luar medali" },
  { letters: "I V B", latin: "Ipse venena bibas.", indo: "Minumlah sendiri racunmu.", where: "Lingkaran luar medali" },
];
