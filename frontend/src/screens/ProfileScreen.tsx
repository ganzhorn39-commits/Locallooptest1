import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, Platform } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/theme/theme";
import { useAuth } from "@/src/auth/AuthContext";
import { useI18n } from "@/src/i18n";
import { api } from "@/src/api/client";
import { getAge } from "@/src/utils/age";
import { pickImage } from "@/src/utils/pickImage";

export default function ProfileScreen({ showBack }: { showBack?: boolean }) {
  const { colors } = useTheme();
  const { user, refresh } = useAuth();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState((user as any)?.bio || "");
  const [instagram, setInstagram] = useState((user as any)?.instagram || "");
  const [picture, setPicture] = useState(user?.picture || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const inputStyle = [styles.input, { backgroundColor: colors.surfaceTertiary, color: colors.onSurface, borderColor: colors.border }];

  const changePhoto = async () => {
    const res = await pickImage("library");
    if ("base64" in res) setPicture(res.base64);
  };

  const save = async () => {
    setSaving(true); setSaved(false);
    try {
      await api.updateProfile({ name, bio, instagram, picture });
      await refresh();
      setSaved(true);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {} finally { setSaving(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="profile-screen">
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        {showBack ? (
          <Pressable testID="profile-back" onPress={() => router.back()} style={{ width: 26 }}><Ionicons name="chevron-back" size={26} color={colors.onSurface} /></Pressable>
        ) : <View style={{ width: 26 }} />}
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>{t("my_profile")}</Text>
        <Pressable testID="open-settings" onPress={() => router.push("/settings")} style={{ width: 26 }}>
          <Ionicons name="settings-outline" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 90 }]} bottomOffset={20} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarWrap}>
          <Pressable testID="change-photo" onPress={changePhoto} style={[styles.avatar, { backgroundColor: colors.surfaceTertiary, borderColor: colors.brand }]}>
            {picture ? <Image source={{ uri: picture }} style={styles.avatarImg} contentFit="cover" /> : <Ionicons name="person" size={44} color={colors.onSurfaceTertiary} />}
            <View style={[styles.avatarEdit, { backgroundColor: colors.brand }]}><Ionicons name="camera" size={16} color="#FFFFFF" /></View>
          </Pressable>
          <Text style={[styles.email, { color: colors.onSurfaceTertiary }]}>{user?.email}</Text>
          {(() => {
            const age = getAge((user as any)?.birthdate);
            const isBiz = (user as any)?.account_type === "business";
            const verified = (user as any)?.verified;
            const idVerified = (user as any)?.identity_verified;
            const displayName = isBiz ? ((user as any)?.business_name || user?.name) : user?.name;
            return (
              <View style={styles.identityRow}>
                <Text style={[styles.identityName, { color: colors.onSurface }]}>
                  {displayName}{!isBiz && age !== null ? `, ${age}` : ""}
                </Text>
                {isBiz && verified && (
                  <View testID="verified-badge" style={styles.verifiedWrap}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.brand} />
                    <Text style={[styles.verifiedText, { color: colors.brand }]}>{t("verified")}</Text>
                  </View>
                )}
                {idVerified && (
                  <View testID="identity-badge" style={styles.verifiedWrap}>
                    <Ionicons name="shield-checkmark" size={16} color="#4DA3FF" />
                    <Text style={[styles.verifiedText, { color: "#4DA3FF" }]}>{t("verify_identity")}</Text>
                  </View>
                )}
              </View>
            );
          })()}
        </View>

        <Text style={[styles.label, { color: colors.onSurfaceTertiary }]}>{t("display_name")}</Text>
        <TextInput testID="input-name" value={name} onChangeText={setName} placeholder={t("display_name")} placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />

        <Text style={[styles.label, { color: colors.onSurfaceTertiary }]}>{t("bio")}</Text>
        <TextInput testID="input-bio" value={bio} onChangeText={setBio} placeholder={t("bio")} placeholderTextColor={colors.onSurfaceTertiary} multiline style={[inputStyle, { height: 90, textAlignVertical: "top", paddingTop: 12 }]} />

        <Text style={[styles.label, { color: colors.onSurfaceTertiary }]}>{t("instagram")}</Text>
        <TextInput testID="input-instagram" value={instagram} onChangeText={setInstagram} placeholder="@yourhandle" autoCapitalize="none" placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />

        <Pressable testID="save-profile" onPress={save} disabled={saving} style={[styles.save, { backgroundColor: colors.brand, opacity: saving ? 0.7 : 1 }]}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>{saved ? t("saved") : t("save_profile")}</Text>}
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  body: { padding: 16, gap: 10 },
  avatarWrap: { alignItems: "center", gap: 8, marginBottom: 8 },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  avatarImg: { width: "100%", height: "100%", borderRadius: 55 },
  avatarEdit: { position: "absolute", bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFFFFF" },
  email: { fontSize: 14 },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  identityName: { fontSize: 20, fontWeight: "800" },
  verifiedWrap: { flexDirection: "row", alignItems: "center", gap: 3 },
  verifiedText: { fontSize: 12, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 6 },
  input: { minHeight: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  save: { height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 16 },
  saveText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  logout: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  logoutText: { fontSize: 15, fontWeight: "700" },
});
