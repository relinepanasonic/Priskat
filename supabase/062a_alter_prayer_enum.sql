-- Run this file FIRST!
-- Postgres requires new ENUM values to be committed before they can be used in the same transaction.

ALTER TYPE public.prayer_category ADD VALUE IF NOT EXISTS 'basic_prayer';
ALTER TYPE public.prayer_category ADD VALUE IF NOT EXISTS 'doa_ekaristi';

