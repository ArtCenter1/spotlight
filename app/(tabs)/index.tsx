import { Loader } from "@/components/Loader";
import Post from "@/components/Post";
import StoriesSection from "@/components/Stories";
import { COLORS } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/SupabaseProvider";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/feed.styles";
import { useEffect, useState } from "react";
import { PostType } from "@/types/database.types";

export default function Index() {
  const { session } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase.rpc("get_feed_posts", {
        p_current_user_id: session.user.id,
      });

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [session]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>spotlight</Text>
        <TouchableOpacity onPress={() => supabase.auth.signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {posts.length === 0 ? (
        <NoPostsFound />
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => <Post post={item} />}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
          ListHeaderComponent={<StoriesSection />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
}

const NoPostsFound = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: COLORS.background,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Text style={{ fontSize: 20, color: COLORS.primary }}>No posts yet</Text>
  </View>
);
