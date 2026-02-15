import { create } from 'zustand';
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware';

import { DeckBuilderState } from './types';
import { createSoloSlice } from './createSoloSlice';
import { createTeamSlice } from './createTeamSlice';
import { createPersistenceSlice } from './createPersistenceSlice';
import { createUISlice } from './createUISlice';

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
        name: 'spellcasters-store-v2',
      }
    )
  )
);

export type { DeckBuilderState };

// --- Subscriptions ---
// Moved to useDeckSync.ts check

