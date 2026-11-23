/**
 * "Up", not "Back". Every page of the app has ONE parent: Beranda (home) > a section > a page > a sub page.
 * The phone's Back button walks up that ladder, one step at a time, until it is on Beranda, so it can never
 * cycle between pages. From Beranda a second press leaves the app.
 */

type Rule = [RegExp, string | ((m: RegExpMatchArray) => string)];

// the most specific first
const RULES: Rule[] = [
  // Iman
  [/^\/faith\/devotions\/plans\/[^/]+\/(day|read)\/[^/]+$/, "/faith/devotions/plans"],
  [/^\/faith\/devotions\/plans$/, "/faith/devotions"],
  [/^\/faith\/devotions$/, "/faith"],
  [/^\/faith\/plans\/[^/]+$/, "/faith/plans"],
  [/^\/faith\/bible\/(bacaan|search)$/, "/faith/bible"],
  [/^\/faith\/bible\/[^/]+\/[^/]+$/, "/faith/bible"],
  [/^\/faith\/prayers\/[^/]+$/, "/faith/prayers"],
  [/^\/faith\/[^/]+$/, "/faith"],
  // Warta
  [/^\/news\/blog\/[^/]+$/, "/news/blog"],
  [/^\/news\/schedule\/search$/, "/news/schedule"],
  [/^\/news\/schedule\/[^/]+\/[^/]+\/[^/]+$/, (m) => m[0].split("/").slice(0, 5).join("/")],
  [/^\/news\/schedule\/[^/]+\/[^/]+$/, "/news/schedule"],
  [/^\/news\/[^/]+$/, "/news"],
  // Komunitas
  [/^\/community\/messages\/[^/]+$/, "/community/messages"],
  [/^\/community\/[^/]+$/, "/community"],
  // Komunitas / camp pages
  [/^\/camp\/alumni-data$/, "/camp"],
  [/^\/camp\/[^/]+\/ongoing\/[^/]+$/, (m) => m[0].split("/").slice(0, 4).join("/")],
  [/^\/camp\/[^/]+\/[^/]+$/, (m) => m[0].split("/").slice(0, 3).join("/")],
  [/^\/camp\/[^/]+$/, "/camp"],
  // Profil
  [/^\/profile\/[^/]+$/, "/profile"],
  // one event
  [/^\/acara\/[^/]+$/, "/news/events"],
];

/** The parent of a path, or null when the path is Beranda itself. */
export function upOf(path: string): string | null {
  const p = (path.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/");
  if (p === "/") return null;
  for (const [re, to] of RULES) {
    const m = p.match(re);
    if (m) return typeof to === "string" ? to : to(m);
  }
  // everything else (a section, the tickets, the friends list ...) sits right under Beranda
  return "/";
}
