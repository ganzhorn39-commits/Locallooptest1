import { Platform, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";

export type PickResult = { base64: string } | { error: "permission" } | { cancelled: true };

// Returns a base64 data URI, or an error/cancel marker.
export async function pickImage(source: "library" | "camera"): Promise<PickResult> {
  if (source === "camera") {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      if (!perm.canAskAgain && Platform.OS !== "web") Linking.openSettings();
      return { error: "permission" };
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.5,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (res.canceled || !res.assets?.[0]?.base64) return { cancelled: true };
    return { base64: `data:image/jpeg;base64,${res.assets[0].base64}` };
  }

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    if (!perm.canAskAgain && Platform.OS !== "web") Linking.openSettings();
    return { error: "permission" };
  }
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.5,
    base64: true,
    allowsEditing: true,
    aspect: [1, 1],
  });
  if (res.canceled || !res.assets?.[0]?.base64) return { cancelled: true };
  return { base64: `data:image/jpeg;base64,${res.assets[0].base64}` };
}
