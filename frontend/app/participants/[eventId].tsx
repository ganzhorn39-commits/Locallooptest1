import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/theme/theme";
import { useI18n } from "@/src/i18n";
import { api, EventItem } from "@/src/api/client";

export default function Participants() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ev, pt] = await Promise.all([api.getEvent(eventId), api.participants(eventId)]);
        setEvent(ev);
        setPeople(pt.participants || []);
      } catch {} finally { setLoading(false); }
    })();
  }, [eventId]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="participants-screen">
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <Pressable testID="participants-back" onPress={() => router.back()} style={{ width: 26 }}>
          <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>{t("attending")}</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Event header -> event details */}
      {event && (
        <Pressable testID="participants-event-header" onPress={() => router.push(`/event/${eventId}`)} style={[styles.eventHeader, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eventName, { color: colors.onSurface }]} numberOfLines={1}>{event.title}</Text>
            {!!event.venue_name && <Text style={[styles.eventVenue, { color: colors.onSurfaceTertiary }]} numberOfLines={1}>{event.venue_name}</Text>}
          </View>
          <Ionicons name="information-circle-outline" size={22} color={colors.brand} />
        </Pressable>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.brand} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 20 }}>
          {people.length === 0 && <Text style={[styles.empty, { color: colors.onSurfaceTertiary }]}>—</Text>}
          {people.map((p, i) => (
            <Pressable
              key={p.user_id || i}
              testID={`participant-${p.user_id}`}
              disabled={p.anonymous}
              onPress={() => !p.anonymous && router.push(`/user/${p.user_id}`)}
              style={[styles.row, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, opacity: p.anonymous ? 0.7 : 1 }]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.surfaceTertiary, borderColor: p.live ? colors.accent : colors.border }]}>
                {p.anonymous ? <Ionicons name="person" size={20} color={colors.onSurfaceTertiary} /> : p.picture ? <Image source={{ uri: p.picture }} style={styles.avatarImg} contentFit="cover" /> : <Text style={{ color: colors.onSurface, fontWeight: "800" }}>{(p.name || "?").charAt(0).toUpperCase()}</Text>}
              </View>
              <Text style={[styles.name, { color: colors.onSurface }]}>{p.anonymous ? t("anon_attendee") : p.name || "Guest"}</Text>
              {p.identity_verified && <Ionicons name="shield-checkmark" size={16} color="#4DA3FF" />}
              {!p.anonymous && <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceTertiary} style={{ marginLeft: "auto" }} />}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  eventHeader: { flexDirection: "row", alignItems: "center", gap: 12, margin: 16, marginBottom: 0, padding: 14, borderRadius: 14, borderWidth: 1 },
  eventName: { fontSize: 16, fontWeight: "800" },
  eventVenue: { fontSize: 13, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%" },
  name: { fontSize: 15, fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 30 },
});
