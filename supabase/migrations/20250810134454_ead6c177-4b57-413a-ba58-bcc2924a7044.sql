-- Add YouTube support columns
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS youtube_playlist_id text;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS youtube_video_id text;

-- Extend admin_create_series to accept YouTube playlist id (keeps same name for compatibility)
CREATE OR REPLACE FUNCTION public.admin_create_series(
  admin_code text,
  title text,
  description text,
  cover_image_url text,
  dailymotion_playlist_id text,
  slug text,
  is_published boolean,
  category category,
  youtube_playlist_id text DEFAULT NULL
)
RETURNS public.series
LANGUAGE plpgsql
AS $$
DECLARE
  s public.series%ROWTYPE;
BEGIN
  IF admin_code <> 'Shivam2008' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  INSERT INTO public.series (
    title,
    description,
    cover_image_url,
    dailymotion_playlist_id,
    youtube_playlist_id,
    slug,
    is_published,
    category
  ) VALUES (
    title,
    description,
    cover_image_url,
    dailymotion_playlist_id,
    youtube_playlist_id,
    slug,
    COALESCE(is_published, false),
    category
  )
  RETURNING * INTO s;
  RETURN s;
END;
$$;

-- Extend admin_create_episode to accept YouTube video id (keeps same name for compatibility)
CREATE OR REPLACE FUNCTION public.admin_create_episode(
  admin_code text,
  series_id uuid,
  title text,
  dailymotion_video_id text,
  description text,
  season_number integer,
  episode_number integer,
  published_at timestamptz,
  youtube_video_id text DEFAULT NULL
)
RETURNS public.episodes
LANGUAGE plpgsql
AS $$
DECLARE
  e public.episodes%ROWTYPE;
BEGIN
  IF admin_code <> 'Shivam2008' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  INSERT INTO public.episodes (
    series_id,
    title,
    dailymotion_video_id,
    youtube_video_id,
    description,
    season_number,
    episode_number,
    published_at
  ) VALUES (
    series_id,
    title,
    dailymotion_video_id,
    youtube_video_id,
    description,
    season_number,
    episode_number,
    published_at
  )
  RETURNING * INTO e;
  RETURN e;
END;
$$;