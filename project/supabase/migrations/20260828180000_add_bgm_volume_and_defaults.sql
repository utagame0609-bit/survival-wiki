-- Audio settings: add account-bound BGM volume and set new-user defaults to 30%.
-- Existing rows keep their current saved values.

ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS bgm_volume integer NOT NULL DEFAULT 30
  CHECK (bgm_volume >= 0 AND bgm_volume <= 100);

ALTER TABLE public.user_settings
  ALTER COLUMN se_volume SET DEFAULT 30,
  ALTER COLUMN se_reverb SET DEFAULT 30;
