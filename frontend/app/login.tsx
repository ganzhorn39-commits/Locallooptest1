import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ImageBackground, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth/AuthContext";
import { useI18n } from "@/src/i18n";

// BRANDING EXCEPTION: name + slogan are never translated.
const BRAND = "LocalLoop";
const SLOGAN = "Dein Stadtpuls. Live auf der Karte.";
const BG_URI =
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80";

export default function Login() {
  const { user, login, devLogin, loggingIn } = useAuth();
  const { lang, setLang, t } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [note, setNote] = React.useState("");
  const allowDev = process.env.EXPO_PUBLIC_ALLOW_DEV_LOGIN === "1";

  useEffect(() => { if (user) router.replace("/(tabs)"); }, [user]);

  return (
    <View style={styles.container} testID="login-screen">
      <ImageBackground source={{ uri: BG_URI }} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={["rgba(4,6,20,0.30)", "rgba(4,6,20,0.55)", "rgba(4,6,20,0.92)"]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <View style={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.brandHead}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="location" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.wordmark}>{BRAND}</Text>
          </View>
        </View>

        {/* Floating glassmorphic card */}
        <BlurView intensity={Platform.OS === "android" ? 90 : 55} tint="dark" style={styles.glass}>
          <View style={styles.glassInner}>
            <Text style={styles.slogan}>{SLOGAN}</Text>

            {!!note && <Text style={styles.note} testID="login-note">{note}</Text>}

            <Pressable testID="google-login-button" onPress={login} disabled={loggingIn} style={[styles.btn, styles.googleBtn, { opacity: loggingIn ? 0.7 : 1 }]}>
              {loggingIn ? <ActivityIndicator color="#111" /> : (<>
                <View style={styles.gIcon}><Text style={styles.gIconText}>G</Text></View>
                <Text style={styles.googleText}>{t("google")}</Text>
              </>)}
            </Pressable>

            <Pressable testID="facebook-login-button" onPress={() => setNote(t("soon"))} style={[styles.btn, styles.fbBtn]}>
              <Ionicons name="logo-facebook" size={22} color="#FFFFFF" />
              <Text style={styles.fbText}>{t("facebook")}</Text>
            </Pressable>

            <Pressable testID="email-login-button" onPress={() => setNote(t("soon"))} style={[styles.btn, styles.emailBtn]}>
              <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
              <Text style={styles.emailText}>Email OTP</Text>
            </Pressable>

            {allowDev && (
              <Pressable testID="demo-login-button" onPress={devLogin} disabled={loggingIn} style={styles.demoBtn}>
                <Text style={styles.demoText}>{t("demo")}</Text>
              </Pressable>
            )}

            <View style={styles.bottomBar}>
              <Pressable testID="language-toggle" onPress={() => setLang(lang === "en" ? "de" : "en")} hitSlop={10}>
                <Text style={styles.barLink}>{lang === "en" ? "DE / EN" : "EN / DE"}</Text>
              </Pressable>
              <Pressable testID="business-login" onPress={() => setNote(t("soon"))} hitSlop={10}>
                <Text style={styles.barLink}>{t("business")}</Text>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#02040e" },
  content: { flex: 1, paddingHorizontal: 20, justifyContent: "space-between" },
  brandHead: { alignItems: "center", marginTop: 24 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(31,176,208,0.92)", alignItems: "center", justifyContent: "center" },
  wordmark: { color: "#FFFFFF", fontSize: 40, fontWeight: "900", letterSpacing: -1 },
  glass: {
    borderRadius: 28, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  glassInner: { padding: 22, gap: 12, backgroundColor: "rgba(12,14,30,0.35)" },
  slogan: { color: "#FFFFFF", fontSize: 20, textAlign: "center", fontWeight: "700", marginBottom: 6 },
  note: { color: "#0BD9D9", fontSize: 13, textAlign: "center", fontWeight: "600" },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, height: 54, borderRadius: 16 },
  googleBtn: { backgroundColor: "#FFFFFF" },
  gIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#EA4335", alignItems: "center", justifyContent: "center" },
  gIconText: { color: "#FFFFFF", fontWeight: "900", fontSize: 14 },
  googleText: { color: "#111111", fontSize: 16, fontWeight: "700" },
  fbBtn: { backgroundColor: "#1877F2" },
  fbText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  emailBtn: { backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" },
  emailText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  demoBtn: { alignItems: "center", paddingVertical: 4 },
  demoText: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
  bottomBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  barLink: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "700" },
});
