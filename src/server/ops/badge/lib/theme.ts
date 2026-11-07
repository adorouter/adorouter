import type { Theme } from "@/lib/validation/badge";
import type { ThemeColors } from "./types";

// AdoRouter: the pill colours are the site's --primary and --primary-foreground
// (globals.css), not upstream's red. brandRed keeps its name to stay a small diff.
export const THEME_COLORS: Record<Theme, ThemeColors> = {
  dark: {
    bg: "#050505",
    cardBg: "#0a0a0a",
    text: "#f8fafc",
    muted: "#6b7280",
    border: "#1a1a1a",
    accent: "#22c55e",
    accentMuted: "#052e16",
    brandRed: "#eca8d6",
    badgeBg: "#eca8d6",
    badgeText: "#050508",
    pulseDotMarker: "#fe0099",
    previewBg: "#111",
    previewFg: "#fff",
    previewMuted: "#888",
  },
  light: {
    bg: "#ffffff",
    cardBg: "#f8fafc",
    text: "#0a0a0a",
    muted: "#6b7280",
    border: "#e4e4e7",
    accent: "#16a34a",
    accentMuted: "#bbf7d0",
    brandRed: "#18181b",
    badgeBg: "#18181b",
    badgeText: "#fafafa",
    pulseDotMarker: "#fe0099",
    previewBg: "#fff",
    previewFg: "#000",
    previewMuted: "#666",
  },
};
