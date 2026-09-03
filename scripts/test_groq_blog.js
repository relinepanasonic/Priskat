// Test the blog generation locally with Groq
// node scripts/test_groq_blog.js

const Groq = require("groq-sdk");
const { createClient } = require("@supabase/supabase-js");

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.argv[2] || "";
if (!GROQ_API_KEY) { console.error("Set GROQ_API_KEY env or pass as argument"); process.exit(1); }

const SUPABASE_URL = "https://fgvuaybdnyckklnxyvtc.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const CATEGORIES = [
  { id: "orang-kudus", label: "Orang Kudus", brief: "Profile a Catholic saint - their life, virtues, and one practical lesson for daily life." },
  { id: "katekese", label: "Katekese", brief: "Explain one Catholic teaching or liturgical term in plain language." },
  { id: "komunitas", label: "Komunitas", brief: "A positive story on Catholic community life in Indonesia." },
  { id: "keluarga", label: "Keluarga & Iman", brief: "Practical content on living the faith day-to-day - family, marriage." },
  { id: "sejarah-gereja", label: "Sejarah Gereja", brief: "A short factual piece on Catholic Church history in Indonesia." },
];

function slugify(title) {
  return title.toLowerCase()
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function extractJson(text) {
  // Strip chain-of-thought thinking tags some models emit
  const stripped = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const fenced = stripped.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : stripped;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found: " + text.slice(0, 300));
  return JSON.parse(raw.slice(start, end + 1));
}

async function main() {
  const groq = new Groq({ apiKey: GROQ_API_KEY });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const category = CATEGORIES[dayOfYear % CATEGORIES.length];
  const dateStr = new Date().toISOString().slice(0, 10);

  console.log(`\nGenerating post...`);
  console.log(`Category: ${category.label} | Date: ${dateStr}\n`);

  const completion = await groq.chat.completions.create({
    model: "groq/compound-mini",
    temperature: 0.7,
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: `You are writing blog posts for "Ruang Iman", an Indonesian Catholic community app. Write in Bahasa Indonesia. Keep it warm, accessible, and positive. Strictly Catholic content only.`
      },
      {
        role: "user",
        content: `Today is ${dateStr}. Write a blog post for category "${category.label}": ${category.brief}

IMPORTANT: Respond ONLY with valid JSON. No extra text. Keep "content" under 400 words.

{"title":"title in Indonesian under 60 chars","excerpt":"1 sentence summary under 100 chars","content":"Markdown body 300-400 words with ## subheadings","meta_description":"under 100 chars","tags":["2-4 tags"]}`
      }
    ]
  });

  const text = completion.choices[0]?.message?.content ?? "";
  console.log("RAW RESPONSE (first 500 chars):\n", text.slice(0, 500));
  const parsed = extractJson(text);
  const slug = `${slugify(parsed.title)}-${dateStr}`;

  console.log(`✓ Generated: "${parsed.title}"`);
  console.log(`  Slug: ${slug}`);

  const { data: existing } = await supabase.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
  if (existing) {
    console.log("\n⚠ Post for today already exists! Skipping insert.");
    return;
  }

  const { data, error } = await supabase.from("blog_posts").insert({
    slug,
    title: parsed.title,
    excerpt: parsed.excerpt,
    content: parsed.content,
    meta_description: String(parsed.meta_description).slice(0, 160),
    category: category.id,
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    status: "published",
    source: "ai_daily",
    author_name: "CFM Editorial",
    published_at: new Date().toISOString(),
  }).select("id, slug").single();

  if (error) {
    console.error("✗ Supabase error:", error.message);
    process.exit(1);
  }

  console.log(`\n✅ Published successfully!`);
  console.log(`   ID: ${data.id}`);
  console.log(`   Slug: ${data.slug}`);
  console.log(`\nRefresh your blog page now!`);
}

main().catch(console.error);
