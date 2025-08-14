ALTER FUNCTION public.get_feed_posts(uuid) SET search_path = public;
ALTER FUNCTION public.toggle_like(bigint, uuid) SET search_path = public;
ALTER FUNCTION public.delete_post(bigint, uuid) SET search_path = public;
ALTER FUNCTION public.get_comments(bigint) SET search_path = public;
ALTER FUNCTION public.add_comment(bigint, uuid, text) SET search_path = public;
ALTER FUNCTION public.get_user_profile(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_posts(uuid) SET search_path = public;
ALTER FUNCTION public.update_user_profile(uuid, text, text, text) SET search_path = public;
