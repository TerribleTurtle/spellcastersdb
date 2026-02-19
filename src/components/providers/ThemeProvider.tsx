"use client";

import * as React from "react";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

import { CustomThemeService } from "@/services/persistence/custom-themes";

/**
 * All built-in theme class values that next-themes must know about
 * so it can remove stale classes when switching themes.
 */
const BUILT_IN_THEMES = [
  "dark",
  "light",
  "system",
  "theme-arcane",
  "theme-inferno",
  "theme-frost",
  "theme-retro",
  "theme-rainbow",
] as const;

/** Build the full themes list: built-in + any custom themes from localStorage. */
function useThemesList(): string[] {
  const [themes, setThemes] = React.useState<string[]>([...BUILT_IN_THEMES]);

  React.useEffect(() => {
    const customIds = CustomThemeService.getAll().map((t) => t.id);
    setThemes([...BUILT_IN_THEMES, ...customIds]);
  }, []);

  return themes;
}

/** On refresh, reverts Rainbow theme to the previous theme. */
function EphemeralThemeGuard({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const hasRun = React.useRef(false);

  React.useEffect(() => {
    if (!hasRun.current && theme === "theme-rainbow") {
      const prev = localStorage.getItem("sp-prev-theme") || "dark";
      setTheme(prev);
    }
    hasRun.current = true;
  }, [theme, setTheme]);

  return <>{children}</>;
}

/** Applies custom theme CSS variables to the document when a custom theme is active. */
function CustomThemeApplicator() {
  const { theme } = useTheme();

  React.useEffect(() => {
    const root = document.documentElement;

    if (theme?.startsWith("custom-")) {
      const customThemeId = theme; // The theme string IS the ID
      const allCustom = CustomThemeService.getAll();
      const customTheme = allCustom.find((t) => t.id === customThemeId);

      if (customTheme) {
        const vars = CustomThemeService.toCssVariables(customTheme);
        Object.entries(vars).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });
        return;
      }
    }

    // Clean up inline custom theme vars when switching away from custom themes.
    // Built-in themes set these vars via CSS classes, but inline styles have
    // higher specificity and would override them if left behind.
    const styles = root.style;
    const keysToRemove = [
      "--sp-brand-primary",
      "--sp-brand-secondary",
      "--sp-brand-accent",
      "--sp-brand-dark",
      "--sp-surface-main",
      "--sp-surface-card",
      "--sp-surface-hover",
      "--sp-surface-highlight",
      "--sp-surface-deck",
      "--sp-surface-raised",
      "--sp-surface-dim",
      "--sp-surface-inset",
      "--sp-surface-overlay",
      "--sp-surface-overlay-heavy",
      "--sp-surface-scrim",
      "--sp-border-subtle",
      "--sp-border-default",
      "--sp-border-strong",
      "--sp-text-primary",
      "--sp-text-secondary",
      "--sp-text-muted",
      "--sp-text-dimmed",
      "--sp-text-faint",
      "--sp-scrollbar-track",
      "--sp-scrollbar-thumb",
      "--sp-scrollbar-thumb-hover",
      "background",
    ];

    keysToRemove.forEach((key) => styles.removeProperty(key));
  }, [theme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themes = useThemesList();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      themes={themes}
    >
      <EphemeralThemeGuard>
        <CustomThemeApplicator />
        {children}
      </EphemeralThemeGuard>
    </NextThemesProvider>
  );
}
