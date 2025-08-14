CREATE OR REPLACE FUNCTION toggle_like(p_post_id bigint, p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_is_liked boolean;
  v_post_author_id uuid;
BEGIN
  -- Check if the like exists
  SELECT EXISTS(SELECT 1 FROM public.likes WHERE post_id = p_post_id AND user_id = p_user_id)
  INTO v_is_liked;

  IF v_is_liked THEN
    -- Like exists, so delete it
    DELETE FROM public.likes WHERE post_id = p_post_id AND user_id = p_user_id;
    -- The trigger on the likes table will automatically decrement the likes_count
    RETURN false;
  ELSE
    -- Like does not exist, so insert it
    INSERT INTO public.likes (post_id, user_id)
    VALUES (p_post_id, p_user_id);
    -- The trigger on the likes table will automatically increment the likes_count

    -- Create a notification if it's not the user's own post
    SELECT user_id INTO v_post_author_id FROM public.posts WHERE id = p_post_id;
    IF p_user_id != v_post_author_id THEN
        INSERT INTO public.notifications(recipient_id, sender_id, type, post_id)
        VALUES (v_post_author_id, p_user_id, 'like', p_post_id);
    END IF;

    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql;
