import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Platform } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useTheme } from "@/src/theme/theme";
import { categoryMeta } from "@/src/constants/categories";
import type { EventItem } from "@/src/api/client";
import { darkMapStyle } from "@/src/components/mapStyle";

type Props = {
  events: EventItem[];
  region: any;
  onSelect: (e: EventItem) => void;
  mapRef?: any;
};

function Pin({ event, color, onPress }: { event: EventItem; color: string; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!event.is_hot) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.6, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [event.is_hot]);

  const meta = categoryMeta(event.category);
  return (
    <View style={styles.pinWrap}>
      {event.is_hot && (
        <Animated.View
          style={[styles.pulse, { backgroundColor: color, transform: [{ scale }], opacity: scale.interpolate({ inputRange: [1, 1.6], outputRange: [0.4, 0] }) }]}
        />
      )}
      <View style={[styles.pin, { backgroundColor: color }]}>
        <Text style={styles.emoji}>{meta.emoji}</Text>
      </View>
      <View style={[styles.pinTip, { borderTopColor: color }]} />
    </View>
  );
}

export default function MapCanvas({ events, region, onSelect, mapRef }: Props) {
  const { colors, isDark } = useTheme();
  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_DEFAULT}
      style={StyleSheet.absoluteFill}
      initialRegion={region}
      showsUserLocation
      showsMyLocationButton={false}
      customMapStyle={isDark ? darkMapStyle : []}
      testID="map-view"
    >
      {events.map((e) => {
        const meta = categoryMeta(e.category);
        return (
          <Marker
            key={e.id}
            coordinate={{ latitude: e.latitude, longitude: e.longitude }}
            onPress={() => onSelect(e)}
            tracksViewChanges={Platform.OS === "ios" ? false : undefined}
          >
            <Pin event={e} color={colors[meta.colorKey]} onPress={() => onSelect(e)} />
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  pinWrap: { alignItems: "center", justifyContent: "center", width: 60, height: 60 },
  emoji: { fontSize: 17 },
  pulse: { position: "absolute", width: 34, height: 34, borderRadius: 17, top: 5 },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  pinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -1,
  },
});
