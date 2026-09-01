-- 057_event_maps_url.sql
-- The Community Center "Promotion" flow lets staff attach a Google Maps
-- share link to an event alongside the plain-text location.
-- Idempotent — safe to run more than once.

alter table public.events add column if not exists maps_url text;
