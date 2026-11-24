-- 144_rich_push.sql
-- Adds rich push capability tracking on push_tokens (for Build 12+ circular avatar + big picture + action buttons)
-- and a log table so friend suggestion notifications are never repeated for the same pair.

alter table public.push_tokens
  add column if not exists rich_supported boolean not null default false;

create table if not exists public.friend_suggestion_log (
  user_id uuid not null references public.profiles(id) on delete cascade,
  suggested_id uuid not null references public.profiles(id) on delete cascade,
  sent_at timestamptz not null default now(),
  primary key (user_id, suggested_id)
);

alter table public.friend_suggestion_log enable row level security;

-- Only service role (server cron) reads/writes this table.
create index if not exists idx_friend_suggestion_log_user_sent
  on public.friend_suggestion_log (user_id, sent_at desc);
