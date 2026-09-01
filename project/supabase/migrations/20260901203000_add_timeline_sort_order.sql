ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS timeline_sort_order text NOT NULL DEFAULT 'oldest';

ALTER TABLE public.user_settings
  DROP CONSTRAINT IF EXISTS user_settings_timeline_sort_order_check;

ALTER TABLE public.user_settings
  ADD CONSTRAINT user_settings_timeline_sort_order_check
  CHECK (timeline_sort_order IN ('oldest', 'newest'));
