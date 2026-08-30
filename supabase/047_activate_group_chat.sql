-- 047_activate_group_chat.sql
-- The community "Group" tab (Telegram-style chat) now consumes the
-- groups / group_members / group_subgroups / group_messages tables that were
-- created back in 027_community_social.sql. Those tables + RLS already exist;
-- this migration only adds indexes for the chat queries and makes sure the
-- realtime publication is in place. Safe to run more than once.

CREATE INDEX IF NOT EXISTS idx_group_messages_subgroup_created
  ON public.group_messages (subgroup_id, created_at);

CREATE INDEX IF NOT EXISTS idx_group_subgroups_group
  ON public.group_subgroups (group_id);

CREATE INDEX IF NOT EXISTS idx_group_members_user_status
  ON public.group_members (user_id, status);

CREATE INDEX IF NOT EXISTS idx_group_members_group_status
  ON public.group_members (group_id, status);

-- Live messages. 027 already adds this table to the publication; keep idempotent.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
