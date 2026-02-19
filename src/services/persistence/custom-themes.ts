import { z } from "zod";

import { monitoring } from "@/services/monitoring";

// Base schema for a custom theme
export const CustomThemeSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(30, "Name must be 30 characters or less"),
  colors: z.object({
    "brand-primary": z.string(),
    "brand-secondary": z.string(),
    "brand-accent": z.string(),
    "brand-dark": z.string(),
    "surface-main": z.string(),
    "text-primary": z.string(),
    "text-secondary": z.string(),
    "text-muted": z.string(),
  }),
  createdAt: z.number(),
});

export type CustomTheme = z.infer<typeof CustomThemeSchema>;

// LocalStorage key
const STORAGE_KEY = "sp-custom-themes";

export const CustomThemeService = {
  // Load all custom themes
  getAll: (): CustomTheme[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      // Validate schema, filter out invalid ones silently
      const validThemes = z.array(CustomThemeSchema).safeParse(parsed);
      return validThemes.success ? validThemes.data : [];
    } catch (e) {
      monitoring.captureException(e, { operation: "loadCustomThemes" });
      return [];
    }
  },

  // Save a new theme or update existing
  save: (theme: CustomTheme): void => {
    const themes = CustomThemeService.getAll();
    const existingIndex = themes.findIndex((t) => t.id === theme.id);

    if (existingIndex >= 0) {
      themes[existingIndex] = theme;
    } else {
      themes.push(theme);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  },

  // Delete a theme by ID
  delete: (id: string): void => {
    const themes = CustomThemeService.getAll().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  },

  // Derive CSS variables string from theme colors
  toCssVariables: (theme: CustomTheme): Record<string, string> => {
    const { colors } = theme;
    return {
      "--sp-brand-primary": colors["brand-primary"],
      "--sp-brand-secondary": colors["brand-secondary"],
      "--sp-brand-accent": colors["brand-accent"],
      "--sp-brand-dark": colors["brand-dark"],
      "--sp-surface-main": colors["surface-main"],
      "--sp-text-primary": colors["text-primary"],
      "--sp-text-secondary": colors["text-secondary"],
      "--sp-text-muted": colors["text-muted"],

      // Auto-derived tokens using color-mix (simulated in CSS vars)
      // Note: We can't use JS color manipulation easily without a lib,
      // so we rely on CSS relative colors or color-mix if browser supports it.
      // Current project uses color-mix in CSS, so we can pass that through
      // OR we just define the base ones and let `theme-tokens.css` do the mixing?
      // WAIT: `theme-tokens.css` maps `--sp-*` to `--color-*`.
      // It does NOT define `--sp-surface-card` based on `--sp-brand-primary`.
      // The THEME CLASSES (.theme-arcane etc) define ALL --sp-* vars.
      // So checking `themes.css`: .theme-arcane defines --sp-surface-card: color-mix(...)
      // So we MUST define ALL --sp-* vars in the style attribute.

      // We will perform naive HEX -> RGBA/Darken logic here or just use CSS string value
      // simpler: inject `color-mix` strings directly!

      "--sp-surface-card": `color-mix(in oklch, ${colors["brand-primary"]} 5%, transparent)`,
      "--sp-surface-hover": `color-mix(in oklch, ${colors["brand-primary"]} 10%, transparent)`,
      "--sp-surface-raised": `color-mix(in oklch, ${colors["brand-primary"]} 8%, transparent)`,
      "--sp-surface-highlight": `color-mix(in oklch, ${colors["brand-primary"]} 20%, transparent)`,

      "--sp-surface-deck": "color-mix(in oklch, black 5%, transparent)", // Simple default
      "--sp-surface-dim": "color-mix(in oklch, black 20%, transparent)",
      "--sp-surface-inset": "color-mix(in oklch, black 40%, transparent)",
      "--sp-surface-overlay": "color-mix(in oklch, black 80%, transparent)",
      "--sp-surface-overlay-heavy":
        "color-mix(in oklch, black 90%, transparent)",
      "--sp-surface-scrim": "color-mix(in oklch, black 60%, transparent)",

      "--sp-border-subtle": `color-mix(in oklch, ${colors["brand-primary"]} 8%, transparent)`,
      "--sp-border-default": `color-mix(in oklch, ${colors["brand-primary"]} 15%, transparent)`,
      "--sp-border-strong": `color-mix(in oklch, ${colors["brand-primary"]} 25%, transparent)`,

      "--sp-text-dimmed": `color-mix(in oklch, ${colors["text-muted"]} 70%, transparent)`,
      "--sp-text-faint": `color-mix(in oklch, ${colors["text-muted"]} 50%, transparent)`,

      "--sp-scrollbar-track": "rgba(255, 255, 255, 0.03)",
      "--sp-scrollbar-thumb": "rgba(255, 255, 255, 0.15)",
      "--sp-scrollbar-thumb-hover": "rgba(255, 255, 255, 0.25)",

      // Gradient background override based on brand-dark + brand-primary
      background: `radial-gradient(circle at top center, color-mix(in srgb, ${colors["brand-primary"]}, transparent 85%), ${colors["brand-dark"]})`,
    };
  },
};
