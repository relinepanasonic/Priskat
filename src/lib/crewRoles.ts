/** The committee (panitia) roles an event usually needs. "Others" lets the admin type a role. */
export const CREW_ROLES = [
  "Ketua", "Wakil Ketua", "Sekretaris", "Bendahara", "Ketua Bidang", "Pembicara", "Koordinator Pembicara", "Acara",
  "Multi Media", "Perlengkapan", "Doa", "Transport", "Akomodasi", "Promosi", "Konsumsi", "Merchandise", "Dana", "Fasilitator", "Others",
] as const;

export const isKnownRole = (p: string | null | undefined) => (CREW_ROLES as readonly string[]).includes(p ?? "") && p !== "Others";
/** Position in the list, for sorting the crew in the order a committee is usually written (unknown roles last) */
export const roleOrder = (p: string | null | undefined) => { const i = (CREW_ROLES as readonly string[]).indexOf(p ?? ""); return i < 0 || p === "Others" ? 999 : i; };

/** The leaders ("Petinggi") of a committee */
export const PETINGGI_ROLES = ["ketua", "wakil ketua", "sekretaris", "sekertaris", "bendahara", "ketua bidang"];

/** Who a meeting is for: "all", "petinggi" or "role:<position>" */
export function audienceMatches(audience: string | null | undefined, position: string | null | undefined): boolean {
  const a = audience || "all";
  const p = String(position ?? "").trim().toLowerCase();
  if (a === "all") return true;
  if (a === "petinggi") return PETINGGI_ROLES.includes(p);
  if (a.startsWith("role:")) return p === a.slice(5).trim().toLowerCase();
  return false;
}
export function audienceLabel(audience: string | null | undefined): string {
  const a = audience || "all";
  if (a === "all") return "Semua panitia";
  if (a === "petinggi") return "Petinggi";
  return `Group ${a.slice(5)}`;
}
