// Direct blog post generator - bypasses Vercel entirely
// Run: node scripts/generate_first_blog.js GEMINI_API_KEY SUPABASE_SERVICE_ROLE_KEY

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

const GEMINI_API_KEY = process.argv[2];
const SERVICE_ROLE_KEY = process.argv[3] || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZndnVheWJkbnlja2tsbnh5dnRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU4NjA4MCwiZXhwIjoyMTAzMTYyMDgwfQ.h5nqNseALAqMfUnRgvGGDv2qlBweyGcIqsO-AHq2DRM";
const SUPABASE_URL = "https://fgvuaybdnyckklnxyvtc.supabase.co";

if (!GEMINI_API_KEY) {
  console.error("Usage: node scripts/generate_first_blog.js YOUR_GEMINI_API_KEY");
  process.exit(1);
}

const CATEGORIES = [
  { id: "orang-kudus", label: "Orang Kudus", brief: "Profile a Catholic saint - their life, virtues, and one practical lesson for daily life." },
  { id: "katekese", label: "Katekese", brief: "Explain one Catholic teaching or liturgical term in plain language for a general reader." },
  { id: "komunitas", label: "Komunitas", brief: "A positive story on Catholic community life in Indonesia - youth ministry, choir, parish projects." },
  { id: "keluarga", label: "Keluarga & Iman", brief: "Practical content on living the faith day-to-day - family, marriage, balancing work and faith." },
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
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in response");
  return JSON.parse(raw.slice(start, end + 1));
}

async function tryModels(genAI, prompt) {
  // Try models in order until one works
  const models = [
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest", 
    "gemini-pro",
    "gemini-1.0-pro",
  ];
  
  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`✓ Model ${modelName} worked!`);
      return { text: result.response.text(), modelName };
    } catch (err) {
      console.log(`  ✗ ${modelName}: ${err.message.slice(0, 100)}`);
    }
  }
  throw new Error("All models failed!");
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const category = CATEGORIES[dayOfYear % CATEGORIES.length];
  const dateStr = new Date().toISOString().slice(0, 10);
  
  console.log(`\nGenerating post for category: ${category.label}`);
  console.log(`Date: ${dateStr}\n`);
  
  const prompt = `Today's date is ${dateStr}. Write a blog post for category "${category.label}".
Category brief: ${category.brief}

You are writing for "Ruang Iman", an Indonesian Catholic community app.
Write in Bahasa Indonesia. Keep it warm and accessible. 500-700 words.

Respond with ONLY a single JSON object:
{
  "title": "SEO-friendly title in Indonesian, under 70 characters",
  "excerpt": "1-2 sentence summary, under 160 characters",
  "content": "full Markdown body, 500-700 words, with ## subheadings",
  "meta_description": "under 160 characters for search engines",
  "tags": ["3 to 5 lowercase tags"]
}`;

  const { text, modelName } = await tryModels(genAI, prompt);
  const parsed = extractJson(text);
  
  console.log(`\n✓ Generated: "${parsed.title}"`);
  
  const slug = `${slugify(parsed.title)}-${dateStr}`;
  
  // Check if already exists
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
    
  if (existing) {
    console.log("Post for today already exists! Skipping.");
    return;
  }
  
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
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
    })
    .select("id, slug")
    .single();
    
  if (error) {
    console.error("✗ Supabase error:", error.message);
    process.exit(1);
  }
  
  console.log(`\n✓ Published! Slug: ${data.slug}`);
  console.log(`\nAlso update generate.ts to use model: ${modelName}`);
}

main().catch(console.error);

