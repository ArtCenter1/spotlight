import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import CommentsModal from "./CommentsModal";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/providers/SupabaseProvider";
import { supabase } from "@/lib/supabase";

import { PostType } from "@/types/database.types";

type PostProps = {
  post: PostType;
};

export default function Post({ post }: PostProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked);
  const [showComments, setShowComments] = useState(false);

  const { session } = useAuth();
  const currentUserId = session?.user?.id;

  const handleLike = async () => {
    if (!currentUserId) return;

    // Optimistic UI update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(newIsLiked ? likesCount + 1 : likesCount - 1);

    const { data, error } = await supabase.rpc("toggle_like", {
      p_post_id: post.id,
      p_user_id: currentUserId,
    });

    if (error) {
      // Revert UI on error
      setIsLiked(!newIsLiked);
      setLikesCount(newIsLiked ? likesCount - 1 : likesCount + 1);
      console.error("Error toggling like:", error);
    }
  };

  const handleBookmark = async () => {
    if (!currentUserId) return;

    // Optimistic UI update
    const newIsBookmarked = !isBookmarked;
    setIsBookmarked(newIsBookmarked);

    const { data, error } = await supabase.rpc("toggle_bookmark", {
      p_post_id: post.id,
      p_user_id: currentUserId,
    });

    if (error) {
      // Revert UI on error
      setIsBookmarked(!newIsBookmarked);
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleDelete = async () => {
    if (!currentUserId) return;

    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.rpc("delete_post", {
            p_post_id: post.id,
            p_user_id: currentUserId,
          });

          if (error) {
            console.error("Error deleting post:", error);
            Alert.alert("Error", "Failed to delete post.");
          } else {
            Alert.alert("Success", "Post deleted.");
            // TODO: Refresh the feed after deletion
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.post}>
      {/* POST HEADER */}
      <View style={styles.postHeader}>
        <Link
          href={
            currentUserId === post.user_id ? "/(tabs)/profile" : `/user/${post.user_id}`
          }
          asChild
        >
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              source={{ uri: post.author_avatar_url }}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <Text style={styles.postUsername}>{post.author_username}</Text>
          </TouchableOpacity>
        </Link>

        {post.user_id === currentUserId ? (
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* IMAGE */}
      <Image
        source={{ uri: post.image_url }}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />

      {/* POST ACTIONS */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? COLORS.primary : COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Ionicons name="chatbubble-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleBookmark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      {/* POST INFO */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {likesCount > 0 ? `${likesCount.toLocaleString()} likes` : "Be the first to like"}
        </Text>
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author_username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        {post.comments_count > 0 && (
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Text style={styles.commentsText}>View all {post.comments_count} comments</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.timeAgo}>
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </Text>
      </View>

      <CommentsModal
        postId={post.id}
        visible={showComments}
        onClose={() => setShowComments(false)}
      />
    </View>
  );
}
