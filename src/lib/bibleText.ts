/** TB text carries Hebrew verse markers "(34-9)" and Psalm headings; keep only the verse itself. */
export function cleanVerse(text: string) {
  let t = text;
  const markers = [...t.matchAll(/\(\d+-\d+\)\s*/g)];
  if (markers.length) {
    const last = markers[markers.length - 1];
    t = t.slice((last.index ?? 0) + last[0].length);
  }
  return t.replace(/^(Mazmur|Nyanyian|Dari|Untuk|Doa|Pengajaran|Syair)\s[^.]*\.\s+(?=[A-Z])/, "").trim();
}
