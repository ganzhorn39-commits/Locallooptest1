import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@react-native-vector-icons/ionicons";

export default function SplashIntro({ onDone }: { onDone: () => void }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slogan = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(slogan, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.delay(700),
    ]).start(() => onDone());

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.25, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient colors={["#000000", "#140a08", "#000000"]} style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <Animated.View style={[styles.glow, { transform: [{ scale: pulse }] }]} />
        <View style={styles.logo}>
          <Ionicons name="location" size={44} color="#FFFFFF" />
        </View>
      </Animated.View>
      <Animated.Text style={[styles.wordmark, { opacity }]}>LocalLoop</Animated.Text>
      <Animated.Text style={[styles.slogan, { opacity: slogan }]}>The city's pulse, on your map.</Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", zIndex: 999 },
  logoWrap: { alignItems: "center", justifyContent: "center", marginBottom: 24 },
  glow: { position: "absolute", width: 130, height: 130, borderRadius: 65, backgroundColor: "#1FB0D0", opacity: 0.35 },
  logo: { width: 88, height: 88, borderRadius: 26, backgroundColor: "#1FB0D0", alignItems: "center", justifyContent: "center" },
  wordmark: { color: "#FFFFFF", fontSize: 38, fontWeight: "900", letterSpacing: -1 },
  slogan: { color: "rgba(255,255,255,0.7)", fontSize: 15, marginTop: 8, fontWeight: "500" },
});
