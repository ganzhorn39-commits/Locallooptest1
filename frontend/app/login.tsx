import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Animated } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth/AuthContext";
import { useTheme } from "@/src/theme/theme";

const T = {
  en: { slogan: "The city's pulse. Live on your map.", google: "Continue with Google", facebook: "Continue with Facebook", email: "Sign up with Email", business: "For Organizers: Business Login", demo: "Explore as demo", soon: "Coming soon — Google login works now 🎉" },
  de: { slogan: "Dein Stadtpuls. Live auf der Karte.", google: "Weiter mit Google", facebook: "Weiter mit Facebook", email: "Mit E-Mail registrieren", business: "Für Veranstalter: Business Login", demo: "Als Demo erkunden", soon: "Bald verfügbar — Google Login funktioniert jetzt 🎉" },
};

export default function Login() {
  const { user, login, devLogin, loggingIn } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "de">("en");
  const [note, setNote] = useState("");
  const allowDev = process.env.EXPO_PUBLIC_ALLOW_DEV_LOGIN === "1";
  const t = T[lang];

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => { if (user) router.replace("/(tabs)"); }, [user]);

  return (
    <View style={styles.container} testID="login-screen">
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1520450202524-87e18f4a1a19?crop=entropy&cs=srgb&fm=jpg&q=70&w=900" }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        blurRadius={8}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(2,4,14,0.82)" }]} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.6] }) }]}>
        <LinearGradient colors={["#4B2EDB", "transparent", "#0BD9D9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <View style={[styles.content, { paddingTop: insets.top + 44, paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.top}>
          <View style={styles.logoRow}>
            <Ionicons name="location" size={30} color="#FFFFFF" />
            <Text style={styles.wordmark}>LocalLoop</Text>
          </View>
          <Text style={styles.slogan}>{t.slogan}</Text>
        </View>

        <View style={styles.bottom}>
          {!!note && <Text style={styles.note} testID="login-note">{note}</Text>}

          <Pressable testID="google-login-button" onPress={login} disabled={loggingIn} style={[styles.btn, styles.googleBtn, { opacity: loggingIn ? 0.7 : 1 }]}>
            {loggingIn ? <ActivityIndicator color="#111" /> : (<>
              <View style={styles.gIcon}><Text style={styles.gIconText}>G</Text></View>
              <Text style={styles.googleText}>{t.google}</Text>
            </>)}
          </Pressable>

          <Pressable testID="facebook-login-button" onPress={() => setNote(t.soon)} style={[styles.btn, styles.fbBtn]}>
            <Ionicons name="logo-facebook" size={22} color="#FFFFFF" />
            <Text style={styles.fbText}>{t.facebook}</Text>
          </Pressable>

          <Pressable testID="email-login-button" onPress={() => setNote(t.soon)} style={[styles.btn, styles.emailBtn]}>
            <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
            <Text style={styles.emailText}>{t.email}</Text>
          </Pressable>

          {allowDev && (
            <Pressable testID="demo-login-button" onPress={devLogin} disabled={loggingIn} style={styles.demoBtn}>
              <Text style={styles.demoText}>{t.demo}</Text>
            </Pressable>
          )}

          <View style={styles.bottomBar}>
            <Pressable testID="language-toggle" onPress={() => setLang((l) => (l === "en" ? "de" : "en"))} hitSlop={10}>
              <Text style={styles.barLink}>{lang === "en" ? "DE / EN" : "EN / DE"}</Text>
            </Pressable>
            <Pressable testID="business-login" onPress={() => setNote(t.soon)} hitSlop={10}>
              <Text style={styles.barLink}>{t.business}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#02040e" },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between" },
  top: { marginTop: 60, gap: 14, alignItems: "center" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  wordmark: { color: "#FFFFFF", fontSize: 40, fontWeight: "900", letterSpacing: -1 },
  slogan: { color: "rgba(255,255,255,0.9)", fontSize: 18, textAlign: "center", fontWeight: "600" },
  bottom: { gap: 12 },
  note: { color: "#0BD9D9", fontSize: 13, textAlign: "center", fontWeight: "600" },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, height: 54, borderRadius: 16 },
  googleBtn: { backgroundColor: "#FFFFFF" },
  gIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#EA4335", alignItems: "center", justifyContent: "center" },
  gIconText: { color: "#FFFFFF", fontWeight: "900", fontSize: 14 },
  googleText: { color: "#111111", fontSize: 16, fontWeight: "700" },
  fbBtn: { backgroundColor: "#1877F2" },
  fbText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  emailBtn: { backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },
  emailText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  demoBtn: { alignItems: "center", paddingVertical: 6 },
  demoText: { color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
  bottomBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  barLink: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "700" },
});
