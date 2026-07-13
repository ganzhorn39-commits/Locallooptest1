import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/theme/theme";
import { categoryMeta } from "@/src/constants/categories";
import type { EventItem } from "@/src/api/client";

type Props = {
  event: EventItem;
  checkedIn: boolean;
  onCheckin: () => void;
  bottomInset: number;
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) +
      " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return iso;
  }
}

const openLink = async (url: string) => {
  if (!url) return;
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {}
};

export default function EventSheet({ event, checkedIn, onCheckin, bottomInset }: Props) {
  const { colors } = useTheme();
  const meta = categoryMeta(event.category);
  const catColor = colors[meta.colorKey];

  const instaUrl = event.instagram
    ? `https://instagram.com/${event.instagram.replace(/^@/, "")}`
    : "";

  return (
    <BottomSheetScrollView
      contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
      testID="event-sheet"
    >
      {/* Hero */}
      <View style={styles.hero}>
        {event.image_url ? (
          <Image source={{ uri: event.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: catColor }]} />
        )}
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.85)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <View style={[styles.catBadge, { backgroundColor: catColor }]}>
            <Ionicons name={meta.icon as any} size={13} color="#FFFFFF" />
            <Text style={styles.catBadgeText}>{meta.label}</Text>
          </View>
          <Text style={styles.heroTitle} testID="event-sheet-title">{event.title}</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.onSurfaceTertiary} />
            <Text style={[styles.metaText, { color: colors.onSurface }]}>{formatDate(event.start_time)}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={colors.onSurfaceTertiary} />
            <Text style={[styles.metaText, { color: colors.onSurface }]}>{event.address || "On the map"}</Text>
          </View>
        </View>

        {/* Live pulse */}
        <View style={[styles.liveCard, { backgroundColor: colors.brandTertiary }]}>
          <View style={styles.liveDot} />
          <Text style={[styles.liveCount, { color: colors.onBrandTertiary }]} testID="event-live-count">
            {event.live_count}
          </Text>
          <Text style={[styles.liveLabel, { color: colors.onBrandTertiary }]}>heading here now</Text>
        </View>

        {/* Check-in */}
        <Pressable
          testID="checkin-button"
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onCheckin();
          }}
          style={[
            styles.checkinBtn,
            { backgroundColor: checkedIn ? colors.success : colors.surfaceTertiary, borderColor: checkedIn ? colors.success : colors.border },
          ]}
        >
          <Ionicons name={checkedIn ? "checkmark-circle" : "add-circle-outline"} size={20} color={checkedIn ? "#FFFFFF" : colors.onSurface} />
          <Text style={[styles.checkinText, { color: checkedIn ? "#FFFFFF" : colors.onSurface }]}>
            {checkedIn ? "You're going!" : "I'm going / Check in"}
          </Text>
        </Pressable>

        {/* Description */}
        {!!event.description && (
          <Text style={[styles.desc, { color: colors.onSurfaceSecondary }]}>{event.description}</Text>
        )}

        {/* CTAs */}
        <View style={styles.ctaGroup}>
          {!!event.tickets_url && (
            <Pressable
              testID="cta-tickets"
              onPress={() => openLink(event.tickets_url)}
              style={[styles.ctaPrimary, { backgroundColor: colors.brand }]}
            >
              <Ionicons name="ticket-outline" size={18} color="#FFFFFF" />
              <Text style={styles.ctaPrimaryText}>Buy Tickets</Text>
            </Pressable>
          )}
          <View style={styles.ctaRow}>
            {!!instaUrl && (
              <Pressable
                testID="cta-instagram"
                onPress={() => openLink(instaUrl)}
                style={[styles.ctaSecondary, { backgroundColor: colors.surfaceTertiary, borderColor: colors.border }]}
              >
                <Ionicons name="logo-instagram" size={18} color={colors.onSurface} />
                <Text style={[styles.ctaSecondaryText, { color: colors.onSurface }]}>Instagram</Text>
              </Pressable>
            )}
            {!!event.website && (
              <Pressable
                testID="cta-website"
                onPress={() => openLink(event.website)}
                style={[styles.ctaSecondary, { backgroundColor: colors.surfaceTertiary, borderColor: colors.border }]}
              >
                <Ionicons name="globe-outline" size={18} color={colors.onSurface} />
                <Text style={[styles.ctaSecondaryText, { color: colors.onSurface }]}>Website</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 220, justifyContent: "flex-end" },
  heroContent: { padding: 16, gap: 8 },
  catBadge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  catBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  heroTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  body: { padding: 16, gap: 14 },
  metaRow: { flexDirection: "row" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { fontSize: 14, fontWeight: "500" },
  liveCard: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 12 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF3B30" },
  liveCount: { fontSize: 22, fontWeight: "800" },
  liveLabel: { fontSize: 14, fontWeight: "600" },
  checkinBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 12, borderWidth: 1 },
  checkinText: { fontSize: 15, fontWeight: "700" },
  desc: { fontSize: 15, lineHeight: 22 },
  ctaGroup: { gap: 10, marginTop: 4 },
  ctaPrimary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 12 },
  ctaPrimaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  ctaRow: { flexDirection: "row", gap: 10 },
  ctaSecondary: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 12, borderWidth: 1 },
  ctaSecondaryText: { fontSize: 15, fontWeight: "600" },
});
