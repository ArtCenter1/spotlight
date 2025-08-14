CREATE OR REPLACE FUNCTION toggle_bookmark(p_post_id bigint, p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_is_bookmarked boolean;
BEGIN
  -- Check if the bookmark exists
  SELECT EXISTS(SELECT 1 FROM public.bookmarks WHERE post_id = p_post_id AND user_id = p_user_id)
  INTO v_is_bookmarked;

  IF v_is_bookmarked THEN
    -- Bookmark exists, so delete it
    DELETE FROM public.bookmarks WHERE post_id = p_post_id AND user_id = p_user_id;
    RETURN false;
  ELSE
    -- Bookmark does not exist, so insert it
    INSERT INTO public.bookmarks (post_id, user_id)
    VALUES (p_post_id, p_user_id);
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql;
