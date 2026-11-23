/** The committee (panitia) roles an event usually needs. "Others" lets the admin type a role. */
export const CREW_ROLES = [
  "Ketua", "Wakil Ketua", "Sekretaris", "Bendahara", "Ketua Bidang", "Pembicara", "Koordinator Pembicara", "Acara",
  "Multi Media", "Perlengkapan", "Doa", "Transport", "Akomodasi", "Promosi", "Konsumsi", "Merchandise", "Dana", "Fasilitator", "Others",
] as const;

export const isKnownRole = (p: string | null | undefined) => (CREW_ROLES as readonly string[]).includes(p ?? "") && p !== "Others";
/** Position in the list, for sorting the crew in the order a committee is usually written (unknown roles last) */
export const roleOrder = (p: string | null | undefined) => { const i = (CREW_ROLES as readonly string[]).indexOf(p ?? ""); return i < 0 || p === "Others" ? 999 : i; };
