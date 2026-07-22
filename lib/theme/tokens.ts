export interface Palette {
  background: string;
  surface: string;
  surfaceSolid: string;
  hairline: string;
  primary: string;
  deepAccent: string;
  lightAccent: string;
  darkest: string;
  alert: string;
  success: string;
  textPrimary: string;
  textSecondary: string;
}

export type ThemeMode = "light" | "dark";

export const palette: Record<ThemeMode, Palette> = {
  light: {
    background: "#F4F7FB",
    surface: "rgba(255,255,255,0.68)",
    surfaceSolid: "#FFFFFF",
    hairline: "rgba(4,29,86,0.08)",
    primary: "#266CA9",
    deepAccent: "#0F2573",
    lightAccent: "#ADE1FB",
    darkest: "#041D56",
    alert: "#D64545",
    success: "#2E8B57",
    textPrimary: "#10131A",
    textSecondary: "#63707D",
  },
  dark: {
    background: "#0B111C",
    surface: "rgba(0,0,0,0.6)",
    surfaceSolid: "#131B29",
    hairline: "rgba(237,241,247,0.08)",
    primary: "#266CA9",
    deepAccent: "#0F2573",
    lightAccent: "#ADE1FB",
    darkest: "#01082D",
    alert: "#D64545",
    success: "#2E8B57",
    textPrimary: "#EDF1F7",
    textSecondary: "#8B97A6",
  },
};

export const typography = {
  display: { fontSize: 32, fontWeight: "600" as const },
  title: { fontSize: 22, fontWeight: "600" as const },
  body: { fontSize: 16, fontWeight: "400" as const },
  caption: { fontSize: 13, fontWeight: "500" as const },
};

export const tabularNumsStyle = {
  fontVariant: ["tabular-nums" as const],
};

export const radii = {
  card: 12,
  glass: 20,
};

export const elevation = {
  level1: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  level2Blur: 20,
};
