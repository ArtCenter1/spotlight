-- This script fixes the search_path for all database functions.

-- Trigger Functions from 0001_initial_schema.sql
CREATE OR REPLACE FUNCTION public.increment_posts_count()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN UPDATE public.users SET posts_count = posts_count + 1 WHERE id = NEW.user_id; RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.decrement_posts_count()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN UPDATE public.users SET posts_count = posts_count - 1 WHERE id = OLD.user_id; RETURN OLD; END; $$;
CREATE OR REPLACE FUNCTION public.increment_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id; RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.decrement_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id; RETURN OLD; END; $$;
CREATE OR REPLACE FUNCTION public.increment_comments_count()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id; RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.decrement_comments_count()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id; RETURN OLD; END; $$;
CREATE OR REPLACE FUNCTION public.increment_follow_counts()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN UPDATE public.users SET following_count = following_count + 1 WHERE id = NEW.follower_id; UPDATE public.users SET followers_count = followers_count + 1 WHERE id = NEW.following_id; RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.decrement_follow_counts()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN UPDATE public.users SET following_count = following_count - 1 WHERE id = OLD.follower_id; UPDATE public.users SET followers_count = followers_count - 1 WHERE id = OLD.following_id; RETURN OLD; END; $$;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN INSERT INTO public.users (id, username, full_name, avatar_url) VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url'); RETURN NEW; END; $$;

-- RPC Functions from other migration files
CREATE OR REPLACE FUNCTION public.get_feed_posts(p_current_user_id uuid)
RETURNS TABLE(id bigint, user_id uuid, image_url text, caption text, created_at timestamp with time zone, likes_count integer, comments_count integer, author_username text, author_avatar_url text, is_liked boolean, is_bookmarked boolean)
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RETURN QUERY SELECT p.id, p.user_id, p.image_url, p.caption, p.created_at, p.likes_count, p.comments_count, u.username AS author_username, u.avatar_url AS author_avatar_url, EXISTS(SELECT 1 FROM public.likes l WHERE l.post_id = p.id AND l.user_id = p_current_user_id) AS is_liked, EXISTS(SELECT 1 FROM public.bookmarks b WHERE b.post_id = p.id AND b.user_id = p_current_user_id) AS is_bookmarked FROM public.posts p JOIN public.users u ON p.user_id = u.id ORDER BY p.created_at DESC; END; $$;
CREATE OR REPLACE FUNCTION public.toggle_like(p_post_id bigint, p_user_id uuid)
RETURNS boolean LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_is_liked boolean; v_post_author_id uuid;
BEGIN SELECT EXISTS(SELECT 1 FROM public.likes WHERE post_id = p_post_id AND user_id = p_user_id) INTO v_is_liked;
IF v_is_liked THEN DELETE FROM public.likes WHERE post_id = p_post_id AND user_id = p_user_id; RETURN false;
ELSE INSERT INTO public.likes (post_id, user_id) VALUES (p_post_id, p_user_id);
SELECT user_id INTO v_post_author_id FROM public.posts WHERE id = p_post_id;
IF p_user_id != v_post_author_id THEN INSERT INTO public.notifications(recipient_id, sender_id, type, post_id) VALUES (v_post_author_id, p_user_id, 'like', p_post_id); END IF;
RETURN true; END IF; END; $$;
CREATE OR REPLACE FUNCTION public.delete_post(p_post_id bigint, p_user_id uuid)
RETURNS void LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_post_author_id uuid; v_image_url text; v_image_path text;
BEGIN SELECT user_id, image_url INTO v_post_author_id, v_image_url FROM public.posts WHERE id = p_post_id;
IF v_post_author_id IS NULL THEN RAISE EXCEPTION 'Post not found'; END IF;
IF v_post_author_id != p_user_id THEN RAISE EXCEPTION 'User is not the author of the post'; END IF;
v_image_path := substr(v_image_url, strpos(v_image_url, '/posts/') + 7);
PERFORM storage.delete_object('posts', v_image_path);
DELETE FROM public.posts WHERE id = p_post_id; END; $$;
CREATE OR REPLACE FUNCTION public.toggle_bookmark(p_post_id bigint, p_user_id uuid)
RETURNS boolean LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_is_bookmarked boolean;
BEGIN SELECT EXISTS(SELECT 1 FROM public.bookmarks WHERE post_id = p_post_id AND user_id = p_user_id) INTO v_is_bookmarked;
IF v_is_bookmarked THEN DELETE FROM public.bookmarks WHERE post_id = p_post_id AND user_id = p_user_id; RETURN false;
ELSE INSERT INTO public.bookmarks (post_id, user_id) VALUES (p_post_id, p_user_id); RETURN true; END IF; END; $$;
CREATE OR REPLACE FUNCTION public.get_comments(p_post_id bigint)
RETURNS TABLE(id bigint, user_id uuid, post_id bigint, content text, created_at timestamptz, author_username text, author_avatar_url text)
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RETURN QUERY SELECT c.id, c.user_id, c.post_id, c.content, c.created_at, u.username AS author_username, u.avatar_url AS author_avatar_url FROM public.comments c JOIN public.users u ON c.user_id = u.id WHERE c.post_id = p_post_id ORDER BY c.created_at ASC; END; $$;
CREATE OR REPLACE FUNCTION public.add_comment(p_post_id bigint, p_user_id uuid, p_content text)
RETURNS void LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_post_author_id uuid;
BEGIN INSERT INTO public.comments (post_id, user_id, content) VALUES (p_post_id, p_user_id, p_content);
SELECT user_id INTO v_post_author_id FROM public.posts WHERE id = p_post_id;
IF p_user_id != v_post_author_id THEN INSERT INTO public.notifications(recipient_id, sender_id, type, post_id) VALUES (v_post_author_id, p_user_id, 'comment', p_post_id); END IF; END; $$;
CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id uuid)
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio text, website text, followers_count integer, following_count integer, posts_count integer)
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RETURN QUERY SELECT u.id, u.username, u.full_name, u.avatar_url, u.bio, u.website, u.followers_count, u.following_count, u.posts_count FROM public.users u WHERE u.id = p_user_id; END; $$;
CREATE OR REPLACE FUNCTION public.get_user_posts(p_user_id uuid)
RETURNS TABLE(id bigint, user_id uuid, image_url text, caption text, created_at timestamptz, likes_count integer, comments_count integer)
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RETURN QUERY SELECT p.id, p.user_id, p.image_url, p.caption, p.created_at, p.likes_count, p.comments_count FROM public.posts p WHERE p.user_id = p_user_id ORDER BY p.created_at DESC; END; $$;
CREATE OR REPLACE FUNCTION public.update_user_profile(p_user_id uuid, p_full_name text, p_bio text, p_website text)
RETURNS void LANGUAGE plpgsql SET search_path = public AS $$
BEGIN UPDATE public.users SET full_name = p_full_name, bio = p_bio, website = p_website WHERE id = p_user_id; END; $$;
