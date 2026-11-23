-- A second WhatsApp message per event: the invitation to register, shared with the registration link.
-- (The first one, wa_template, is the message with the QR for people who paid.) Never empty when set.
-- Run once in the Supabase SQL editor. Safe to run again.
ALTER TABLE public.event_reg_settings ADD COLUMN IF NOT EXISTS wa_invite_template text;
ALTER TABLE public.event_reg_settings DROP CONSTRAINT IF EXISTS event_reg_settings_wa_invite_check;
ALTER TABLE public.event_reg_settings ADD CONSTRAINT event_reg_settings_wa_invite_check
  CHECK (wa_invite_template IS NULL OR (char_length(btrim(wa_invite_template)) BETWEEN 10 AND 1000));
