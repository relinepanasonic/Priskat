import { BISHOP_PROFILES, type BishopProfile } from "@/lib/bishopProfiles";

const STOP = new Set(["mgr", "uskup", "agung", "kardinal", "yang", "mulia", "dr", "pr", "romo"]);

const tokens = (s: string) =>
  s
    .toLowerCase()
    .replace(/,.*$/, "") // drop post-nominals (", OFM")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));

const INDEX = Object.entries(BISHOP_PROFILES).map(([key, p]) => ({
  p,
  tokens: new Set([...tokens(key), ...tokens(p.name)]),
}));

/** Finds the profile for a bishop's display name ("Mgr. Kornelius Sipayung, OFMCap"). */
export function findBishopProfile(bishopName?: string | null): BishopProfile | null {
  if (!bishopName) return null;
  const want = tokens(bishopName);
  if (want.length === 0) return null;
  let best: { p: BishopProfile; score: number } | null = null;
  for (const { p, tokens: have } of INDEX) {
    const score = want.filter((t) => have.has(t)).length;
    if (score >= Math.min(2, want.length) && (!best || score > best.score)) best = { p, score };
  }
  return best?.p ?? null;
}
