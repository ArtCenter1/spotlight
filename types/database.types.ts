export type PostType = {
  id: number;
  user_id: string;
  image_url: string;
  caption?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  author_username: string;
  author_avatar_url: string;
  is_liked: boolean;
  is_bookmarked: boolean;
};

export type CommentType = {
  id: number;
  user_id: string;
  post_id: number;
  content: string;
  created_at: string;
  author_username: string;
  author_avatar_url: string;
};

export type ProfileType = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  website: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
};
