CREATE OR REPLACE FUNCTION delete_post(p_post_id bigint, p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_post_author_id uuid;
  v_image_url text;
  v_image_path text;
BEGIN
  -- 1. Verify ownership
  SELECT user_id, image_url INTO v_post_author_id, v_image_url
  FROM public.posts WHERE id = p_post_id;

  IF v_post_author_id IS NULL THEN
    RAISE EXCEPTION 'Post not found';
  END IF;

  IF v_post_author_id != p_user_id THEN
    RAISE EXCEPTION 'User is not the author of the post';
  END IF;

  -- 2. Delete the image from storage
  -- The image path is part of the URL. e.g., .../storage/v1/object/public/posts/user_id/image.jpg
  -- I need to extract the path 'user_id/image.jpg' from the URL.
  v_image_path := substr(v_image_url, strpos(v_image_url, '/posts/') + 7);
  PERFORM storage.delete_object('posts', v_image_path);

  -- 3. Delete the post record (cascading deletes and triggers will handle the rest)
  DELETE FROM public.posts WHERE id = p_post_id;

END;
$$ LANGUAGE plpgsql;
