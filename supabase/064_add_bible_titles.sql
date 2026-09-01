-- Add a title column to the bible_verses table to support pericope headings
ALTER TABLE public.bible_verses
ADD COLUMN IF NOT EXISTS title TEXT;

-- Update Kejadian 1:1 with the requested title
UPDATE public.bible_verses
SET title = 'Allah menciptakan langit dan bumi serta isinya'
WHERE book_no = 1 AND chapter = 1 AND verse = 1;

-- Some other examples if they are seeded:
-- Kejadian 2: Manusia dan taman Eden
UPDATE public.bible_verses
SET title = 'Manusia dan taman Eden'
WHERE book_no = 1 AND chapter = 2 AND verse = 4;

-- Mazmur 23: TUHAN, Gembalaku yang baik
UPDATE public.bible_verses
SET title = 'TUHAN, Gembalaku yang baik'
WHERE book_no = 19 AND chapter = 23 AND verse = 1;

-- Yohanes 3: Percakapan dengan Nikodemus
UPDATE public.bible_verses
SET title = 'Percakapan dengan Nikodemus'
WHERE book_no = 43 AND chapter = 3 AND verse = 1;

