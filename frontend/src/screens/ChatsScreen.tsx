import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, Platform } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/theme/theme";
import { api, EventItem } from "@/src/api/client";
import { categoryMeta } from "@/src/constants/categories";

export default function ChatsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [attending, setAttending] = useState<EventItem[]>([]);
  const [crews, setCrews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [att, cr] = await Promise.all([api.myAttending(), api.myCrews()]);
      setAttending(att);
      setCrews(cr);
    } catch {} finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const create = async () => {
    if (!newName.trim()) return;
    setBusy(true); setError("");
    try {
      const crew = await api.createCrew(newName.trim());
      setNewName("");
      if (Platform.OS !== "web") Haptics.selectionAsync();
      router.push(`/crew/${crew.id}`);
    } catch { setError("Could not create crew"); } finally { setBusy(false); }
  };

  const join = async () => {
    if (!joinCode.trim()) return;
    setBusy(true); setError("");
    try {
      const crew = await api.joinCrew(joinCode.trim());
      setJoinCode("");
      router.push(`/crew/${crew.id}`);
    } catch { setError("Invalid invite code"); } finally { setBusy(false); }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.surfaceTertiary, color: colors.onSurface, borderColor: colors.border }];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="chats-screen">
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Chats</Text>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90, gap: 12 }} keyboardShouldPersistTaps="handled" bottomOffset={20}>
        <Text style={[styles.section, { color: colors.onSurfaceTertiary }]}>Event Group Chats</Text>
        {loading ? (
          <ActivityIndicator color={colors.brand} style={{ marginTop: 10 }} />
        ) : attending.length === 0 ? (
          <Text style={[styles.empty, { color: colors.onSurfaceTertiary }]}>Check into an event to unlock its group chat.</Text>
        ) : (
          attending.map((e) => {
            const meta = categoryMeta(e.category);
            return (
              <Pressable key={e.id} testID={`chat-item-${e.id}`} onPress={() => router.push(`/chat/${e.id}`)} style={[styles.row, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                <View style={[styles.avatar, { backgroundColor: colors[meta.colorKey] }]}>
                  <Text style={{ fontSize: 20 }}>{meta.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.onSurface }]} numberOfLines={1}>{e.title}</Text>
                  <Text style={[styles.rowSub, { color: colors.onSurfaceTertiary }]}>{e.live_count} attending · tap to chat</Text>
                </View>
                <Ionicons name="chatbubbles" size={20} color={colors.brand} />
              </Pressable>
            );
          })
        )}

        <Text style={[styles.section, { color: colors.onSurfaceTertiary, marginTop: 8 }]}>Your Crews</Text>
        <View style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <View style={styles.inline}>
            <TextInput testID="input-crew-name" value={newName} onChangeText={setNewName} placeholder="New crew name" placeholderTextColor={colors.onSurfaceTertiary} style={[inputStyle, { flex: 1 }]} />
            <Pressable testID="create-crew" onPress={create} disabled={busy} style={[styles.smallBtn, { backgroundColor: colors.brand }]}><Ionicons name="add" size={22} color="#FFFFFF" /></Pressable>
          </View>
          <View style={styles.inline}>
            <TextInput testID="input-join-code" value={joinCode} onChangeText={setJoinCode} placeholder="Join with INVITE CODE" autoCapitalize="characters" placeholderTextColor={colors.onSurfaceTertiary} style={[inputStyle, { flex: 1 }]} />
            <Pressable testID="join-crew" onPress={join} disabled={busy} style={[styles.smallBtn, { backgroundColor: colors.surfaceInverse }]}><Ionicons name="enter" size={20} color={colors.onSurfaceInverse} /></Pressable>
          </View>
          {!!error && <Text style={{ color: colors.error, fontWeight: "600" }} testID="crews-error">{error}</Text>}
        </View>

        {crews.map((c) => (
          <Pressable key={c.id} testID={`crew-${c.id}`} onPress={() => router.push(`/crew/${c.id}`)} style={[styles.row, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.brandTertiary }]}>
              <Ionicons name="people" size={20} color={colors.onBrandTertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.onSurface }]}>{c.name}</Text>
              <Text style={[styles.rowSub, { color: colors.onSurfaceTertiary }]}>{c.member_count} member{c.member_count !== 1 ? "s" : ""} · code {c.invite_code}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceTertiary} />
          </Pressable>
        ))}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  section: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  empty: { fontSize: 14, fontStyle: "italic" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 16, fontWeight: "700" },
  rowSub: { fontSize: 13, marginTop: 2 },
  card: { padding: 12, borderRadius: 14, borderWidth: 1, gap: 10 },
  inline: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  smallBtn: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
