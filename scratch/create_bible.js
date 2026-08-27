import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.bible_verses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      book_no INTEGER NOT NULL,
      book_abbr TEXT NOT NULL,
      book_name TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      content TEXT NOT NULL,
      language TEXT NOT NULL,
      translation TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_bible_verses_book_chapter 
    ON public.bible_verses (book_no, chapter);

    ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Public can read bible verses" ON public.bible_verses;
    CREATE POLICY "Public can read bible verses"
    ON public.bible_verses FOR SELECT
    USING (true);
  `;

  // We have to use rpc or just output the SQL for the user to run if rpc fails
  console.log("SQL to execute:");
  console.log(sql);
}

main();
