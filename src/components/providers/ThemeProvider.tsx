"use client";

import * as React from "react";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

import { CustomThemeService } from "@/services/persistence/custom-themes";

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

    // specific cleanup for custom vars if switching away
    // We only remove vars starting with --sp- IF they were added by us?
    // Actually, built-in themes set these vars via CLASS.
    // If we leave inline styles, they might override classes (specificity: inline > class).
    // So we MUST clear them when switching away from custom.
    const styles = root.style;
    // Basic cleanup of known keys
    // We can just iterate the keys we know we set, or clear all --sp-* (risky if others use it?)
    // But mostly safe for this app.
    // Let's rely on the list of keys from the Service helper for a "dummy" theme to know what to clear
    // OR just clear everything that starts with --sp-?
    // No, cleaner to know the keys.
    // Let's just create a dummy object to get keys.

    // Better: We saved them.
    // Let's just remove the ones we set in `toCssVariables`.
    // Since `toCssVariables` returns a defined set of keys, we can just generic clear them.
    // But we don't have a theme instance to get keys from if we are in "not custom" mode.
    // We can use a static list of keys.
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
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      // REMOVED 'themes' prop to allow dynamic custom-* themes
    >
      <EphemeralThemeGuard>
        <CustomThemeApplicator />
        {children}
      </EphemeralThemeGuard>
    </NextThemesProvider>
  );
}
