import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, Modal } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/theme/theme";
import { useI18n } from "@/src/i18n";
import { categoryMeta } from "@/src/constants/categories";
import { api, EventItem } from "@/src/api/client";
import { pickImage } from "@/src/utils/pickImage";
import { countdown } from "@/src/utils/filters";

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
  try { await WebBrowser.openBrowserAsync(url); } catch {}
};

export default function EventSheet({ event, checkedIn, onCheckin, bottomInset }: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const meta = categoryMeta(event.category);
  const catColor = colors[meta.colorKey];

  const [stories, setStories] = useState<any[]>([]);
  const [participants, setParticipants] = useState(0);
  const [attendeeList, setAttendeeList] = useState<any[]>([]);
  const [viewing, setViewing] = useState<any | null>(null);
  const [posting, setPosting] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSocial = useCallback(async () => {
    try {
      const [st, pt] = await Promise.all([api.getStories(event.id), api.participants(event.id)]);
      setStories(st);
      setParticipants(pt.count);
      setAttendeeList(pt.participants || []);
    } catch {}
    try {
      setSaved((await api.saveStatus(event.id)).saved);
    } catch {}
  }, [event.id]);

  const toggleSave = async () => {
    setSaved((s) => !s);
    if (Platform.OS !== "web") Haptics.selectionAsync();
    try { await api.toggleSave(event.id); } catch { loadSocial(); }
  };

  useEffect(() => { loadSocial(); }, [loadSocial, checkedIn]);

  const instaUrl = event.instagram ? `https://instagram.com/${event.instagram.replace(/^@/, "")}` : "";

  const addStory = async (source: "camera" | "library") => {
    const res = await pickImage(source);
    if ("base64" in res) {
      setPosting(true);
      try {
        await api.addStory(event.id, res.base64);
        await loadSocial();
      } catch {} finally { setPosting(false); }
    }
  };

  return (
    <BottomSheetScrollView contentContainerStyle={{ paddingBottom: bottomInset + 24 }} testID="event-sheet">
      <View style={styles.hero}>
        {event.image_url ? (
          <Image source={{ uri: event.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: catColor }]} />
        )}
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.85)"]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroContent}>
          <View style={styles.badgeRow}>
            <View style={[styles.catBadge, { backgroundColor: catColor }]}>
              <Text style={{ fontSize: 13 }}>{event.emoji || meta.emoji}</Text>
              <Text style={styles.catBadgeText}>{meta.label}</Text>
            </View>
            {event.is_recurring && !!event.recurrence_label && (
              <View style={styles.recurringBadge} testID="recurring-badge">
                <Ionicons name="repeat" size={12} color="#FFFFFF" />
                <Text style={styles.recurringText}>{event.recurrence_label}</Text>
              </View>
            )}
          </View>
          {!!event.venue_name && (
            <Text style={styles.venueName}>{event.verified ? "✓ " : ""}{event.venue_name}</Text>
          )}
          <Text style={styles.heroTitle} testID="event-sheet-title">{event.title}</Text>
        </View>
        <Pressable testID="save-event-button" onPress={toggleSave} style={styles.saveHero}>
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name={event.is_recurring ? "repeat" : "calendar-outline"} size={16} color={colors.onSurfaceTertiary} />
            <Text style={[styles.metaText, { color: colors.onSurface }]}>
              {event.is_recurring && event.recurrence_label ? event.recurrence_label : formatDate(event.next_occurrence || event.start_time)}
            </Text>
          </View>
          <View style={[styles.countdownChip, { backgroundColor: colors.brandTertiary, marginLeft: "auto" }]}>
            <Ionicons name="time" size={13} color={colors.onBrandTertiary} />
            <Text style={[styles.countdownText, { color: colors.onBrandTertiary }]} testID="event-countdown">{countdown(event.next_occurrence || event.start_time)}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={colors.onSurfaceTertiary} />
            <Text style={[styles.metaText, { color: colors.onSurface }]}>{event.address || "On the map"}</Text>
          </View>
        </View>

        <View style={[styles.liveCard, { backgroundColor: colors.brandTertiary }]}>
          <View style={styles.liveDot} />
          <Text style={[styles.liveCount, { color: colors.onBrandTertiary }]} testID="event-live-count">{event.live_count}</Text>
          <Text style={[styles.liveLabel, { color: colors.onBrandTertiary }]}>{t("heading_now")}</Text>
          {participants > 0 && (
            <Text style={[styles.liveLabel, { color: colors.onBrandTertiary, marginLeft: "auto" }]}>{participants} {t("checked_in")}</Text>
          )}
        </View>

        <Pressable
          testID="checkin-button"
          onPress={() => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onCheckin(); }}
          style={[styles.checkinBtn, { backgroundColor: checkedIn ? colors.success : colors.surfaceTertiary, borderColor: checkedIn ? colors.success : colors.border }]}
        >
          <Ionicons name={checkedIn ? "checkmark-circle" : "add-circle-outline"} size={20} color={checkedIn ? "#FFFFFF" : colors.onSurface} />
          <Text style={[styles.checkinText, { color: checkedIn ? "#FFFFFF" : colors.onSurface }]}>
            {checkedIn ? t("going") : t("checkin_cta")}
          </Text>
        </Pressable>

        {/* Attendees */}
        {attendeeList.length > 0 && (
          <View testID="attendees-section">
            <Text style={[styles.sectionLabel, { color: colors.onSurfaceTertiary }]}>{t("attendees")} · {participants}</Text>
            <View style={styles.attendeeRow}>
              {attendeeList.slice(0, 8).map((a) => (
                <View key={a.user_id} style={styles.attendee}>
                  <View style={[styles.attendeeAvatar, { backgroundColor: colors.surfaceTertiary, borderColor: catColor }]}>
                    {a.picture ? (
                      <Image source={{ uri: a.picture }} style={styles.attendeeImg} contentFit="cover" />
                    ) : (
                      <Text style={[styles.attendeeInitial, { color: colors.onSurface }]}>{(a.name || "?").charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                  <Text style={[styles.attendeeName, { color: colors.onSurfaceSecondary }]} numberOfLines={1}>{(a.name || "Guest").split(" ")[0]}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stories / Moments */}
        <View style={styles.storiesHeader}>
          <Text style={[styles.sectionLabel, { color: colors.onSurfaceTertiary }]}>{t("moments")}</Text>
        </View>
        <View style={styles.storiesRow}>
          {checkedIn && (
            <Pressable
              testID="add-story-button"
              onPress={() => addStory(Platform.OS === "web" ? "library" : "camera")}
              style={[styles.storyAdd, { borderColor: catColor, backgroundColor: colors.surfaceTertiary, opacity: posting ? 0.6 : 1 }]}
            >
              <Ionicons name="camera" size={20} color={catColor} />
            </Pressable>
          )}
          {stories.map((s) => (
            <Pressable key={s.id} testID={`story-${s.id}`} onPress={() => setViewing(s)} style={[styles.storyThumb, { borderColor: catColor }]}>
              <Image source={{ uri: s.image }} style={styles.storyImg} contentFit="cover" />
            </Pressable>
          ))}
          {stories.length === 0 && !checkedIn && (
            <Text style={[styles.emptyStories, { color: colors.onSurfaceTertiary }]}>{t("checkin_to_share")}</Text>
          )}
          {stories.length === 0 && checkedIn && (
            <Text style={[styles.emptyStories, { color: colors.onSurfaceTertiary }]}>{t("first_moment")}</Text>
          )}
        </View>

        {/* Group chat */}
        <Pressable
          testID="open-chat-button"
          onPress={() => {
            if (!checkedIn) return;
            router.push(`/chat/${event.id}`);
          }}
          style={[styles.chatBtn, { backgroundColor: checkedIn ? colors.surfaceTertiary : colors.surfaceTertiary, borderColor: colors.border, opacity: checkedIn ? 1 : 0.5 }]}
        >
          <Ionicons name="chatbubbles" size={20} color={catColor} />
          <Text style={[styles.chatText, { color: colors.onSurface }]}>
            {checkedIn ? t("open_chat") : t("unlock_chat")}
          </Text>
          {checkedIn && <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceTertiary} style={{ marginLeft: "auto" }} />}
        </Pressable>

        {!!event.description && <Text style={[styles.desc, { color: colors.onSurfaceSecondary }]}>{event.description}</Text>}

        <View style={styles.ctaGroup}>
          {!!event.tickets_url && (
            <Pressable testID="cta-tickets" onPress={() => openLink(event.tickets_url)} style={[styles.ctaPrimary, { backgroundColor: colors.brand }]}>
              <Ionicons name="ticket-outline" size={18} color="#FFFFFF" />
              <Text style={styles.ctaPrimaryText}>{t("buy_tickets")}</Text>
            </Pressable>
          )}
          <View style={styles.ctaRow}>
            {!!instaUrl && (
              <Pressable testID="cta-instagram" onPress={() => openLink(instaUrl)} style={[styles.ctaSecondary, { backgroundColor: colors.surfaceTertiary, borderColor: colors.border }]}>
                <Ionicons name="logo-instagram" size={18} color={colors.onSurface} />
                <Text style={[styles.ctaSecondaryText, { color: colors.onSurface }]}>Instagram</Text>
              </Pressable>
            )}
            {!!event.website && (
              <Pressable testID="cta-website" onPress={() => openLink(event.website)} style={[styles.ctaSecondary, { backgroundColor: colors.surfaceTertiary, borderColor: colors.border }]}>
                <Ionicons name="globe-outline" size={18} color={colors.onSurface} />
                <Text style={[styles.ctaSecondaryText, { color: colors.onSurface }]}>Website</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Story viewer */}
      <Modal visible={!!viewing} transparent animationType="fade" onRequestClose={() => setViewing(null)}>
        <Pressable style={styles.viewer} onPress={() => setViewing(null)} testID="story-viewer">
          {viewing && <Image source={{ uri: viewing.image }} style={styles.viewerImg} contentFit="contain" />}
          {viewing && (
            <View style={styles.viewerMeta}>
              <Text style={styles.viewerName}>{viewing.user_name}</Text>
            </View>
          )}
          <View style={styles.viewerClose}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </View>
        </Pressable>
      </Modal>
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 220, justifyContent: "flex-end" },
  heroContent: { padding: 16, gap: 8 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  recurringBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  recurringText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  catBadge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  catBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  heroTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  body: { padding: 16, gap: 14 },
  metaRow: { flexDirection: "row", alignItems: "center" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { fontSize: 14, fontWeight: "500" },
  countdownChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  countdownText: { fontSize: 13, fontWeight: "800" },
  saveHero: { position: "absolute", top: 14, right: 14, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  liveCard: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 12 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF3B30" },
  liveCount: { fontSize: 22, fontWeight: "800" },
  liveLabel: { fontSize: 14, fontWeight: "600" },
  checkinBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 12, borderWidth: 1 },
  checkinText: { fontSize: 15, fontWeight: "700" },
  venueName: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },
  attendeeRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  attendee: { alignItems: "center", width: 52, gap: 4 },
  attendeeAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  attendeeImg: { width: "100%", height: "100%" },
  attendeeInitial: { fontSize: 16, fontWeight: "800" },
  attendeeName: { fontSize: 11, textAlign: "center" },
  storiesHeader: { marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  storiesRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  storyAdd: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  storyThumb: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, overflow: "hidden" },
  storyImg: { width: "100%", height: "100%" },
  emptyStories: { fontSize: 13, fontStyle: "italic" },
  chatBtn: { flexDirection: "row", alignItems: "center", gap: 10, height: 52, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14 },
  chatText: { fontSize: 15, fontWeight: "700" },
  desc: { fontSize: 15, lineHeight: 22 },
  ctaGroup: { gap: 10, marginTop: 4 },
  ctaPrimary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 12 },
  ctaPrimaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  ctaRow: { flexDirection: "row", gap: 10 },
  ctaSecondary: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 12, borderWidth: 1 },
  ctaSecondaryText: { fontSize: 15, fontWeight: "600" },
  viewer: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", alignItems: "center", justifyContent: "center" },
  viewerImg: { width: "100%", height: "80%" },
  viewerMeta: { position: "absolute", top: 60, left: 20 },
  viewerName: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  viewerClose: { position: "absolute", top: 56, right: 20 },
});
