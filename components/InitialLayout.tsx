import { useAuth } from "@/providers/SupabaseProvider";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function InitialLayout() {
  const { session, loading } = useAuth();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthScreen = segments[0] === "(auth)";

    if (!session && !inAuthScreen) router.replace("/(auth)/login");
    else if (session && inAuthScreen) router.replace("/(tabs)");
  }, [loading, session, segments]);

  if (loading) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
