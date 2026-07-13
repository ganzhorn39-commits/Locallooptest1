import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useColorScheme } from "react-native";
import { storage } from "@/src/utils/storage";

const PALETTE = {
  surface: { light: "#F9F9F8", dark: "#000000" },
  onSurface: { light: "#111111", dark: "#F2F2F7" },
  surfaceSecondary: { light: "#FFFFFF", dark: "#1C1C1E" },
  onSurfaceSecondary: { light: "#1C1C1E", dark: "#E5E5EA" },
  surfaceTertiary: { light: "#F0F0EE", dark: "#2C2C2E" },
  onSurfaceTertiary: { light: "#4A4A4C", dark: "#AEAEB2" },
  surfaceInverse: { light: "#111111", dark: "#FFFFFF" },
  onSurfaceInverse: { light: "#FFFFFF", dark: "#111111" },
  brand: { light: "#FF5A36", dark: "#FF5A36" },
  onBrand: { light: "#FFFFFF", dark: "#FFFFFF" },
  brandTertiary: { light: "#FFEDE9", dark: "#3A1B14" },
  onBrandTertiary: { light: "#E03A16", dark: "#FF8A70" },
  success: { light: "#24A143", dark: "#32D74B" },
  warning: { light: "#E67A00", dark: "#FF9F0A" },
  error: { light: "#FF3B30", dark: "#FF453A" },
  border: { light: "#E5E5EA", dark: "#38383A" },
  borderStrong: { light: "#C7C7CC", dark: "#48484A" },
  pinNightlife: { light: "#AF52DE", dark: "#BF5AF2" },
  pinFood: { light: "#FF9500", dark: "#FF9F0A" },
  pinSports: { light: "#34C759", dark: "#32D74B" },
  pinCulture: { light: "#007AFF", dark: "#0A84FF" },
};

export type ThemeColors = { [K in keyof typeof PALETTE]: string };
export type ThemeMode = "light" | "dark";

const THEME_KEY = "localloop_theme_mode";

type Ctx = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggle: () => void;
  isDark: boolean;
};

const ThemeCtx = createContext<Ctx>({} as Ctx);

function resolveColors(mode: ThemeMode): ThemeColors {
  const out = {} as ThemeColors;
  (Object.keys(PALETTE) as (keyof typeof PALETTE)[]).forEach((k) => {
    out[k] = PALETTE[k][mode];
  });
  return out;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<string>(THEME_KEY, "");
      if (saved === "light" || saved === "dark") setMode(saved);
      else setMode(system === "light" ? "light" : "dark");
    })();
  }, []);

  const toggle = useCallback(() => {
    setMode((m) => {
      const next = m === "dark" ? "light" : "dark";
      storage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  return (
    <ThemeCtx.Provider value={{ mode, colors: resolveColors(mode), toggle, isDark: mode === "dark" }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
