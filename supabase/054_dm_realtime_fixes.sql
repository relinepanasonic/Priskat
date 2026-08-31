-- 054_dm_realtime_fixes.sql
-- Direct-message realtime was landing slowly / not at all for some
-- clients. Two DB-side hardening steps:
--   1. REPLICA IDENTITY FULL on dm_messages so Realtime can evaluate the
--      row-level filter (thread_id=eq.…) and the RLS SELECT policy against
--      the complete row, not just the primary key.
--   2. Re-affirm the table is in the supabase_realtime publication.
-- The app also now polls as a fallback, so realtime is best-effort.
-- Idempotent — safe to run more than once.

alter table public.dm_messages replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.dm_messages;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
