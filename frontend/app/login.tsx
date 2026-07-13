import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth/AuthContext";
import { useTheme } from "@/src/theme/theme";

export default function Login() {
  const { user, login, devLogin, loggingIn } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const allowDev = process.env.EXPO_PUBLIC_ALLOW_DEV_LOGIN === "1";

  useEffect(() => {
    if (user) router.replace("/");
  }, [user]);

  return (
    <View style={[styles.container, { backgroundColor: "#000000" }]} testID="login-screen">
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1630395822970-acd6a691d97e?crop=entropy&cs=srgb&fm=jpg&q=80&w=900" }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <LinearGradient colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.95)"]} style={StyleSheet.absoluteFill} />

      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.top}>
          <View style={[styles.logoDot, { backgroundColor: colors.brand }]}>
            <Ionicons name="location" size={30} color="#FFFFFF" />
          </View>
          <Text style={styles.wordmark}>LocalLoop</Text>
          <Text style={styles.tagline}>The city's pulse, on one map.{"\n"}Find what's happening around you — right now.</Text>
        </View>

        <View style={styles.bottom}>
          <Pressable
            testID="google-login-button"
            onPress={login}
            disabled={loggingIn}
            style={[styles.googleBtn, { opacity: loggingIn ? 0.7 : 1 }]}
          >
            {loggingIn ? (
              <ActivityIndicator color="#111111" />
            ) : (
              <>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1662947190722-5d272f82a526?crop=entropy&cs=srgb&fm=jpg&q=80&w=100" }}
                  style={styles.googleLogo}
                  contentFit="cover"
                />
                <Text style={styles.googleText}>Continue with Google</Text>
              </>
            )}
          </Pressable>
          <Text style={styles.terms}>By continuing you agree to discover great local events.</Text>
          {allowDev && (
            <Pressable testID="demo-login-button" onPress={devLogin} disabled={loggingIn} style={styles.demoBtn}>
              <Text style={styles.demoText}>Explore as demo</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between" },
  top: { marginTop: 60, gap: 16 },
  logoDot: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  wordmark: { color: "#FFFFFF", fontSize: 40, fontWeight: "900", letterSpacing: -1 },
  tagline: { color: "rgba(255,255,255,0.75)", fontSize: 16, lineHeight: 24 },
  bottom: { gap: 14 },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  googleLogo: { width: 22, height: 22, borderRadius: 4 },
  googleText: { color: "#111111", fontSize: 17, fontWeight: "700" },
  terms: { color: "rgba(255,255,255,0.5)", fontSize: 12, textAlign: "center" },
  demoBtn: { alignItems: "center", paddingVertical: 8 },
  demoText: { color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
});
