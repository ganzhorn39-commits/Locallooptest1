import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { storage } from "@/src/utils/storage";

// Named app themes:
//  - "standard": the original high-end dark obsidian theme with electric ice-blue primary
//    and emerald mint accents (glassmorphism, dark map style).
//  - "gold": a bright "Gold & White" theme — white backgrounds, elegant gold accents/borders,
//    and standard realistic map colors (no dark map overlay).
const PALETTE = {
  surface: { standard: "#0A0B0D", gold: "#FFFFFF" },
  onSurface: { standard: "#EDEEF2", gold: "#1C1A12" },
  surfaceSecondary: { standard: "#141519", gold: "#FBF8F0" },
  onSurfaceSecondary: { standard: "#C7C9D1", gold: "#3B3524" },
  surfaceTertiary: { standard: "#1E2025", gold: "#F3ECD9" },
  onSurfaceTertiary: { standard: "#8A8D98", gold: "#8C7C50" },
  surfaceInverse: { standard: "#FFFFFF", gold: "#1C1A12" },
  onSurfaceInverse: { standard: "#0E1013", gold: "#FFFFFF" },
  brand: { standard: "#159AB8", gold: "#C9A227" },
  onBrand: { standard: "#FFFFFF", gold: "#FFFFFF" },
  brandTertiary: { standard: "#0E2A33", gold: "#F6EDD1" },
  onBrandTertiary: { standard: "#7FE0F2", gold: "#8A6D1F" },
  accent: { standard: "#2EE6A6", gold: "#B8860B" },
  onAccent: { standard: "#04160F", gold: "#FFFFFF" },
  success: { standard: "#2EE6A6", gold: "#0F9E74" },
  warning: { standard: "#EFC94C", gold: "#B58900" },
  error: { standard: "#FF6369", gold: "#E5484D" },
  border: { standard: "#26282E", gold: "#E7D9AE" },
  borderStrong: { standard: "#3A3D45", gold: "#D4BE7C" },
  pinNightlife: { standard: "#4C7DFF", gold: "#3C6BE0" },
  pinFood: { standard: "#F2C14E", gold: "#C99A2E" },
  pinSports: { standard: "#34D399", gold: "#2F9E5B" },
  pinCulture: { standard: "#3AA0FF", gold: "#2A86C4" },
};

export type ThemeColors = { [K in keyof typeof PALETTE]: string };
export type ThemeName = "standard" | "gold";

const THEME_KEY = "localloop_theme_name";

type Ctx = {
  theme: ThemeName;
  colors: ThemeColors;
  setTheme: (name: ThemeName) => void;
  isDark: boolean;
};

const ThemeCtx = createContext<Ctx>({} as Ctx);

function resolveColors(theme: ThemeName): ThemeColors {
  const out = {} as ThemeColors;
  (Object.keys(PALETTE) as (keyof typeof PALETTE)[]).forEach((k) => {
    out[k] = PALETTE[k][theme];
  });
  return out;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("standard");

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<string>(THEME_KEY, "");
      if (saved === "standard" || saved === "gold") setThemeState(saved);
      else setThemeState("standard");
    })();
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeState(name);
    storage.setItem(THEME_KEY, name);
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, colors: resolveColors(theme), setTheme, isDark: theme === "standard" }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
