import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, Modal, Share, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/theme/theme";
import { api, EventItem } from "@/src/api/client";
import { useI18n } from "@/src/i18n";
import { categoryMeta } from "@/src/constants/categories";

export default function CrewDetail() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [crew, setCrew] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [custom, setCustom] = useState("");
  const [picker, setPicker] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setCrew(await api.getCrew(id));
    } catch {} finally { setLoading(false); }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openPicker = async () => {
    setPicker(true);
    try { setEvents(await api.listEvents()); } catch {}
  };

  const suggestEvent = async (ev: EventItem) => {
    setPicker(false);
    try { setCrew(await api.addSuggestion(id, { event_id: ev.id })); } catch {}
  };

  const suggestCustom = async () => {
    if (!custom.trim()) return;
    setBusy(true);
    try {
      setCrew(await api.addSuggestion(id, { custom_text: custom.trim() }));
      setCustom("");
    } catch {} finally { setBusy(false); }
  };

  const vote = async (sid: string) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    try { setCrew(await api.voteSuggestion(id, sid)); } catch {}
  };

  const share = async () => {
    if (!crew) return;
    try {
      await Share.share({ message: `Join my crew "${crew.name}" on LocalLoop! Use invite code: ${crew.invite_code}` });
    } catch {}
  };

  if (loading) {
    return <View style={[styles.container, { backgroundColor: colors.surface, justifyContent: "center" }]}><ActivityIndicator color={colors.brand} size="large" /></View>;
  }
  if (!crew) {
    return <View style={[styles.container, { backgroundColor: colors.surface, justifyContent: "center", alignItems: "center" }]}><Text style={{ color: colors.onSurface }}>{t("crew_not_found")}</Text></View>;
  }

  const inputStyle = [styles.input, { backgroundColor: colors.surfaceTertiary, color: colors.onSurface, borderColor: colors.border }];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="crew-detail-screen">
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <Pressable testID="crew-back" onPress={() => router.back()} style={{ width: 26 }}>
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]} numberOfLines={1}>{crew.name}</Text>
        <Pressable testID="share-crew" onPress={share} style={{ width: 26 }}>
          <Ionicons name="share-outline" size={22} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={[styles.inviteCard, { backgroundColor: colors.brandTertiary }]}>
          <View>
            <Text style={[styles.inviteLabel, { color: colors.onBrandTertiary }]}>{t("invite_code_label")}</Text>
            <Text style={[styles.inviteCode, { color: colors.onBrandTertiary }]} testID="crew-invite-code">{crew.invite_code}</Text>
          </View>
          <Pressable onPress={share} style={[styles.shareBtn, { backgroundColor: colors.brand }]} testID="share-crew-btn">
            <Ionicons name="share-social" size={16} color="#FFFFFF" />
            <Text style={styles.shareBtnText}>{t("invite")}</Text>
          </Pressable>
        </View>

        <Text style={[styles.section, { color: colors.onSurfaceTertiary }]}>{crew.members.length} {crew.members.length !== 1 ? t("member_other") : t("member_one")}</Text>
        <View style={styles.membersRow}>
          {crew.members.map((m: any) => (
            <View key={m.user_id} style={styles.member}>
              <View style={[styles.memberAvatar, { backgroundColor: colors.surfaceTertiary }]}>
                <Ionicons name="person" size={18} color={colors.onSurfaceTertiary} />
              </View>
              <Text style={[styles.memberName, { color: colors.onSurfaceSecondary }]} numberOfLines={1}>{m.name || t("guest")}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.section, { color: colors.onSurfaceTertiary }]}>{t("crew_vote_title")}</Text>
        {crew.suggestions.length === 0 && (
          <Text style={[styles.empty, { color: colors.onSurfaceTertiary }]}>{t("no_suggestions")}</Text>
        )}
        {crew.suggestions.map((s: any) => {
          return (
            <View key={s.id} style={[styles.sugRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sugTitle, { color: colors.onSurface }]}>{s.event_title || s.custom_text}</Text>
                <Text style={[styles.sugMeta, { color: colors.onSurfaceTertiary }]}>{s.event_id ? t("sug_map") : t("sug_idea")} · {s.vote_count} {s.vote_count !== 1 ? t("vote_other") : t("vote_one")}</Text>
              </View>
              <Pressable testID={`vote-${s.id}`} onPress={() => vote(s.id)} style={[styles.voteBtn, { backgroundColor: s.voted ? colors.brand : colors.surfaceTertiary, borderColor: s.voted ? colors.brand : colors.border }]}>
                <Ionicons name={s.voted ? "heart" : "heart-outline"} size={18} color={s.voted ? "#FFFFFF" : colors.onSurface} />
                <Text style={[styles.voteCount, { color: s.voted ? "#FFFFFF" : colors.onSurface }]}>{s.vote_count}</Text>
              </Pressable>
            </View>
          );
        })}

        <Pressable testID="suggest-event-button" onPress={openPicker} style={[styles.suggestEventBtn, { borderColor: colors.brand }]}>
          <Ionicons name="location" size={18} color={colors.brand} />
          <Text style={[styles.suggestEventText, { color: colors.brand }]}>{t("suggest_map_event")}</Text>
        </Pressable>
      </ScrollView>

      <KeyboardStickyView>
        <View style={[styles.composer, { paddingBottom: insets.bottom + 10, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput testID="input-custom-suggestion" value={custom} onChangeText={setCustom} placeholder={t("suggest_idea_ph")} placeholderTextColor={colors.onSurfaceTertiary} style={[inputStyle, { flex: 1 }]} />
          <Pressable testID="add-custom-suggestion" onPress={suggestCustom} disabled={busy} style={[styles.sendBtn, { backgroundColor: colors.brand }]}>
            <Ionicons name="arrow-up" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardStickyView>

      <Modal visible={picker} transparent animationType="slide" onRequestClose={() => setPicker(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceSecondary, paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.modalHead}>
              <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Pick an event</Text>
              <Pressable onPress={() => setPicker(false)} testID="close-picker"><Ionicons name="close" size={24} color={colors.onSurface} /></Pressable>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {events.map((ev) => {
                const meta = categoryMeta(ev.category);
                return (
                  <Pressable key={ev.id} testID={`pick-event-${ev.id}`} onPress={() => suggestEvent(ev)} style={[styles.pickRow, { borderBottomColor: colors.border }]}>
                    <Text style={{ fontSize: 20 }}>{meta.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pickTitle, { color: colors.onSurface }]}>{ev.title}</Text>
                      <Text style={[styles.pickMeta, { color: colors.onSurfaceTertiary }]}>{ev.address}</Text>
                    </View>
                    <Ionicons name="add-circle" size={22} color={colors.brand} />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", flex: 1, textAlign: "center", marginHorizontal: 8 },
  body: { padding: 16, gap: 12, paddingBottom: 100 },
  inviteCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 14 },
  inviteLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  inviteCode: { fontSize: 26, fontWeight: "900", letterSpacing: 3, marginTop: 2 },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, height: 40, borderRadius: 20 },
  shareBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  section: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 6 },
  membersRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  member: { alignItems: "center", width: 56, gap: 4 },
  memberAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  memberName: { fontSize: 11, textAlign: "center" },
  empty: { fontSize: 14, fontStyle: "italic" },
  sugRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  sugTitle: { fontSize: 15, fontWeight: "700" },
  sugMeta: { fontSize: 12, marginTop: 2 },
  voteBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, height: 40, borderRadius: 20, borderWidth: 1 },
  voteCount: { fontSize: 14, fontWeight: "800" },
  suggestEventBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 12, borderWidth: 1, borderStyle: "dashed" },
  suggestEventText: { fontSize: 15, fontWeight: "700" },
  composer: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1 },
  input: { height: 48, borderRadius: 24, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  modalHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  pickRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  pickTitle: { fontSize: 15, fontWeight: "600" },
  pickMeta: { fontSize: 12, marginTop: 2 },
});
