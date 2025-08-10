-- Add YouTube support columns (idempotent)
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS youtube_playlist_id text;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS youtube_video_id text;

-- Replace admin_create_series (variant with category)
CREATE OR REPLACE FUNCTION public.admin_create_series(
  admin_code text,
  title text,
  description text DEFAULT NULL::text,
  cover_image_url text DEFAULT NULL::text,
  dailymotion_playlist_id text DEFAULT NULL::text,
  slug text DEFAULT NULL::text,
  is_published boolean DEFAULT false,
  category public.series_category DEFAULT NULL::public.series_category,
  youtube_playlist_id text DEFAULT NULL::text
)
RETURNS public.series
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  RETURNING * INTO new_row;

  RETURN new_row;
END;
$function$;

-- Replace admin_create_series (variant without category)
CREATE OR REPLACE FUNCTION public.admin_create_series(
  admin_code text,
  title text,
  description text DEFAULT NULL::text,
  cover_image_url text DEFAULT NULL::text,
  dailymotion_playlist_id text DEFAULT NULL::text,
  slug text DEFAULT NULL::text,
  is_published boolean DEFAULT false,
  youtube_playlist_id text DEFAULT NULL::text
)
RETURNS public.series
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    youtube_playlist_id,
    slug,
    is_published
  ) VALUES (
    title,
    description,
    cover_image_url,
    dailymotion_playlist_id,
    youtube_playlist_id,
    slug,
    COALESCE(is_published, false)
  )
  RETURNING * INTO new_row;

  RETURN new_row;
END;
$function$;

-- Replace admin_create_episode to accept youtube_video_id
CREATE OR REPLACE FUNCTION public.admin_create_episode(
  admin_code text,
  series_id uuid,
  title text,
  dailymotion_video_id text,
  description text DEFAULT NULL::text,
  season_number integer DEFAULT NULL::integer,
  episode_number integer DEFAULT NULL::integer,
  published_at timestamp with time zone DEFAULT NULL::timestamp with time zone,
  youtube_video_id text DEFAULT NULL::text
)
RETURNS public.episodes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  RETURNING * INTO new_row;

  RETURN new_row;
END;
$function$;