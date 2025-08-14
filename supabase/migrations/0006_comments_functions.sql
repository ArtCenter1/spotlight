CREATE OR REPLACE FUNCTION get_comments(p_post_id bigint)
RETURNS TABLE (
    id bigint,
    user_id uuid,
    post_id bigint,
    content text,
    created_at timestamptz,
    author_username text,
    author_avatar_url text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.user_id,
        c.post_id,
        c.content,
        c.created_at,
        u.username AS author_username,
        u.avatar_url AS author_avatar_url
    FROM
        public.comments c
    JOIN
        public.users u ON c.user_id = u.id
    WHERE
        c.post_id = p_post_id
    ORDER BY
        c.created_at ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_comment(p_post_id bigint, p_user_id uuid, p_content text)
RETURNS void AS $$
DECLARE
  v_post_author_id uuid;
BEGIN
  -- Insert the new comment
  INSERT INTO public.comments (post_id, user_id, content)
  VALUES (p_post_id, p_user_id, p_content);
  -- The trigger on the comments table will automatically increment the comments_count

  -- Create a notification if it's not the user's own post
  SELECT user_id INTO v_post_author_id FROM public.posts WHERE id = p_post_id;
  IF p_user_id != v_post_author_id THEN
      INSERT INTO public.notifications(recipient_id, sender_id, type, post_id)
      VALUES (v_post_author_id, p_user_id, 'comment', p_post_id);
  END IF;
END;
$$ LANGUAGE plpgsql;
