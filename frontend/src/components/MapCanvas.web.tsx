import React from "react";
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/src/theme/theme";
import { categoryMeta, DEFAULT_REGION } from "@/src/constants/categories";
import type { EventItem } from "@/src/api/client";

type Props = {
  events: EventItem[];
  region: any;
  onSelect: (e: EventItem) => void;
};

// Web fallback "map": a stylized canvas with positioned pins so the full
// tap -> bottom sheet flow works in the web preview (react-native-maps is native-only).
export default function MapCanvas({ events, region, onSelect }: Props) {
  const { colors, isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const r = region || DEFAULT_REGION;

  const pos = (lat: number, lng: number) => {
    const x = 0.5 + (lng - r.longitude) / r.longitudeDelta;
    const y = 0.5 - (lat - r.latitude) / r.latitudeDelta;
    return {
      left: Math.max(0.06, Math.min(0.94, x)) * width,
      top: Math.max(0.12, Math.min(0.82, y)) * height,
    };
  };

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "#0e1626" : "#dfe7ef" }]} testID="map-view">
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1604079628040-94301bb21b91?crop=entropy&cs=srgb&fm=jpg&q=70&w=800" }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.35)" }]} />
      {events.map((e) => {
        const meta = categoryMeta(e.category);
        const color = meta.color;
        const p = pos(e.latitude, e.longitude);
        return (
          <Pressable
            key={e.id}
            testID={`map-pin-${e.id}`}
            onPress={() => onSelect(e)}
            style={[styles.pinWrap, { left: p.left - 20, top: p.top - 24 }]}
          >
            {e.is_hot && <View style={[styles.pulse, { backgroundColor: color }]} />}
            <View style={[styles.pin, { backgroundColor: color, shadowColor: color, shadowRadius: 10, shadowOpacity: 0.9, shadowOffset: { width: 0, height: 0 } }]}>
              <Text style={styles.emoji}>{e.emoji || meta.emoji}</Text>
            </View>
          </Pressable>
        );
      })}
      <LinearGradient
        colors={["transparent", isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)"]}
        style={styles.bottomFade}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pinWrap: { position: "absolute", alignItems: "center", justifyContent: "center", width: 40, height: 48 },
  emoji: { fontSize: 17 },
  pulse: { position: "absolute", top: 2, width: 34, height: 34, borderRadius: 17, opacity: 0.35 },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  bottomFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 160 },
});
