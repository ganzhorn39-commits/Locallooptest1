import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform, Linking } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/theme/theme";
import { useI18n } from "@/src/i18n";
import { useAuth } from "@/src/auth/AuthContext";
import { api } from "@/src/api/client";

export default function Verify() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { refresh } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const camRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [shot, setShot] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const capture = async () => {
    try {
      const pic = await camRef.current?.takePictureAsync({ base64: true, quality: 0.4 });
      if (pic?.base64) setShot(`data:image/jpg;base64,${pic.base64}`);
    } catch {}
  };

  const confirm = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ identity_verified: true, selfie: shot });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await refresh();
      setDone(true);
      setTimeout(() => router.back(), 1200);
    } catch {} finally { setSaving(false); }
  };

  const Header = (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <Pressable testID="verify-back" onPress={() => router.back()}><Ionicons name="chevron-back" size={26} color={colors.onSurface} /></Pressable>
      <Text style={[styles.headerTitle, { color: colors.onSurface }]}>{t("verify_profile")}</Text>
      <View style={{ width: 26 }} />
    </View>
  );

  // Permission gate
  if (!permission || !permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]} testID="verify-screen">
        {Header}
        <View style={styles.center}>
          <Ionicons name="shield-checkmark" size={64} color={colors.brand} />
          <Text style={[styles.intro, { color: colors.onSurface }]}>{t("verify_intro")}</Text>
          <Text style={[styles.sub, { color: colors.onSurfaceTertiary }]}>{t("camera_permission")}</Text>
          {permission && !permission.canAskAgain ? (
            <Pressable testID="verify-open-settings" onPress={() => Linking.openSettings()} style={[styles.primary, { backgroundColor: colors.brand }]}>
              <Text style={styles.primaryText}>{t("open_settings")}</Text>
            </Pressable>
          ) : (
            <Pressable testID="verify-grant" onPress={requestPermission} style={[styles.primary, { backgroundColor: colors.brand }]}>
              <Text style={styles.primaryText}>{t("grant_permission")}</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="verify-screen">
      {Header}
      <View style={styles.camWrap}>
        {shot ? (
          <Image source={{ uri: shot }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <CameraView ref={camRef} style={StyleSheet.absoluteFill} facing="front" />
        )}
        <View style={[styles.ring, { borderColor: done ? colors.success : colors.brand }]} pointerEvents="none" />
        {done && (
          <View style={styles.doneBadge}>
            <Ionicons name="checkmark-circle" size={72} color={colors.success} />
            <Text style={[styles.doneText, { color: "#FFFFFF" }]}>{t("verify_done")}</Text>
          </View>
        )}
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={[styles.intro, { color: colors.onSurface, textAlign: "center" }]}>{t("verify_intro")}</Text>
        {!shot ? (
          <Pressable testID="verify-capture" onPress={capture} style={[styles.primary, { backgroundColor: colors.brand }]}>
            <Ionicons name="camera" size={20} color={colors.onBrand} />
            <Text style={styles.primaryText}>{t("verify_cta")}</Text>
          </Pressable>
        ) : (
          <View style={{ gap: 10 }}>
            <Pressable testID="verify-confirm" onPress={confirm} disabled={saving || done} style={[styles.primary, { backgroundColor: colors.success }]}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>{done ? t("verify_done") : t("verify_cta")}</Text>}
            </Pressable>
            {!done && (
              <Pressable testID="verify-retake" onPress={() => setShot("")} style={[styles.secondary, { borderColor: colors.border }]}>
                <Text style={[styles.secondaryText, { color: colors.onSurface }]}>{t("verify_retake")}</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30, gap: 16 },
  intro: { fontSize: 16, fontWeight: "700" },
  sub: { fontSize: 13, textAlign: "center" },
  camWrap: { flex: 1, margin: 20, borderRadius: 24, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "#000" },
  ring: { position: "absolute", width: 220, height: 280, borderRadius: 140, borderWidth: 3, opacity: 0.7 },
  doneBadge: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.45)", gap: 10 },
  doneText: { fontSize: 18, fontWeight: "800" },
  controls: { paddingHorizontal: 20, gap: 14 },
  primary: { height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  primaryText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  secondary: { height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  secondaryText: { fontSize: 15, fontWeight: "700" },
});
