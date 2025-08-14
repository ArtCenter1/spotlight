CREATE OR REPLACE FUNCTION get_user_profile(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    username text,
    full_name text,
    avatar_url text,
    bio text,
    website text,
    followers_count integer,
    following_count integer,
    posts_count integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.username, u.full_name, u.avatar_url, u.bio, u.website, u.followers_count, u.following_count, u.posts_count
    FROM public.users u WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_posts(p_user_id uuid)
RETURNS TABLE (
    id bigint,
    user_id uuid,
    image_url text,
    caption text,
    created_at timestamptz,
    likes_count integer,
    comments_count integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.user_id, p.image_url, p.caption, p.created_at, p.likes_count, p.comments_count
    FROM public.posts p WHERE p.user_id = p_user_id ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;
