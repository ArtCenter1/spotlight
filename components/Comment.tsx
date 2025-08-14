import { View, Text } from "react-native";
import { styles } from "@/styles/feed.styles";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { CommentType } from "@/types/database.types";

export default function Comment({ comment }: { comment: CommentType }) {
  return (
    <View style={styles.commentContainer}>
      <Image source={{ uri: comment.author_avatar_url }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{comment.author_username}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
        <Text style={styles.commentTime}>
          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}
