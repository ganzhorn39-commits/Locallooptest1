// Icon font loader. @react-native-vector-icons/ionicons registers its glyphs
// under the "Ionicons" font family (postScriptName). We load the bundled .ttf
// via expo-font so icons render on web, Expo Go and dev/prod builds alike.
// Usage: const [loaded, error] = useIconFonts();

import { useFonts } from "expo-font";

export const useIconFonts = (): readonly [boolean, Error | null] =>
  useFonts({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Ionicons: require("@react-native-vector-icons/ionicons/fonts/Ionicons.ttf"),
  });
