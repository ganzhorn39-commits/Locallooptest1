import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import BottomSheet from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/src/theme/theme";
import { useAuth } from "@/src/auth/AuthContext";
import { api, EventItem } from "@/src/api/client";
import { DEFAULT_REGION } from "@/src/constants/categories";
import MapCanvas from "@/src/components/MapCanvas";
import CategoryFilterRow from "@/src/components/CategoryFilterRow";
import EventSheet from "@/src/components/EventSheet";

export default function MapHome() {
  const { colors, isDark, toggle } = useTheme();
  const { user } = useAuth();  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [region, setRegion] = useState<any>(DEFAULT_REGION);

  const sheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<any>(null);
  const snapPoints = useMemo(() => ["34%", "90%"], []);

  const load = useCallback(async (cat: string) => {
    try {
      const data = await api.listEvents(cat);
      setEvents(data);
    } catch (e) {
      console.log("load events error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(category);
    }, [category, load])
  );

  const requestLocation = useCallback(async () => {
    if (Platform.OS === "web") return;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      const r = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(r);
      mapRef.current?.animateToRegion?.(r, 600);
    } catch {}
  }, []);

  React.useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const onSelectPin = useCallback(async (e: EventItem) => {
    setSelected(e);
    setCheckedIn(false);
    sheetRef.current?.snapToIndex(0);
    if (user) {
      try {
        const s = await api.checkinStatus(e.id);
        setCheckedIn(s.checked_in);
      } catch {}
    }
  }, [user]);

  const onCheckin = useCallback(async () => {
    if (!selected) return;
    try {
      const res = await api.checkin(selected.id);
      setCheckedIn(res.checked_in);
      setSelected(res);
      setEvents((prev) => prev.map((ev) => (ev.id === res.id ? res : ev)));
    } catch (e) {
      console.log("checkin error", e);
    }
  }, [selected]);

  const surpriseMe = useCallback(() => {
    if (!events.length) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const now = Date.now();
    const twoH = now + 2 * 3600 * 1000;
    let pool = events.filter((e) => {
      const t = new Date(e.start_time).getTime();
      return t >= now - 30 * 60 * 1000 && t <= twoH;
    });
    if (!pool.length) pool = [...events];
    pool.sort((a, b) => b.live_count - a.live_count);
    const top = pool.slice(0, Math.min(5, pool.length));
    const pick = top[Math.floor(Math.random() * top.length)];
    const r = { latitude: pick.latitude, longitude: pick.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
    setRegion(r);
    mapRef.current?.animateToRegion?.(r, 800);
    onSelectPin(pick);
  }, [events, onSelectPin]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="map-home">
      <MapCanvas events={events} region={region} onSelect={onSelectPin} mapRef={mapRef} />

      {/* Floating glass header */}
      <View style={[styles.headerWrap, { top: insets.top + 8 }]} pointerEvents="box-none">
        <BlurView intensity={60} tint={isDark ? "dark" : "light"} style={[styles.header, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary + (Platform.OS === "web" ? "" : "CC") }]}>
          <View style={styles.brandRow}>
            <View style={[styles.brandDot, { backgroundColor: colors.brand }]} />
            <Text style={[styles.brandName, { color: colors.onSurface }]}>LocalLoop</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable testID="theme-toggle" onPress={toggle} style={[styles.iconBtn, { backgroundColor: colors.surfaceTertiary }]}>
              <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={colors.onSurface} />
            </Pressable>
            <Pressable testID="crews-button" onPress={() => router.push("/crews")} style={[styles.iconBtn, { backgroundColor: colors.surfaceTertiary }]}>
              <Ionicons name="people" size={18} color={colors.onSurface} />
            </Pressable>
            <Pressable testID="profile-button" onPress={() => router.push("/profile")} style={[styles.iconBtn, { backgroundColor: colors.surfaceTertiary, overflow: "hidden" }]}>
              {user?.picture ? (
                <Image source={{ uri: user.picture }} style={{ width: 34, height: 34 }} />
              ) : (
                <Ionicons name="person" size={18} color={colors.onSurface} />
              )}
            </Pressable>
          </View>
        </BlurView>
        <CategoryFilterRow selected={category} onSelect={(c) => { setCategory(c); }} />
      </View>

      {/* Recenter */}
      {Platform.OS !== "web" && (
        <Pressable
          testID="recenter-button"
          onPress={requestLocation}
          style={[styles.recenter, { bottom: insets.bottom + 96, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
        >
          <Ionicons name="locate" size={22} color={colors.brand} />
        </Pressable>
      )}

      {/* Surprise Me */}
      <Pressable
        testID="surprise-me-button"
        onPress={surpriseMe}
        style={[styles.surprise, { bottom: insets.bottom + 24, backgroundColor: colors.surfaceInverse }]}
      >
        <Text style={{ fontSize: 16 }}>🎲</Text>
        <Text style={[styles.surpriseText, { color: colors.onSurfaceInverse }]}>Surprise Me</Text>
      </Pressable>

      {/* FAB add event */}
      <Pressable
        testID="add-event-fab"
        onPress={() => router.push("/add-event")}
        style={[styles.fab, { bottom: insets.bottom + 24, backgroundColor: colors.brand }]}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={colors.brand} size="large" />
        </View>
      )}

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        onClose={() => setSelected(null)}
        handleIndicatorStyle={{ backgroundColor: colors.borderStrong }}
        backgroundStyle={{ backgroundColor: colors.surfaceSecondary }}
      >
        {selected && (
          <EventSheet
            event={selected}
            checkedIn={checkedIn}
            onCheckin={onCheckin}
            bottomInset={insets.bottom}
          />
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: { position: "absolute", left: 0, right: 0, gap: 4 },
  header: {
    marginHorizontal: 16,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    overflow: "hidden",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandDot: { width: 12, height: 12, borderRadius: 6 },
  brandName: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  recenter: {
    position: "absolute",
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  surprise: {
    position: "absolute",
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  surpriseText: { fontSize: 15, fontWeight: "800" },
});
