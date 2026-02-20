"use client";

import { useEffect } from "react";

import { useTheme } from "next-themes";

const THEME_COLORS: Record<string, string> = {
  dark: "#0f172a",
  light: "#ffffff",
  "theme-arcane": "#1a0033",
  "theme-inferno": "#1c0a00",
  "theme-frost": "#0c1929",
  "theme-rainbow": "#0f172a",
  "theme-retro": "#000000",
  "theme-glitchwitch": "#080808",
};

/**
 * Dynamically updates <meta name="theme-color"> to match the active theme.
 * This controls the browser chrome color on mobile Safari/Chrome.
 */
export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color = THEME_COLORS[resolvedTheme ?? "dark"] ?? THEME_COLORS.dark;
    let meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }

    meta.setAttribute("content", color);
  }, [resolvedTheme]);

  return null;
}
