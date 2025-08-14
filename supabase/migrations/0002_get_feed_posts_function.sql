CREATE OR REPLACE FUNCTION public.get_feed_posts(p_current_user_id uuid)
RETURNS TABLE (
    id bigint,
    user_id uuid,
    image_url text,
    caption text,
    created_at timestamp with time zone,
    likes_count integer,
    comments_count integer,
    author_username text,
    author_avatar_url text,
    is_liked boolean,
    is_bookmarked boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.user_id,
        p.image_url,
        p.caption,
        p.created_at,
        p.likes_count,
        p.comments_count,
        u.username AS author_username,
        u.avatar_url AS author_avatar_url,
        EXISTS(SELECT 1 FROM public.likes l WHERE l.post_id = p.id AND l.user_id = p_current_user_id) AS is_liked,
        EXISTS(SELECT 1 FROM public.bookmarks b WHERE b.post_id = p.id AND b.user_id = p_current_user_id) AS is_bookmarked
    FROM
        public.posts p
    JOIN
        public.users u ON p.user_id = u.id
    ORDER BY
        p.created_at DESC;
END;
$$;
