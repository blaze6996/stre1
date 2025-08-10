-- Update admin_create_series to accept category and set it on insert
CREATE OR REPLACE FUNCTION public.admin_create_series(
  admin_code text,
  title text,
  description text DEFAULT NULL,
  cover_image_url text DEFAULT NULL,
  dailymotion_playlist_id text DEFAULT NULL,
  slug text DEFAULT NULL,
  is_published boolean DEFAULT false,
  category public.series_category DEFAULT NULL
)
RETURNS series
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
    slug,
    is_published,
    category
  ) VALUES (
    title,
    description,
    cover_image_url,
    dailymotion_playlist_id,
    slug,
    COALESCE(is_published, false),
    category
  )
  RETURNING * INTO new_row;

  RETURN new_row;
END;
$function$;