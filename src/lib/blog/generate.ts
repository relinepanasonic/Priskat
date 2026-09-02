import { GoogleGenerativeAI } from "@google/generative-ai";
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

/** Deterministic day-of-year -> category rotation, so the same date always maps
 * to the same category (useful if the daily job is ever re-run for the same day). */
function categoryForDate(date: Date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - start) / 86_400_000);
  return BLOG_TOPIC_CATEGORIES[dayOfYear % BLOG_TOPIC_CATEGORIES.length];
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[I?-I_]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function extractJson(text: string): any {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
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

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  
  // Use Gemini 2.5 Pro as it's the most capable model
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    systemInstruction: BLOG_CONTENT_POLICY,
    tools: [
      { googleSearchRetrieval: { dynamicRetrievalConfig: { mode: "MODE_DYNAMIC", dynamicThreshold: 0.3 } } }
    ]
  });

  const prompt = `Today's date is ${dateStr}. Write today's blog post for category "${category.label}".

Category brief: ${category.brief}

You may use your Google Search Grounding to verify facts
such as a saint's feast day, historical dates, or Church terminology – do not
fabricate specifics you are not confident about; prefer a safer, well-documented
angle over a shaky specific claim. Ensure content aligns with Catholic teachings.

Respond with ONLY a single JSON object (no prose before or after) with exactly these keys:
{
  "title": "short, SEO-friendly title in Indonesian, under 70 characters",
  "excerpt": "1-2 sentence summary, under 160 characters",
  "content": "the full Markdown body, 500-800 words, using ## subheadings",
  "meta_description": "under 160 characters, for search engine snippets",
  "tags": ["3 to 6 short lowercase tags relevant to the post"]
}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
    },
  });

  const responseText = result.response.text();
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

  // Safety net: scan the full generated text against the banned-term list,
  // independent of whatever the model itself decided was safe.
  const fullText = `${post.title}\n${post.excerpt}\n${post.content}`;
  const hit = violatesBannedTerms(fullText);

  return { post, flaggedReason: hit ? `Banned term matched: "${hit}"` : null };
}
