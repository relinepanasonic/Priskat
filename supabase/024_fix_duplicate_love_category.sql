-- 024_fix_duplicate_love_category.sql
-- Fixes the duplicate "Love" entries: merges old plans into "Love of God"
-- sub-category, then deletes the orphan old "Love" category.

DO $$
DECLARE
  v_old_love_id   UUID;
  v_new_love_id   UUID;
  v_love_of_god_id UUID;
BEGIN
  /* Find the NEW top-level Love (has no plans directly, was just created) */
  SELECT id INTO v_new_love_id
  FROM public.devotion_categories
  WHERE name = 'Love' AND parent_id IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  /* Find the OLD Love (created first, may still have plans linked to it) */
  SELECT id INTO v_old_love_id
  FROM public.devotion_categories
  WHERE name = 'Love' AND parent_id IS NULL AND id <> v_new_love_id
  LIMIT 1;

  IF v_old_love_id IS NOT NULL THEN
    /* Find the Love of God sub-category */
    SELECT id INTO v_love_of_god_id
    FROM public.devotion_categories
    WHERE name = 'Love of God' AND parent_id = v_new_love_id
    LIMIT 1;

    /* If Love of God doesn't exist yet, create it */
    IF v_love_of_god_id IS NULL THEN
      INSERT INTO public.devotion_categories (name, parent_id)
      VALUES ('Love of God', v_new_love_id)
      RETURNING id INTO v_love_of_god_id;
    END IF;

    /* Move all plans from old Love -> Love of God */
    UPDATE public.devotion_plans
    SET category_id = v_love_of_god_id
    WHERE category_id = v_old_love_id;

    /* Delete the old duplicate Love category */
    DELETE FROM public.devotion_categories WHERE id = v_old_love_id;
  END IF;
END $$;

