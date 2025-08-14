import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/profile.styles";
import { useAuth } from "@/providers/SupabaseProvider";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from "react-native";

export default function Profile() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: "",
    bio: "",
    website: "",
  });

  const fetchData = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        supabase.rpc("get_user_profile", { p_user_id: session.user.id }),
        supabase.rpc("get_user_posts", { p_user_id: session.user.id }),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (postsRes.error) throw postsRes.error;

      setProfile(profileRes.data[0]);
      setPosts(postsRes.data);
      setEditedProfile({
        full_name: profileRes.data[0]?.full_name || "",
        bio: profileRes.data[0]?.bio || "",
        website: profileRes.data[0]?.website || "",
      });
    } catch (error: any) {
      console.error("Error fetching profile data:", error);
      Alert.alert("Error", "Failed to fetch profile data. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const handleSaveProfile = async () => {
    if (!session?.user?.id) return;
    try {
      const { error } = await supabase.rpc("update_user_profile", {
        p_user_id: session.user.id,
        p_full_name: editedProfile.full_name,
        p_bio: editedProfile.bio,
        p_website: editedProfile.website,
      });
      if (error) throw error;
      Alert.alert("Success", "Profile updated successfully!");
      setIsEditModalVisible(false);
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. " + error.message);
    }
  };

  if (loading) return <Loader />;
  if (!profile) return <Text>Profile not found.</Text>;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>{profile.username}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => supabase.auth.signOut()}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          {/* AVATAR & STATS */}
          <View style={styles.avatarAndStats}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.posts_count}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.followers_count}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile.following_count}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <Text style={styles.name}>{profile.full_name}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditModalVisible(true)}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {posts.length === 0 ? (
          <NoPostsFound />
        ) : (
          <FlatList
            data={posts}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.gridItem}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.gridImage}
                  contentFit="cover"
                  transition={200}
                />
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedProfile.full_name}
                  onChangeText={(text) => setEditedProfile((prev) => ({ ...prev, full_name: text }))}
                  placeholderTextColor={COLORS.grey}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={editedProfile.bio}
                  onChangeText={(text) => setEditedProfile((prev) => ({ ...prev, bio: text }))}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={COLORS.grey}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

function NoPostsFound() {
  return (
    <View
      style={{
        height: "100%",
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name="images-outline" size={48} color={COLORS.primary} />
      <Text style={{ fontSize: 20, color: COLORS.white }}>No posts yet</Text>
    </View>
  );
}
