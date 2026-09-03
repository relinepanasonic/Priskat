import Groq from "groq-sdk";
import {
  BLOG_CONTENT_POLICY,
  BLOG_TOPIC_CATEGORIES,
  violatesBannedTerms,
  type BlogTopicCategoryId,
} from "./guidelines";

export interface GeneratedBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Markdown
  meta_description: string;
  category: BlogTopicCategoryId;
  tags: string[];
}

/** Deterministic day-of-year -> category rotation */
function categoryForDate(date: Date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - start) / 86_400_000);
  return BLOG_TOPIC_CATEGORIES[dayOfYear % BLOG_TOPIC_CATEGORIES.length];
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function extractJson(text: string): any {
  // Strip chain-of-thought thinking tags some models emit
  const stripped = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const fenced = stripped.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : stripped;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Model response did not contain a JSON object");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

export async function generateDailyBlogPost(
  forDate: Date = new Date()
): Promise<{ post: GeneratedBlogPost; flaggedReason: string | null }> {
  const category = categoryForDate(forDate);
  const dateStr = forDate.toISOString().slice(0, 10);

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: "groq/compound-mini",
    temperature: 0.7,
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: BLOG_CONTENT_POLICY,
      },
      {
        role: "user",
        content: `Today's date is ${dateStr}. Write today's blog post for category "${category.label}".

Category brief: ${category.brief}

IMPORTANT: Respond ONLY with valid JSON. No extra text before or after. Keep "content" under 400 words.

{"title":"SEO title in Indonesian under 60 chars","excerpt":"1 sentence summary under 100 chars","content":"Markdown body 300-400 words with ## subheadings","meta_description":"under 100 chars","tags":["2-4 lowercase tags"]}`,
      },
    ],
  });

  const responseText = completion.choices[0]?.message?.content ?? "";
  const parsed = extractJson(responseText);

  const post: GeneratedBlogPost = {
    title: String(parsed.title).trim(),
    slug: `${slugify(String(parsed.title))}-${dateStr}`,
    excerpt: String(parsed.excerpt).trim(),
    content: String(parsed.content).trim(),
    meta_description: String(parsed.meta_description).trim().slice(0, 160),
    category: category.id,
    tags: Array.isArray(parsed.tags) ? parsed.tags.map((t: any) => String(t)) : [],
  };

  const fullText = `${post.title}\n${post.excerpt}\n${post.content}`;
  const hit = violatesBannedTerms(fullText);

  return { post, flaggedReason: hit ? `Banned term matched: "${hit}"` : null };
}
