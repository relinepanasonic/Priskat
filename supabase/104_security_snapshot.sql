-- Live database security check for the weekly security review.
-- Read-only: it only looks at the catalog (tables, policies, functions, grants), never at member data.
-- Only the service role can run it; the app calls it from /api/security/db-check behind the report secret.
-- Run once in the Supabase SQL editor. Safe to run again.

CREATE OR REPLACE FUNCTION public.security_snapshot()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
SELECT jsonb_build_object(
  'generated_at', now(),

  -- Tables anyone with the public key could read or change without any policy
  'tables_without_rls', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'table', c.relname,
      'anon_can_select', has_table_privilege('anon', c.oid, 'SELECT'),
      'anon_can_write', has_table_privilege('anon', c.oid, 'INSERT,UPDATE,DELETE'),
      'authenticated_can_write', has_table_privilege('authenticated', c.oid, 'INSERT,UPDATE,DELETE')
    ) ORDER BY c.relname), '[]'::jsonb)
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity
  ),

  -- Write policies that let every caller through (USING true / WITH CHECK true)
  'open_write_policies', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'schema', p.schemaname, 'table', p.tablename, 'policy', p.policyname, 'cmd', p.cmd,
      'roles', p.roles::text[], 'using', p.qual, 'check', p.with_check
    ) ORDER BY p.schemaname, p.tablename), '[]'::jsonb)
    FROM pg_policies p
    WHERE p.schemaname IN ('public', 'storage')
      AND p.cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      AND (coalesce(btrim(p.qual), '') IN ('true', '(true)') OR coalesce(btrim(p.with_check), '') IN ('true', '(true)'))
  ),

  -- Rows anyone (even signed out) can read
  'public_read_policies', (
    SELECT coalesce(jsonb_agg(jsonb_build_object('schema', p.schemaname, 'table', p.tablename, 'policy', p.policyname, 'using', p.qual)
      ORDER BY p.schemaname, p.tablename), '[]'::jsonb)
    FROM pg_policies p
    WHERE p.schemaname IN ('public', 'storage') AND p.cmd IN ('SELECT', 'ALL')
      AND (p.roles::text[] && ARRAY['anon', 'public'])
  ),

  -- SECURITY DEFINER functions: without a fixed search_path they can be hijacked
  'definer_functions_without_search_path', (
    SELECT coalesce(jsonb_agg(p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' ORDER BY p.proname), '[]'::jsonb)
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
      AND NOT EXISTS (SELECT 1 FROM unnest(coalesce(p.proconfig, '{}'::text[])) x WHERE x LIKE 'search_path=%')
  ),

  -- SECURITY DEFINER functions a signed-out visitor can call
  'definer_functions_anon_can_run', (
    SELECT coalesce(jsonb_agg(p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' ORDER BY p.proname), '[]'::jsonb)
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef AND has_function_privilege('anon', p.oid, 'EXECUTE')
  ),

  -- Views run with their owner's rights unless security_invoker is on, which skips RLS
  'views_bypassing_rls', (
    SELECT coalesce(jsonb_agg(c.relname ORDER BY c.relname), '[]'::jsonb)
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('v', 'm')
      AND NOT coalesce(c.reloptions @> ARRAY['security_invoker=true'], false)
      AND (has_table_privilege('anon', c.oid, 'SELECT') OR has_table_privilege('authenticated', c.oid, 'SELECT'))
  ),

  -- Storage buckets whose files anyone can download by URL
  'public_buckets', (SELECT coalesce(jsonb_agg(b.id ORDER BY b.id), '[]'::jsonb) FROM storage.buckets b WHERE b.public)
);
$$;

REVOKE ALL ON FUNCTION public.security_snapshot() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.security_snapshot() TO service_role;
