import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/theme";
import { categoryMeta } from "@/src/constants/categories";
import { countdown } from "@/src/utils/filters";
import type { EventItem } from "@/src/api/client";

export default function EventCard({
  event,
  saved,
  onPress,
  onToggleSave,
}: {
  event: EventItem;
  saved: boolean;
  onPress: () => void;
  onToggleSave: () => void;
}) {
  const { colors } = useTheme();
  const meta = categoryMeta(event.category);
  const catColor = colors[meta.colorKey];

  return (
    <Pressable testID={`event-card-${event.id}`} onPress={onPress} style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
      <View style={styles.imageWrap}>
        {event.image_url ? (
          <Image source={{ uri: event.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: catColor }]} />
        )}
        <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]} style={StyleSheet.absoluteFill} />
        <View style={[styles.catBadge, { backgroundColor: catColor }]}>
          <Text style={{ fontSize: 12 }}>{event.emoji || meta.emoji}</Text>
          <Text style={styles.catBadgeText}>{meta.label}</Text>
        </View>
        <Pressable testID={`save-card-${event.id}`} onPress={onToggleSave} hitSlop={10} style={styles.saveBtn}>
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={20} color="#FFFFFF" />
        </Pressable>
        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{event.live_count}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>{event.title}</Text>
        {!!event.venue_name && (
          <Text style={[styles.venue, { color: colors.onSurfaceTertiary }]} numberOfLines={1}>
            {event.verified ? "✓ " : ""}{event.venue_name}
          </Text>
        )}
        <View style={styles.metaRow}>
          <Ionicons name={event.is_recurring ? "repeat" : "time-outline"} size={14} color={colors.brand} />
          <Text style={[styles.countdown, { color: colors.brand }]} numberOfLines={1}>
            {event.is_recurring && event.recurrence_label ? event.recurrence_label : countdown(event.next_occurrence || event.start_time)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 14 },
  imageWrap: { height: 150 },
  catBadge: { position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  catBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  saveBtn: { position: "absolute", top: 10, right: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  liveTag: { position: "absolute", bottom: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#FF3B30" },
  liveText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  info: { padding: 14, gap: 6 },
  title: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  venue: { fontSize: 13, fontWeight: "600" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  countdown: { fontSize: 13, fontWeight: "700" },
  dot: { fontSize: 13, marginHorizontal: 2 },
  addr: { fontSize: 13, flex: 1 },
});
