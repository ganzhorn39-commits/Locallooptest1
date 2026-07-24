import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useColorScheme } from "react-native";
import { storage } from "@/src/utils/storage";

// Premium dark-first palette. Primary = electric violet, accent = emerald mint. No orange.
const PALETTE = {
  surface: { light: "#F5F6FB", dark: "#07070E" },
  onSurface: { light: "#0E0E16", dark: "#F3F3F8" },
  surfaceSecondary: { light: "#FFFFFF", dark: "#13131F" },
  onSurfaceSecondary: { light: "#262632", dark: "#D9D9E3" },
  surfaceTertiary: { light: "#ECEDF4", dark: "#1E1E2D" },
  onSurfaceTertiary: { light: "#5A5B68", dark: "#9A9BAC" },
  surfaceInverse: { light: "#0E0E16", dark: "#FFFFFF" },
  onSurfaceInverse: { light: "#FFFFFF", dark: "#0E0E16" },
  brand: { light: "#6C3FF5", dark: "#7C5CFF" },
  onBrand: { light: "#FFFFFF", dark: "#FFFFFF" },
  brandTertiary: { light: "#ECE7FF", dark: "#221B45" },
  onBrandTertiary: { light: "#5B3FD6", dark: "#B9A8FF" },
  accent: { light: "#0F9E74", dark: "#2EE6A6" },
  onAccent: { light: "#FFFFFF", dark: "#04160F" },
  success: { light: "#0F9E74", dark: "#2EE6A6" },
  warning: { light: "#B58900", dark: "#FFD60A" },
  error: { light: "#E5484D", dark: "#FF6369" },
  border: { light: "#E2E3EE", dark: "#26263A" },
  borderStrong: { light: "#C6C7D6", dark: "#3A3A54" },
  pinNightlife: { light: "#A855F7", dark: "#B15CFF" },
  pinFood: { light: "#D69E2E", dark: "#F4C242" },
  pinSports: { light: "#2F9E5B", dark: "#34D399" },
  pinCulture: { light: "#3B6EF5", dark: "#5B8CFF" },
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
