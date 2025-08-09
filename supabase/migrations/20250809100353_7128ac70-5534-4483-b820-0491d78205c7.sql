-- Add series category enum and column + full-text search support
-- 1) Create enum type for category
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'series_category') THEN
    CREATE TYPE public.series_category AS ENUM ('donghua','anime','movie','cartoon');
  END IF;
END $$;

-- 2) Add column to series table
ALTER TABLE public.series
ADD COLUMN IF NOT EXISTS category public.series_category;

-- 3) Index for category filtering
CREATE INDEX IF NOT EXISTS idx_series_category ON public.series (category);

-- 4) Add generated tsvector column for fast full-text search of title + description
ALTER TABLE public.series
ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
) STORED;

-- 5) GIN index for FTS
CREATE INDEX IF NOT EXISTS idx_series_fts ON public.series USING GIN (fts);
