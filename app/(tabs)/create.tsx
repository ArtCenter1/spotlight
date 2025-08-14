import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/create.styles";
import { useAuth } from "@/providers/SupabaseProvider";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-js";

export default function CreateScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // TODO: Fetch user profile from Supabase to get avatar
  const user = { imageUrl: "https://randomuser.me/api/portraits/men/32.jpg" };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleShare = async () => {
    if (!selectedImage || !session) return;
    setIsSharing(true);

    try {
      const base64 = await FileSystem.readAsStringAsync(selectedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const filePath = `${session.user.id}/${new Date().getTime()}.jpg`;
      const contentType = "image/jpeg";

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filePath, decode(base64), { contentType });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("posts").getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      const { error: insertError } = await supabase.from("posts").insert({
        user_id: session.user.id,
        image_url: imageUrl,
        caption: caption,
      });

      if (insertError) throw insertError;

      Alert.alert("Success", "Post shared successfully!");
      setSelectedImage(null);
      setCaption("");
      router.push("/(tabs)");
    } catch (error: any) {
      console.error("Error sharing post:", error);
      Alert.alert("Error", "Failed to share post. " + error.message);
    } finally {
      setIsSharing(false);
    }
  };

  if (!selectedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <View style={{ width: 28 }} />
        </View>

        <TouchableOpacity style={styles.emptyImageContainer} onPress={pickImage}>
          <Ionicons name="image-outline" size={48} color={COLORS.grey} />
          <Text style={styles.emptyImageText}>Tap to select an image</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.contentContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setSelectedImage(null);
              setCaption("");
            }}
            disabled={isSharing}
          >
            <Ionicons
              name="close-outline"
              size={28}
              color={isSharing ? COLORS.grey : COLORS.white}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity
            style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
            disabled={isSharing || !selectedImage}
            onPress={handleShare}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.shareText}>Share</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentOffset={{ x: 0, y: 100 }}
        >
          <View style={[styles.content, isSharing && styles.contentDisabled]}>
            {/* IMAGE SECTION */}
            <View style={styles.imageSection}>
              <Image
                source={selectedImage}
                style={styles.previewImage}
                contentFit="cover"
                transition={200}
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={pickImage}
                disabled={isSharing}
              >
                <Ionicons name="image-outline" size={20} color={COLORS.white} />
                <Text style={styles.changeImageText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* INPUT SECTION */}
            <View style={styles.inputSection}>
              <View style={styles.captionContainer}>
                <Image
                  source={{ uri: user?.imageUrl }}
                  style={styles.userAvatar}
                  contentFit="cover"
                  transition={200}
                />
                <TextInput
                  style={styles.captionInput}
                  placeholder="Write a caption..."
                  placeholderTextColor={COLORS.grey}
                  multiline
                  value={caption}
                  onChangeText={setCaption}
                  editable={!isSharing}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
