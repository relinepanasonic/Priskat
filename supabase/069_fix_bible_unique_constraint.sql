ALTER TABLE public.bible_verses DROP CONSTRAINT IF EXISTS unique_book_chapter_verse;
ALTER TABLE public.bible_verses ADD CONSTRAINT unique_book_chapter_verse_lang_trans UNIQUE (book_no, chapter, verse, language, translation);

