-- A community admin adds an existing Ruang Iman user to the community straight from the Community Center (Anggota).
-- Allowed: site admins, and the admins of that community (same rule as approving a join request).
-- Run once in the Supabase SQL editor (after 088). Safe to run again.

CREATE OR REPLACE FUNCTION public.admin_add_member(p_community uuid, p_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  allowed boolean;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Masuk dulu ke akunmu.' USING ERRCODE = '42501'; END IF;
  allowed := coalesce(public.get_my_role()::text, 'member') IN ('founder', 'superadmin', 'admin', 'moderator')
    OR EXISTS (SELECT 1 FROM public.community_admins ca WHERE ca.community_id = p_community AND ca.user_id = uid);
  IF NOT allowed THEN RAISE EXCEPTION 'Tidak diizinkan.' USING ERRCODE = '42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user) THEN RAISE EXCEPTION 'Pengguna tidak ditemukan.'; END IF;

  INSERT INTO public.community_memberships (user_id, community_id) VALUES (p_user, p_community) ON CONFLICT DO NOTHING;
  -- a person in several communities should choose a main one
  UPDATE public.profiles SET main_community_chosen = false WHERE id = p_user AND community_id IS DISTINCT FROM p_community;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_add_member(uuid, uuid) TO authenticated;
