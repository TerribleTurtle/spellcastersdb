"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

const ALL_THEMES = [
  "dark",
  "light",
  "theme-arcane",
  "theme-inferno",
  "theme-frost",
  "theme-rainbow",
  "theme-retro",
];

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      themes={ALL_THEMES}
    >
      {children}
    </NextThemesProvider>
  );
}
