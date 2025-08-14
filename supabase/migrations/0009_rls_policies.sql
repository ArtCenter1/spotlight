-- 1. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Add policies for the 'users' table
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- 3. Add policies for the 'posts' table
CREATE POLICY "Posts are viewable by everyone." ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts." ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts." ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- 4. Add policies for the 'likes' table
CREATE POLICY "Likes are viewable by everyone." ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes." ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes." ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- 5. Add policies for the 'bookmarks' table
CREATE POLICY "Bookmarks are viewable by everyone." ON public.bookmarks FOR SELECT USING (true);
CREATE POLICY "Users can insert their own bookmarks." ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks." ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- 6. Add policies for the 'comments' table
CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments." ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments." ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- 7. Add policies for the 'follows' table
CREATE POLICY "Follows are viewable by everyone." ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can insert their own follows." ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows." ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- 8. Add policies for the 'notifications' table
CREATE POLICY "Users can view their own notifications." ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
