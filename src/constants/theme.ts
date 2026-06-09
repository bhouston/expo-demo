import { useColorScheme } from "react-native";

export type ThemeColors = {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  separator: string;
  tint: string;
  destructive: string;
  fabText: string;
};

const palettes: Record<"light" | "dark", ThemeColors> = {
  light: {
    background: "#F2F2F7",
    card: "#FFFFFF",
    text: "#000000",
    secondaryText: "#6B7280",
    separator: "#E5E5EA",
    tint: "#007AFF",
    destructive: "#FF3B30",
    fabText: "#FFFFFF",
  },
  dark: {
    background: "#000000",
    card: "#1C1C1E",
    text: "#FFFFFF",
    secondaryText: "#9CA3AF",
    separator: "#38383A",
    tint: "#0A84FF",
    destructive: "#FF453A",
    fabText: "#FFFFFF",
  },
};

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return palettes[scheme === "dark" ? "dark" : "light"];
}
