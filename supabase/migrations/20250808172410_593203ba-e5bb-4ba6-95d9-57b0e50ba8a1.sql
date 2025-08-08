-- Ensure update_updated_at_column has proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create updated_at triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_series_updated_at'
  ) THEN
    CREATE TRIGGER trg_series_updated_at
    BEFORE UPDATE ON public.series
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_episodes_updated_at'
  ) THEN
    CREATE TRIGGER trg_episodes_updated_at
    BEFORE UPDATE ON public.episodes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- Admin-secured RPC to create a series
CREATE OR REPLACE FUNCTION public.admin_create_series(
  admin_code text,
  title text,
  description text DEFAULT NULL,
  cover_image_url text DEFAULT NULL,
  dailymotion_playlist_id text DEFAULT NULL,
  slug text DEFAULT NULL,
  is_published boolean DEFAULT false
)
RETURNS public.series
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_row public.series;
BEGIN
  IF admin_code <> 'Shivam2008' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.series (
    title,
    description,
    cover_image_url,
    dailymotion_playlist_id,
    slug,
    is_published
  ) VALUES (
    title,
    description,
    cover_image_url,
    dailymotion_playlist_id,
    slug,
    COALESCE(is_published, false)
  )
  RETURNING * INTO new_row;

  RETURN new_row;
END;
$$;

-- Admin-secured RPC to create an episode
CREATE OR REPLACE FUNCTION public.admin_create_episode(
  admin_code text,
  series_id uuid,
  title text,
  dailymotion_video_id text,
  description text DEFAULT NULL,
  season_number int DEFAULT NULL,
  episode_number int DEFAULT NULL,
  published_at timestamptz DEFAULT NULL
)
RETURNS public.episodes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_row public.episodes;
BEGIN
  IF admin_code <> 'Shivam2008' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.episodes (
    series_id,
    title,
    dailymotion_video_id,
    description,
    season_number,
    episode_number,
    published_at
  ) VALUES (
    series_id,
    title,
    dailymotion_video_id,
    description,
    season_number,
    episode_number,
    published_at
  )
  RETURNING * INTO new_row;

  RETURN new_row;
END;
$$;

-- Grant execute permissions to web roles
GRANT EXECUTE ON FUNCTION public.admin_create_series(text, text, text, text, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_episode(text, uuid, text, text, text, int, int, timestamptz) TO anon, authenticated;