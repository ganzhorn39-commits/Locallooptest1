import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { api } from "@/src/api/client";

// Registers the device for push. Native-only; no-op on web / Expo Go without a build.
export async function registerForPush(userId: string) {
  if (Platform.OS === "web") return;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;
    const tokenResp = await Notifications.getDevicePushTokenAsync();
    await api.registerPush({
      user_id: userId,
      platform: Platform.OS,
      device_token: String(tokenResp.data),
    });
  } catch (e) {
    // Push not available in Expo Go / web preview — safe to ignore.
    console.log("push registration skipped", e);
  }
}
