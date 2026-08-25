CREATE TABLE public.bible_verses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id INTEGER NOT NULL,
    book_name_id TEXT NOT NULL,
    book_name_en TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text_id TEXT NOT NULL,
    text_en TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for blazing fast lookups
CREATE INDEX idx_bible_verses_book_chapter ON public.bible_verses(book_id, chapter);
CREATE INDEX idx_bible_verses_book_name ON public.bible_verses(book_name_id);

-- Enable RLS
ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access for bible_verses"
    ON public.bible_verses FOR SELECT
    USING (true);
