-- 070_devotion_progress_delete_policy.sql
-- user_devotion_progress has RLS enabled with SELECT/INSERT/UPDATE policies
-- but NO DELETE policy, so removing a plan from "Currently Reading" silently
-- affected 0 rows and the plan reappeared on refresh. Add the missing policy.
-- Idempotent.

DROP POLICY IF EXISTS "Users can delete own progress" ON public.user_devotion_progress;
CREATE POLICY "Users can delete own progress"
  ON public.user_devotion_progress FOR DELETE
  USING (auth.uid() = user_id);
