import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, Platform } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/theme/theme";
import { useI18n } from "@/src/i18n";
import { useAuth } from "@/src/auth/AuthContext";
import { api } from "@/src/api/client";
import { getAge } from "@/src/utils/age";
import { pickImage } from "@/src/utils/pickImage";
import { storage } from "@/src/utils/storage";
import CategoryWheel from "@/src/components/CategoryWheel";
import DateWheel from "@/src/components/DateWheel";
import { CategoryKey } from "@/src/constants/categories";

type Role = "user" | "business";

const PENDING_ROLE_KEY = "pending_account_role";
const DEFAULT_BIRTH = `${new Date().getFullYear() - 20}-06-15`;

export default function Onboarding() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { user, refresh } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState(user?.name || "");
  const [birthdate, setBirthdate] = useState(DEFAULT_BIRTH);
  const [picture, setPicture] = useState(user?.picture || "");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [bizName, setBizName] = useState("");
  const [bizCat, setBizCat] = useState<CategoryKey>("food");
  const [bizAddress, setBizAddress] = useState("");
  const [bizWebsite, setBizWebsite] = useState("");
  const [bizInstagram, setBizInstagram] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const pending = await storage.getItem<string>(PENDING_ROLE_KEY, "");
      if (pending === "user" || pending === "business") {
        setRole(pending as Role);
        storage.removeItem(PENDING_ROLE_KEY);
      }
    })();
  }, []);

  const inputStyle = [styles.input, { backgroundColor: colors.surfaceTertiary, color: colors.onSurface, borderColor: colors.border }];

  const changePhoto = async () => {
    const res = await pickImage("library");
    if ("base64" in res) setPicture(res.base64);
  };

  const finish = async () => {
    setError("");
    if (role === "user") {
      if (!name.trim()) return setError(t("onb_name_error"));
      const age = getAge(birthdate);
      if (age === null || age < 16) return setError(t("onb_age_error"));
      setSaving(true);
      try {
        await api.updateProfile({ name: name.trim(), birthdate, bio: bio.trim(), instagram: instagram.trim(), picture, account_type: "user", onboarded: true });
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refresh();
        router.replace("/(tabs)");
      } catch { setError(t("create_failed")); } finally { setSaving(false); }
    } else {
      if (!bizName.trim()) return setError(t("onb_biz_error"));
      setSaving(true);
      try {
        await api.updateProfile({
          name: name.trim() || bizName.trim(), account_type: "business", onboarded: true,
          business_name: bizName.trim(), business_category: bizCat, business_address: bizAddress.trim(),
          business_website: bizWebsite.trim(), business_instagram: bizInstagram.trim(),
        });
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refresh();
        router.replace("/(tabs)");
      } catch { setError(t("create_failed")); } finally { setSaving(false); }
    }
  };

  // Step 1: role selection
  if (!role) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, paddingTop: insets.top + 40 }]} testID="onboarding-screen">
        <View style={styles.logoRow}>
          <Ionicons name="location" size={26} color={colors.brand} />
          <Text style={[styles.brand, { color: colors.onSurface }]}>LocalLoop</Text>
        </View>
        <Text style={[styles.h1, { color: colors.onSurface }]}>{t("onb_choose_role")}</Text>
        <View style={{ gap: 14, marginTop: 24, paddingHorizontal: 20 }}>
          <RoleCard testID="role-visitor" colors={colors} icon="compass" title={t("role_visitor")} desc={t("role_visitor_desc")} onPress={() => setRole("user")} />
          <RoleCard testID="role-business" colors={colors} icon="briefcase" title={t("role_business")} desc={t("role_business_desc")} onPress={() => setRole("business")} accent />
        </View>
      </View>
    );
  }

  // Step 2: profile form
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="onboarding-form">
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <Pressable testID="onb-back" onPress={() => setRole(null)} style={{ width: 26 }}>
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>{role === "user" ? t("onb_your_profile") : t("onb_business_profile")}</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled" bottomOffset={20}>
        {role === "user" ? (
          <>
            <View style={styles.avatarWrap}>
              <Pressable testID="onb-photo" onPress={changePhoto} style={[styles.avatar, { backgroundColor: colors.surfaceTertiary, borderColor: colors.brand }]}>
                {picture ? <Image source={{ uri: picture }} style={styles.avatarImg} contentFit="cover" /> : <Ionicons name="person" size={40} color={colors.onSurfaceTertiary} />}
                <View style={[styles.avatarEdit, { backgroundColor: colors.brand }]}><Ionicons name="camera" size={15} color={colors.onBrand} /></View>
              </Pressable>
            </View>
            <Field label={t("display_name")} colors={colors}>
              <TextInput testID="onb-name" value={name} onChangeText={setName} placeholder={t("display_name")} placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />
            </Field>
            <Field label={t("onb_birthdate")} colors={colors}>
              <DateWheel value={birthdate} onChange={setBirthdate} />
              {(() => { const a = getAge(birthdate); return a !== null ? <Text style={[styles.ageHint, { color: colors.onSurfaceTertiary }]}>{a} {t("years_old")}</Text> : null; })()}
            </Field>
            <Field label={t("bio")} colors={colors}>
              <TextInput testID="onb-bio" value={bio} onChangeText={setBio} placeholder={t("bio")} placeholderTextColor={colors.onSurfaceTertiary} multiline style={[inputStyle, { height: 80, textAlignVertical: "top", paddingTop: 12 }]} />
            </Field>
            <Field label={t("instagram")} colors={colors}>
              <TextInput testID="onb-instagram" value={instagram} onChangeText={setInstagram} placeholder="@yourhandle" autoCapitalize="none" placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />
            </Field>
          </>
        ) : (
          <>
            <Field label={t("biz_name")} colors={colors}>
              <TextInput testID="biz-name" value={bizName} onChangeText={setBizName} placeholder={t("biz_name")} placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />
            </Field>
            <Field label={t("biz_category")} colors={colors}>
              <CategoryWheel value={bizCat} onChange={setBizCat} />
            </Field>
            <Field label={t("biz_address")} colors={colors}>
              <TextInput testID="biz-address" value={bizAddress} onChangeText={setBizAddress} placeholder={t("biz_address")} placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />
            </Field>
            <Field label={t("biz_website")} colors={colors}>
              <TextInput testID="biz-website" value={bizWebsite} onChangeText={setBizWebsite} placeholder="https://..." autoCapitalize="none" placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />
            </Field>
            <Field label={t("biz_instagram")} colors={colors}>
              <TextInput testID="biz-instagram" value={bizInstagram} onChangeText={setBizInstagram} placeholder="@yourvenue" autoCapitalize="none" placeholderTextColor={colors.onSurfaceTertiary} style={inputStyle} />
            </Field>
          </>
        )}

        {!!error && <Text style={{ color: colors.error, fontWeight: "600" }} testID="onb-error">{error}</Text>}

        <Pressable testID="onb-finish" onPress={finish} disabled={saving} style={[styles.finish, { backgroundColor: colors.brand, opacity: saving ? 0.7 : 1 }]}>
          {saving ? <ActivityIndicator color={colors.onBrand} /> : <Text style={[styles.finishText, { color: colors.onBrand }]}>{t("onb_finish")}</Text>}
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

