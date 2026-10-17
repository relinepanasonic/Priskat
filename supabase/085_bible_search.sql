-- Bible word search: how many times a word appears, per book, and the matching verses.
-- Run once in the Supabase SQL editor. (The app also works before this is run, just slower.)

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Fast "contains" / regex search on verse text, and fast filtering by translation + book
CREATE INDEX IF NOT EXISTS bible_verses_content_trgm ON public.bible_verses USING gin (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS bible_verses_tr_book_ch_v ON public.bible_verses (translation, book_no, chapter, verse);

-- Turns the user's words into a safe, case-insensitive regex.
-- whole = true  → whole words only ("kasih" does not match "kasihan")
-- whole = false → also inside longer words
CREATE OR REPLACE FUNCTION public.bible_search_pattern(q text, whole boolean)
RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE WHEN whole THEN '\m' ELSE '' END
      || regexp_replace(
           regexp_replace(trim(q), '([.\\+*?\[\]^$(){}=!<>|:#\-])', '\\\1', 'g'),
           '\s+', '\\s+', 'g')
      || CASE WHEN whole THEN '\M' ELSE '' END;
$$;

-- Per-book totals: verses that contain the words, and total occurrences
CREATE OR REPLACE FUNCTION public.bible_search_summary(q text, tr text, whole boolean DEFAULT true)
RETURNS TABLE(book_no int, book_name text, verses bigint, occurrences bigint)
LANGUAGE sql STABLE
AS $$
  SELECT v.book_no::int,
         min(v.book_name)::text,
         count(*)::bigint,
         sum((SELECT count(*) FROM regexp_matches(v.content, public.bible_search_pattern(q, whole), 'gi')))::bigint
  FROM public.bible_verses v
  WHERE length(trim(q)) >= 2
    AND v.translation = tr
    AND v.content ~* public.bible_search_pattern(q, whole)
  GROUP BY v.book_no
  ORDER BY v.book_no;
$$;

-- Matching verses in one book, in reading order (paged)
CREATE OR REPLACE FUNCTION public.bible_search_verses(q text, tr text, book int, whole boolean DEFAULT true, lim int DEFAULT 50, off int DEFAULT 0)
RETURNS TABLE(book_no int, book_name text, chapter int, verse int, content text)
LANGUAGE sql STABLE
AS $$
  SELECT v.book_no::int, v.book_name::text, v.chapter::int, v.verse::int, v.content::text
  FROM public.bible_verses v
  WHERE length(trim(q)) >= 2
    AND v.translation = tr
    AND v.book_no = book
    AND v.content ~* public.bible_search_pattern(q, whole)
  ORDER BY v.chapter, v.verse
  LIMIT least(greatest(lim, 1), 200) OFFSET greatest(off, 0);
$$;

GRANT EXECUTE ON FUNCTION public.bible_search_pattern(text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bible_search_summary(text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bible_search_verses(text, text, int, boolean, int, int) TO anon, authenticated;
