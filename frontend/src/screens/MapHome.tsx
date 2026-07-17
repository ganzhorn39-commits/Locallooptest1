import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/src/theme/theme";
import { useAuth } from "@/src/auth/AuthContext";
import { useI18n } from "@/src/i18n";
import { api, EventItem } from "@/src/api/client";
import { DEFAULT_REGION } from "@/src/constants/categories";
import { filterEvents, QuickKey } from "@/src/utils/filters";
import MapCanvas from "@/src/components/MapCanvas";
import CategoryFilterRow from "@/src/components/CategoryFilterRow";
import SearchFilterBar from "@/src/components/SearchFilterBar";
import EventSheet from "@/src/components/EventSheet";

export default function MapHome() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [quick, setQuick] = useState<QuickKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [region, setRegion] = useState<any>(DEFAULT_REGION);
  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>(null);

  const sheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<any>(null);
  const snapPoints = useMemo(() => ["36%", "90%"], []);

  const load = useCallback(async () => {
    try {
      setEvents(await api.listEvents());
    } catch (e) {
      console.log("load events error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(
    () => filterEvents(events, { query, category, quick, userLoc }),
    [events, query, category, quick, userLoc]
  );

  const requestLocation = useCallback(async () => {
    if (Platform.OS === "web") return;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      const c = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserLoc(c);
      const r = { ...c, latitudeDelta: 0.05, longitudeDelta: 0.05 };
      setRegion(r);
      mapRef.current?.animateToRegion?.(r, 600);
    } catch {}
  }, []);

  React.useEffect(() => { requestLocation(); }, [requestLocation]);

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
    if (!filtered.length) return;
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const now = Date.now();
    const twoH = now + 2 * 3600 * 1000;
    let pool = filtered.filter((e) => {
      const t = new Date(e.start_time).getTime();
      return t >= now - 30 * 60 * 1000 && t <= twoH;
    });
    if (!pool.length) pool = [...filtered];
    pool.sort((a, b) => b.live_count - a.live_count);
    const top = pool.slice(0, Math.min(5, pool.length));
    const pick = top[Math.floor(Math.random() * top.length)];
    const r = { latitude: pick.latitude, longitude: pick.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
    setRegion(r);
    mapRef.current?.animateToRegion?.(r, 800);
    onSelectPin(pick);
  }, [filtered, onSelectPin]);

  const toggleQuick = (k: QuickKey) => setQuick((q) => (q.includes(k) ? q.filter((x) => x !== k) : [...q, k]));

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="map-home">
      <MapCanvas events={filtered} region={region} onSelect={onSelectPin} mapRef={mapRef} />

      <View style={[styles.headerWrap, { top: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.searchWrap}>
          <SearchFilterBar query={query} onQuery={setQuery} quick={quick} onToggleQuick={toggleQuick} />
        </View>

        <CategoryFilterRow selected={category} onSelect={setCategory} />
      </View>

      {Platform.OS !== "web" && (
        <Pressable
          testID="recenter-button"
          onPress={requestLocation}
          style={[styles.recenter, { bottom: insets.bottom + 150, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
        >
          <Ionicons name="locate" size={22} color={colors.brand} />
        </Pressable>
      )}

      <Pressable
        testID="surprise-me-button"
        onPress={surpriseMe}
        style={[styles.surprise, { bottom: insets.bottom + 90, backgroundColor: colors.surfaceInverse }]}
      >
        <Text style={{ fontSize: 16 }}>🎲</Text>
        <Text style={[styles.surpriseText, { color: colors.onSurfaceInverse }]}>{t("surprise_me")}</Text>
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
          <EventSheet event={selected} checkedIn={checkedIn} onCheckin={onCheckin} bottomInset={insets.bottom} />
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrap: { position: "absolute", left: 0, right: 0, gap: 8 },
  searchWrap: { paddingHorizontal: 16 },
  recenter: { position: "absolute", right: 16, width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  surprise: {
    position: "absolute", left: 16, flexDirection: "row", alignItems: "center", gap: 8,
    height: 48, paddingHorizontal: 18, borderRadius: 24,
    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },
  surpriseText: { fontSize: 15, fontWeight: "800" },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
});
