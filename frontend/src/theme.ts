// Design tokens for MONOR XUR. Light theme (warm, botanical, elderly-friendly).
//
// Keys match the "color" block of /app/design_guidelines.json. Build styles with
// makeStyles() so colors follow the scheme; read useTheme().colors for color
// props (icon color, placeholderTextColor, ActivityIndicator). Never write color
// literals in components.

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

// Nunito font families (loaded in app/_layout.tsx via expo-font).
export const fonts = {
  regular: "Nunito-Regular",
  medium: "Nunito-Medium",
  semibold: "Nunito-SemiBold",
  bold: "Nunito-Bold",
  extrabold: "Nunito-ExtraBold",
} as const;

// Type scale (accessibility override: base is 18pt).
export const type = {
  sm: 14,
  base: 18,
  lg: 22,
  xl: 28,
  "2xl": 36,
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

const light = {
  // Surfaces
  surface: "#FDFBF7",
  onSurface: "#2D3A2F",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#2D3A2F",
  surfaceTertiary: "#FDF0D5",
  onSurfaceTertiary: "#332610",
  surfaceInverse: "#2D3A2F",
  onSurfaceInverse: "#FDFBF7",
  muted: "#5A6E5D",

  // Brand
  brand: "#87A987",
  onBrand: "#FFFFFF",
  brandPrimary: "#5B825B",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#D4E4E6",
  onBrandSecondary: "#1C2A2D",
  brandTertiary: "#F0D8D6",
  onBrandTertiary: "#3D2423",

  // Status
  success: "#6B8E6B",
  onSuccess: "#FFFFFF",
  warning: "#E8B25C",
  onWarning: "#332610",
  error: "#C46A66",
  onError: "#FFFFFF",
  info: "#7A9CA4",
  onInfo: "#FFFFFF",

  // Lines
  border: "#E0DCD3",
  borderStrong: "#C2BDB2",
  divider: "#EAE6DF",

  // Pastel tile backgrounds (patient home + feature accents)
  tileMemories: "#F0D8D6", // muted pink
  onTileMemories: "#3D2423",
  tileGames: "#FDF0D5", // pastel yellow
  onTileGames: "#332610",
  tileRelaxation: "#D4E4E6", // pastel blue
  onTileRelaxation: "#1C2A2D",
  tileDailyLife: "#DCEAD2", // light green
  onTileDailyLife: "#28331F",

  // Soft brand wash for large hero areas / cards
  brandWash: "#EAF1E8",
  onBrandWash: "#2D3A2F",
};

export type ThemeColors = typeof light;

export const defaultScheme = "light" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark?: ThemeColors } = { light };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme);
}

setColorScheme?.(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
