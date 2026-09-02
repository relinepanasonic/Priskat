// Editorial policy for the daily auto-generated blog.
// Read this before touching the prompt in `generate.ts` — the guardrails here
// exist because the audience is majority-Muslim Indonesia and the content is
// unattended (no human reads it before it goes live).

export const BLOG_TOPIC_CATEGORIES = [
  {
    id: "orang-kudus",
    label: "Saint of the Day / Orang Kudus",
    brief:
      "Profile a Catholic saint (prefer one whose feast day is near today, or one with strong relevance to Indonesian Catholics) — their life, virtues, and one practical lesson for daily life.",
  },
  {
    id: "sejarah-gereja",
    label: "Church History",
    brief:
      "A short, factual piece on Catholic Church history — a council, an order's founding, the history of Catholicism arriving in Indonesia (e.g. Portuguese Flores, Maluku missions), a historic parish or cathedral.",
  },
  {
    id: "katekese",
    label: "Catechesis / Teaching",
    brief:
      "Explain one piece of Catholic teaching or a liturgical term in plain language for a general reader (e.g. what is Advent, what does 'Eucharist' mean, why Catholics use holy water) — informational, not devotional.",
  },
  {
    id: "komunitas",
    label: "Community & Culture",
    brief:
      "A positive, human-interest angle on Catholic community life in Indonesia — youth ministry, choir traditions, Christmas/Easter customs in a region, a parish's community project (education, charity, disaster relief).",
  },
  {
    id: "keluarga",
    label: "Family & Everyday Faith",
    brief:
      "Practical, warm content on living the faith day-to-day — raising children Catholic, marriage in the Church, balancing work and faith. Encouraging tone, no theological controversy.",
  },
] as const;

export type BlogTopicCategoryId = (typeof BLOG_TOPIC_CATEGORIES)[number]["id"];

export const BLOG_CONTENT_POLICY = `
You are writing ONE blog post for "Ruang Iman", an Indonesian Catholic community app,
for its public, search-engine-indexed blog. The goal is helpful, positive, evergreen
content that ranks well for searches like "Katolik", "Catholic", "Gereja" in Indonesia
— never clickbait, never sensational.

Indonesia is a majority-Muslim country with a religiously diverse and sometimes
sensitive social fabric. Follow these rules without exception:

HARD RULES — violating any of these means the post must not be written at all:
1. Never mention, compare, criticize, or reference Islam, Muslims, any other religion,
   or interfaith conflict/tension — even in passing or as a "respectful comparison".
2. Never touch current events, politics, elections, government policy, or anything
   that could be read as taking a side on a live controversy.
3. Never write about ethnicity, race, tribe (suku), or make any statement that could
   be read as racist, discriminatory, or ranking one group above another.
4. Never write prayers, novenas, or devotional prayer text — the app already has a
   dedicated Prayers section; the blog is informational/editorial, not liturgical.
5. Never fabricate specific statistics, quotes, medical/legal claims, or attribute
   invented quotes to real living people. Church history and saints' lives should
   stick to widely-documented, uncontroversial facts.
6. Stay strictly positive and constructive — no fear-mongering, no doom, no negative
   framing of any community, denomination, or country.

If a topic cannot be covered while satisfying all of the above, pick a safer topic
from the same category instead of bending the rules.

STYLE:
- Written in Indonesian (Bahasa Indonesia) by default, warm and accessible, suitable
  for a general Catholic family reader — not academic, not preachy.
- 500-800 words of body content, structured with short paragraphs and 2-4 subheadings
  (as Markdown "##" headings).
- Include a natural mention of relevant SEO terms (Katolik, Gereja Katolik, iman
  Katolik, etc.) without keyword-stuffing.
- End with a short, gentle closing line — reflection is fine, a formal prayer is not.
`.trim();

// Last-line defense: if any of these terms slip into a generated post, it is held
// back as 'flagged' instead of published, regardless of what the prompt produced.
export const BLOG_BANNED_TERMS: RegExp[] = [
  /\bislam\w*\b/i,
  /\bmuslim\w*\b/i,
  /\bmuhammad\b/i,
  /\bal-?qur'?an\b/i,
  /\bmasjid\b/i,
  /\bkafir\b/i,
  /\bsuku\s+\w+\b/i, // "suku <ethnic group>" phrasing
  /\bras\b/i,
  /\bpribumi\b/i,
  /\bpilpres|\bpemilu\b/i,
  /\bpolitik\b/i,
  /\bpresiden\b/i,
];

export function violatesBannedTerms(text: string): string | null {
  for (const pattern of BLOG_BANNED_TERMS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}
