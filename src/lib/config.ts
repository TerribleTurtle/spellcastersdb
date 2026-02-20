/**
 * Global Configuration for SpellcastersDB
 * Centralizes environment variables and magic constants.
 */

export const CONFIG = {
  // API & Data
  API: {
    BASE_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://terribleturtle.github.io/spellcasters-community-api/api/v2",
    REVALIDATE_SECONDS: 60, // 1 minute
    TIMEOUT_MS: 10000,
  },

  // Feature Flags & Toggles
  FEATURES: {
    USE_LOCAL_ASSETS: process.env.NEXT_PUBLIC_USE_LOCAL_ASSETS === "true",
    PREFERRED_ASSET_FORMAT:
      process.env.NEXT_PUBLIC_PREFERRED_ASSET_FORMAT || "webp",
  },

  // Local Development Overrides
  DEV: {
    LOCAL_DATA_PATH: process.env.LOCAL_DATA_PATH || process.env.LOCAL_API_PATH,
  },

  // UI Constants
  UI: {
    MAX_DECK_SIZE: 5, // 4 Units + 1 Titan (though logic is 4 slots + 1 titan slot)
    TOAST_DURATION: 2000,
  },
} as const;
