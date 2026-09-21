import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useTheme } from "@/src/theme/theme";
import { useI18n } from "@/src/i18n";
import { useAuth } from "@/src/auth/AuthContext";

export default function GuestGate({ icon = "lock-closed", message }: { icon?: string; message: string }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { promptLogin } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, paddingTop: insets.top }]} testID="guest-gate">
      <View style={styles.inner}>
        <View style={[styles.iconWrap, { backgroundColor: colors.brandTertiary }]}>
          <Ionicons name={icon as any} size={36} color={colors.brand} />
        </View>
        <Text style={[styles.title, { color: colors.onSurface }]}>{message}</Text>
        <Text style={[styles.sub, { color: colors.onSurfaceTertiary }]}>{t("wall_body")}</Text>
        <Pressable testID="guest-gate-login" onPress={promptLogin} style={[styles.btn, { backgroundColor: colors.brand }]}>
          <Ionicons name="log-in-outline" size={20} color={colors.onBrand} />
          <Text style={[styles.btnText, { color: colors.onBrand }]}>{t("wall_login")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  inner: { alignItems: "center", gap: 14, maxWidth: 340 },
  iconWrap: { width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  sub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 16, paddingHorizontal: 32, marginTop: 8 },
  btnText: { fontSize: 16, fontWeight: "800" },
});
