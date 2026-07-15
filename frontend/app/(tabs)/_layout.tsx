import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useTheme } from "@/src/theme/theme";

export default function TabsLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.onSurfaceTertiary,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "ios" ? "transparent" : colors.surfaceSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 58 + (Platform.OS === "ios" ? 24 : 0),
          paddingTop: 6,
        },
        tabBarBackground:
          Platform.OS === "ios"
            ? () => <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={{ flex: 1 }} />
            : undefined,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Map", tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: "Explore", tabBarIcon: ({ color, size }) => <Ionicons name="compass" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="create"
        options={{ title: "Create", tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size + 6} color={color} /> }}
      />
      <Tabs.Screen
        name="chats"
        options={{ title: "Chats", tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
