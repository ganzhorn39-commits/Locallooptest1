import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/theme/theme";
import { api } from "@/src/api/client";

export default function Crews() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [crews, setCrews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setCrews(await api.myCrews());
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
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="crews-screen">
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <Pressable testID="crews-back" onPress={() => router.back()} style={{ width: 26 }}>
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Crews</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={styles.body} bottomOffset={20} keyboardShouldPersistTaps="handled">
        <Text style={[styles.hint, { color: colors.onSurfaceTertiary }]}>Form a private group, suggest events and vote on where to go tonight.</Text>

        <View style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Start a Crew</Text>
          <View style={styles.row}>
            <TextInput testID="input-crew-name" value={newName} onChangeText={setNewName} placeholder="Crew name" placeholderTextColor={colors.onSurfaceTertiary} style={[inputStyle, { flex: 1 }]} />
            <Pressable testID="create-crew" onPress={create} disabled={busy} style={[styles.smallBtn, { backgroundColor: colors.brand }]}>
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>Join with Code</Text>
          <View style={styles.row}>
            <TextInput testID="input-join-code" value={joinCode} onChangeText={setJoinCode} placeholder="INVITE CODE" autoCapitalize="characters" placeholderTextColor={colors.onSurfaceTertiary} style={[inputStyle, { flex: 1 }]} />
            <Pressable testID="join-crew" onPress={join} disabled={busy} style={[styles.smallBtn, { backgroundColor: colors.surfaceInverse }]}>
              <Ionicons name="enter" size={20} color={colors.onSurfaceInverse} />
            </Pressable>
          </View>
        </View>

        {!!error && <Text style={{ color: colors.error, fontWeight: "600" }} testID="crews-error">{error}</Text>}

        <Text style={[styles.section, { color: colors.onSurfaceTertiary }]}>Your Crews</Text>
        {loading ? (
          <ActivityIndicator color={colors.brand} style={{ marginTop: 20 }} />
        ) : crews.length === 0 ? (
          <Text style={[styles.empty, { color: colors.onSurfaceTertiary }]}>No crews yet. Start one above! 🎉</Text>
        ) : (
          crews.map((c) => (
            <Pressable key={c.id} testID={`crew-${c.id}`} onPress={() => router.push(`/crew/${c.id}`)} style={[styles.crewRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <View style={[styles.crewIcon, { backgroundColor: colors.brandTertiary }]}>
                <Ionicons name="people" size={20} color={colors.onBrandTertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.crewName, { color: colors.onSurface }]}>{c.name}</Text>
                <Text style={[styles.crewMeta, { color: colors.onSurfaceTertiary }]}>{c.member_count} member{c.member_count !== 1 ? "s" : ""} · code {c.invite_code}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceTertiary} />
            </Pressable>
          ))
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  body: { padding: 16, gap: 14, paddingBottom: 60 },
  hint: { fontSize: 14, lineHeight: 20 },
  card: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15 },
  smallBtn: { width: 50, height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  section: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 6 },
  empty: { fontSize: 14, fontStyle: "italic", marginTop: 8 },
  crewRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  crewIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  crewName: { fontSize: 16, fontWeight: "700" },
  crewMeta: { fontSize: 13, marginTop: 2 },
});
