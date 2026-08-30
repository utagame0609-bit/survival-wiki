ALTER TABLE public.locations
ADD COLUMN IF NOT EXISTS has_coordinates boolean NOT NULL DEFAULT true;
