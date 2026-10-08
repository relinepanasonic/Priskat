-- Migration: 077_favorite_verses.sql
-- Creates the table to store user's favorite/highlighted Bible verses

create table if not exists favorite_verses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id integer not null,
  book_name text not null,
  chapter integer not null,
  verse_number integer not null,
  verse_content text not null,
  lang text not null default 'id',
  note text,
  created_at timestamptz not null default now(),
  unique(user_id, book_id, chapter, verse_number, lang)
);

alter table favorite_verses enable row level security;

create policy "Users can view own favorites"
  on favorite_verses for select
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on favorite_verses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on favorite_verses for delete
  using (auth.uid() = user_id);
