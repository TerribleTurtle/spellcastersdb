import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";

import { createPersistenceSlice } from "./createPersistenceSlice";
import { createSoloSlice } from "./createSoloSlice";
import { createTeamSlice } from "./createTeamSlice";
import { createUISlice } from "./createUISlice";
import { DeckBuilderState } from "./types";

// Create the unified store
/**
 * Global State Store (Zustand).
 * composed of Solo, Team, Persistence, and UI slices.
 *
 * @see {@link docs/STATE_MANAGEMENT.md} for architecture details.
 */
export const useDeckStore = create<DeckBuilderState>()(
  devtools(
    persist(
      subscribeWithSelector((...a) => ({
        ...createSoloSlice(...a),
        ...createTeamSlice(...a),
        ...createPersistenceSlice(...a),
        ...createUISlice(...a),
      })),
      {
        name: "spellcasters-store-v2",
        partialize: (state) => ({
          // User Data (must persist)
          savedDecks: state.savedDecks,
          savedTeams: state.savedTeams,
          currentDeck: state.currentDeck,
          // Team Editor State (must persist for sync/hydration)
          teamName: state.teamName,
          teamDecks: state.teamDecks,
          activeTeamId: state.activeTeamId,
          activeSlot: state.activeSlot,
          // Session State (read by useAppHydration)
          mode: state.mode,
          viewSummary: state.viewSummary,
          hasSeenDeckBuilderWelcome: state.hasSeenDeckBuilderWelcome,
        }),
      }
    )
  )
);

export type { DeckBuilderState };

// --- Subscriptions ---
// Moved to useDeckSync.ts check
