-- Drop the old, inefficient RLS policies
DROP POLICY "Users can update their own profile." ON public.users;
DROP POLICY "Users can insert their own posts." ON public.posts;
DROP POLICY "Users can delete their own posts." ON public.posts;
DROP POLICY "Users can insert their own likes." ON public.likes;
DROP POLICY "Users can delete their own likes." ON public.likes;
DROP POLICY "Users can insert their own bookmarks." ON public.bookmarks;
DROP POLICY "Users can delete their own bookmarks." ON public.bookmarks;
DROP POLICY "Users can insert their own comments." ON public.comments;
DROP POLICY "Users can delete their own comments." ON public.comments;
DROP POLICY "Users can insert their own follows." ON public.follows;
DROP POLICY "Users can delete their own follows." ON public.follows;
DROP POLICY "Users can view their own notifications." ON public.notifications;

-- Create the new, optimized RLS policies
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING ((select auth.uid()) = id);
CREATE POLICY "Users can insert their own posts." ON public.posts FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own posts." ON public.posts FOR DELETE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own likes." ON public.likes FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own likes." ON public.likes FOR DELETE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own bookmarks." ON public.bookmarks FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own bookmarks." ON public.bookmarks FOR DELETE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own comments." ON public.comments FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own comments." ON public.comments FOR DELETE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own follows." ON public.follows FOR INSERT WITH CHECK ((select auth.uid()) = follower_id);
CREATE POLICY "Users can delete their own follows." ON public.follows FOR DELETE USING ((select auth.uid()) = follower_id);
CREATE POLICY "Users can view their own notifications." ON public.notifications FOR SELECT USING ((select auth.uid()) = recipient_id);
