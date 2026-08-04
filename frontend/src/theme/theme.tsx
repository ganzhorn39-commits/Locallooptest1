import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { storage } from "@/src/utils/storage";

// Elegant high-end dark mode: matte charcoal / obsidian gray + glassmorphism,
// with electric ice-blue primary and emerald mint accents. No purple/violet/orange.
const PALETTE = {
  surface: { light: "#F4F6F8", dark: "#0A0B0D" },
  onSurface: { light: "#0E1013", dark: "#EDEEF2" },
  surfaceSecondary: { light: "#FFFFFF", dark: "#141519" },
  onSurfaceSecondary: { light: "#24262B", dark: "#C7C9D1" },
  surfaceTertiary: { light: "#EAECF0", dark: "#1E2025" },
  onSurfaceTertiary: { light: "#5A5D66", dark: "#8A8D98" },
  surfaceInverse: { light: "#0E1013", dark: "#FFFFFF" },
  onSurfaceInverse: { light: "#FFFFFF", dark: "#0E1013" },
  brand: { light: "#0C7E9B", dark: "#159AB8" },
  onBrand: { light: "#FFFFFF", dark: "#FFFFFF" },
  brandTertiary: { light: "#DEF2F8", dark: "#0E2A33" },
  onBrandTertiary: { light: "#0A6B84", dark: "#7FE0F2" },
  accent: { light: "#0F9E74", dark: "#2EE6A6" },
  onAccent: { light: "#FFFFFF", dark: "#04160F" },
  success: { light: "#0F9E74", dark: "#2EE6A6" },
  warning: { light: "#B58900", dark: "#EFC94C" },
  error: { light: "#E5484D", dark: "#FF6369" },
  border: { light: "#DFE2E8", dark: "#26282E" },
  borderStrong: { light: "#C3C7CE", dark: "#3A3D45" },
  pinNightlife: { light: "#3C6BE0", dark: "#4C7DFF" },
  pinFood: { light: "#C99A2E", dark: "#F2C14E" },
  pinSports: { light: "#2F9E5B", dark: "#34D399" },
  pinCulture: { light: "#2A86C4", dark: "#3AA0FF" },
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
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<string>(THEME_KEY, "");
      if (saved === "light" || saved === "dark") setMode(saved);
      else setMode("dark");
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
