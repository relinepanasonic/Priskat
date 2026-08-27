-- Delete duplicate verses (keeping the one with the lowest ctid)
DELETE FROM public.bible_verses
WHERE ctid NOT IN (
    SELECT min(ctid)
    FROM public.bible_verses
    GROUP BY book_no, chapter, verse
);

-- Now add a UNIQUE constraint so duplicates can never happen again!
ALTER TABLE public.bible_verses 
ADD CONSTRAINT unique_book_chapter_verse UNIQUE (book_no, chapter, verse);
