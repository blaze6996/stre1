-- Add views and ratings to series
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'series' AND column_name = 'views_count'
  ) THEN
    ALTER TABLE public.series
      ADD COLUMN views_count bigint NOT NULL DEFAULT 0,
      ADD COLUMN rating_sum integer NOT NULL DEFAULT 0,
      ADD COLUMN rating_count integer NOT NULL DEFAULT 0;
  END IF;
END$$;

-- Function to increment views (public)
CREATE OR REPLACE FUNCTION public.increment_series_view(p_series_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_views bigint;
BEGIN
  UPDATE public.series
  SET views_count = views_count + 1,
      updated_at = now()
  WHERE id = p_series_id
  RETURNING views_count INTO new_views;

  RETURN new_views;
END;
$$;

-- Function to rate a series (1..5)
CREATE OR REPLACE FUNCTION public.rate_series(p_series_id uuid, p_rating int)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating numeric;
BEGIN
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  UPDATE public.series
  SET rating_sum = rating_sum + p_rating,
      rating_count = rating_count + 1,
      updated_at = now()
  WHERE id = p_series_id;

  SELECT CASE WHEN rating_count = 0 THEN 0 ELSE rating_sum::numeric / rating_count END
  INTO avg_rating
  FROM public.series WHERE id = p_series_id;

  RETURN avg_rating;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_series_view(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rate_series(uuid, int) TO anon, authenticated;

-- Enable realtime with full row on updates
ALTER TABLE public.series REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.series;