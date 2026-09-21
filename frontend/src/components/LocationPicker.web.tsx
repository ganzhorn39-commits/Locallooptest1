import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useTheme } from "@/src/theme/theme";
import { DEFAULT_REGION } from "@/src/constants/categories";

type Props = {
  coord: { latitude: number; longitude: number };
  onChange: (c: { latitude: number; longitude: number }) => void;
};

export default function LocationPicker({ coord, onChange }: Props) {
  const { colors, isDark } = useTheme();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const r = DEFAULT_REGION;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  const px = size.w ? (0.5 + (coord.longitude - r.longitude) / r.longitudeDelta) * size.w : size.w / 2;
  const py = size.h ? (0.5 - (coord.latitude - r.latitude) / r.latitudeDelta) * size.h : size.h / 2;

  const handlePress = (e: any) => {
    if (!size.w || !size.h) return;
    const x = e.nativeEvent.locationX;
    const y = e.nativeEvent.locationY;
    const lng = r.longitude + (x / size.w - 0.5) * r.longitudeDelta;
    const lat = r.latitude - (y / size.h - 0.5) * r.latitudeDelta;
    onChange({ latitude: lat, longitude: lng });
  };

  return (
    <Pressable
      testID="location-picker"
      onLayout={onLayout}
      onPress={handlePress}
      style={[styles.wrap, { borderColor: colors.border, backgroundColor: isDark ? "#0e1626" : "#dfe7ef" }]}
    >
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1604079628040-94301bb21b91?crop=entropy&cs=srgb&fm=jpg&q=70&w=700" }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.25)" }]} />
      <View style={[styles.marker, { left: px - 14, top: py - 28 }]} pointerEvents="none">
        <Ionicons name="location" size={30} color={colors.brand} />
      </View>
      <Text style={[styles.hint, { color: "#FFFFFF" }]}>Tap to set location</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 200, borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  marker: { position: "absolute" },
  hint: { position: "absolute", bottom: 8, alignSelf: "center", fontSize: 12, fontWeight: "600", backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
});
