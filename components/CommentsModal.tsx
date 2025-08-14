import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/feed.styles";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { Loader } from "./Loader";
import Comment from "./Comment";
import { useAuth } from "@/providers/SupabaseProvider";
import { CommentType } from "@/types/database.types";
import { supabase } from "@/lib/supabase";

type CommentsModalProps = {
  postId: number;
  visible: boolean;
  onClose: () => void;
};

export default function CommentsModal({ onClose, postId, visible }: CommentsModalProps) {
  const { session } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_comments", { p_post_id: postId });
    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !session) return;

    try {
      // Optimistically update UI
      const optimisticComment: CommentType = {
        id: Math.random(),
        post_id: postId,
        user_id: session.user.id,
        content: newComment,
        created_at: new Date().toISOString(),
        author_username: session.user.user_metadata?.username || "You",
        author_avatar_url: session.user.user_metadata?.avatar_url || "",
      };
      setComments([...comments, optimisticComment]);
      setNewComment("");

      await supabase.rpc("add_comment", {
        p_post_id: postId,
        p_user_id: session.user.id,
        p_content: newComment.trim(),
      });

      // Refresh comments from DB to get the real ID and timestamp
      fetchComments();
    } catch (error) {
      console.log("Error adding comment:", error);
      // TODO: Revert optimistic update on error
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comments</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <Loader />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <Comment comment={item} />}
            contentContainerStyle={styles.commentsList}
          />
        )}

        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={COLORS.grey}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />

          <TouchableOpacity onPress={handleAddComment} disabled={!newComment.trim()}>
            <Text style={[styles.postButton, !newComment.trim() && styles.postButtonDisabled]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
