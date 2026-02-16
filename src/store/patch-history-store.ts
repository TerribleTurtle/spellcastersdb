/**
 * Zustand Store for Patch History / Balance Data.
 * 
 * Fetches balance_index.json once and provides O(1) lookup by entity_id.
 * Separate from the main deck store because patch data is ephemeral, 
 * not persisted, and unrelated to deck state.
 *
 * @see {@link docs/api_info.md} for endpoint details.
 * @see {@link services/api/patch-history.ts} for the fetch layer.
 */

import { create } from "zustand";
import type { PatchType, BalanceIndex } from "@/types/patch-history";
import { isBrowserPatchType } from "@/lib/patch-utils";
import { fetchBalanceIndex } from "@/services/api/patch-history";

// ============================================================================
// Store Interface
// ============================================================================

interface PatchHistoryState {
  /** Whether the balance index has been fetched (or attempted). */
  isLoaded: boolean;
  /** Whether a fetch is currently in progress. */
  isLoading: boolean;
  /** The balance_index.json patch version string. */
  patchVersion: string;
  /** Map of entity_id → PatchType from the latest balance patch. */
  entities: Record<string, PatchType>;
  /** Error message if fetch failed, otherwise null. */
  error: string | null;

  // Actions
  /** Fetch balance index data. Idempotent — skips if already loaded. */
  loadBalanceIndex: () => Promise<void>;
  /** Lookup patch type for a specific entity. Returns null if not found. */
  getPatchType: (entityId: string) => PatchType | null;
  /** Lookup patch type, returning null if it's not a browser-visible type (buff/nerf/rework). */
  getBrowserPatchType: (entityId: string) => PatchType | null;
}

// ============================================================================
// Store
// ============================================================================

export const usePatchHistoryStore = create<PatchHistoryState>()((set, get) => ({
  isLoaded: false,
  isLoading: false,
  patchVersion: "",
  entities: {},
  error: null,

  loadBalanceIndex: async () => {
    const state = get();
    // Skip if already loaded or currently loading
    if (state.isLoaded || state.isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const data: BalanceIndex = await fetchBalanceIndex();
      set({
        isLoaded: true,
        isLoading: false,
        patchVersion: data.patch_version,
        entities: data.entities,
      });
    } catch (error) {
      set({
        isLoaded: true, // Mark as loaded even on error to prevent retry loops
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  getPatchType: (entityId: string): PatchType | null => {
    return get().entities[entityId] ?? null;
  },

  getBrowserPatchType: (entityId: string): PatchType | null => {
    const type = get().entities[entityId] ?? null;
    if (!type) return null;
    return isBrowserPatchType(type) ? type : null;
  },
}));