function RoleCard({ testID, colors, icon, title, desc, onPress, accent }: any) {
  return (
    <Pressable testID={testID} onPress={onPress} style={[styles.roleCard, { backgroundColor: colors.surfaceSecondary, borderColor: accent ? colors.accent : colors.border }]}>
      <View style={[styles.roleIcon, { backgroundColor: accent ? colors.accent : colors.brand }]}>
        <Ionicons name={icon} size={24} color={accent ? colors.onAccent : "#FFFFFF"} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.roleTitle, { color: colors.onSurface }]}>{title}</Text>
        <Text style={[styles.roleDesc, { color: colors.onSurfaceTertiary }]}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.onSurfaceTertiary} />
    </Pressable>
  );
}

function Field({ label, colors, children }: any) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.label, { color: colors.onSurfaceTertiary }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  brand: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  h1: { fontSize: 22, fontWeight: "800", textAlign: "center", marginTop: 20, paddingHorizontal: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  roleCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18, borderWidth: 1.5 },
  roleIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  roleTitle: { fontSize: 16, fontWeight: "800" },
  roleDesc: { fontSize: 13, marginTop: 2 },
  label: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  avatarWrap: { alignItems: "center", marginBottom: 4 },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  avatarImg: { width: "100%", height: "100%", borderRadius: 48 },
  avatarEdit: { position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  ageHint: { fontSize: 13, fontWeight: "700", textAlign: "center", marginTop: 8 },
  dateBtn: { flexDirection: "row", alignItems: "center", gap: 10, height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14 },
  dateText: { fontSize: 15, fontWeight: "600" },
  finish: { height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8 },
  finishText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
});
