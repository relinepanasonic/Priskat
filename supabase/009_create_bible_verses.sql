DROP TABLE IF EXISTS public.bible_verses CASCADE;

CREATE TABLE public.bible_verses (
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

-- Index for fast querying by book and chapter
CREATE INDEX IF NOT EXISTS idx_bible_verses_book_chapter 
ON public.bible_verses (book_no, chapter);

ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Public can read bible verses" ON public.bible_verses;
CREATE POLICY "Public can read bible verses"
ON public.bible_verses FOR SELECT
USING (true);
