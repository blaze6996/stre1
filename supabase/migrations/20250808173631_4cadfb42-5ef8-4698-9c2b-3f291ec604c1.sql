-- Admin-secured RPC to delete a series (and its episodes)
CREATE OR REPLACE FUNCTION public.admin_delete_series(
  admin_code text,
  p_series_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF admin_code <> 'Shivam2008' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Delete child episodes first
  DELETE FROM public.episodes WHERE series_id = p_series_id;
  -- Then delete the series
  DELETE FROM public.series WHERE id = p_series_id;
END;
$$;

-- Admin-secured RPC to delete an episode
CREATE OR REPLACE FUNCTION public.admin_delete_episode(
  admin_code text,
  p_episode_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF admin_code <> 'Shivam2008' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM public.episodes WHERE id = p_episode_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_series(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_episode(text, uuid) TO anon, authenticated;