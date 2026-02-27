import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CalculatorState {
  selectedIds: string[];
  ownedIds: string[];
  hideOwned: boolean;
  currentKnowledge: number;
  winRate: number;
  gamesPerDay: number;
  matchDuration: number;
}

interface CalculatorActions {
  toggleEntity: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearAll: () => void;
  /** cost: the knowledge_cost of the entity — auto-adjusts the bank */
  toggleOwned: (id: string, cost?: number) => void;
  clearOwned: () => void;
  initializeDefaults: (defaultIds: string[]) => void;
  setHideOwned: (hideOwned: boolean) => void;
  setCurrentKnowledge: (amount: number) => void;
  setWinRate: (rate: number) => void;
  setGamesPerDay: (games: number) => void;
  setMatchDuration: (minutes: number) => void;
}

type CalculatorStore = CalculatorState & CalculatorActions;

const initialState: CalculatorState = {
  selectedIds: [],
  ownedIds: [],
  hideOwned: false,
  currentKnowledge: 0,
  winRate: 0.5,
  gamesPerDay: 3,
  matchDuration: 20,
};

export const useCalculatorStore = create<CalculatorStore>()(
  persist(
    (set) => ({
      ...initialState,

      toggleEntity: (id: string) =>
        set((state) => {
          const setOfIds = new Set(state.selectedIds);
          if (setOfIds.has(id)) {
            setOfIds.delete(id);
          } else {
            setOfIds.add(id);
          }
          return { selectedIds: Array.from(setOfIds) };
        }),

      selectAll: (ids: string[]) =>
        set((state) => {
          const setOfIds = new Set(state.selectedIds);
          const ownedSet = new Set(state.ownedIds);
          ids.forEach((id) => {
            if (!ownedSet.has(id)) {
              setOfIds.add(id);
            }
          });
          return { selectedIds: Array.from(setOfIds) };
        }),

      clearAll: () => set({ selectedIds: [] }),

      toggleOwned: (id: string, cost = 0) =>
        set((state) => {
          const ownedSet = new Set(state.ownedIds);
          const selectedSet = new Set(state.selectedIds);
          let { currentKnowledge } = state;

          if (ownedSet.has(id)) {
            // Un-owning: restore the cost back to the bank
            ownedSet.delete(id);
            currentKnowledge = currentKnowledge + cost;
          } else {
            // Owning: deduct cost from bank (floor at 0)
            ownedSet.add(id);
            selectedSet.delete(id);
            currentKnowledge = Math.max(0, currentKnowledge - cost);
          }

          return {
            ownedIds: Array.from(ownedSet),
            selectedIds: Array.from(selectedSet),
            currentKnowledge,
          };
        }),

      clearOwned: () => set({ ownedIds: [] }),

      initializeDefaults: (defaultIds: string[]) =>
        set((state) => {
          const ownedSet = new Set(state.ownedIds);
          const selectedSet = new Set(state.selectedIds);
          let hasChanges = false;

          defaultIds.forEach((id) => {
            if (!ownedSet.has(id)) {
              ownedSet.add(id);
              hasChanges = true;
            }
            if (selectedSet.has(id)) {
              selectedSet.delete(id);
              hasChanges = true;
            }
          });

          if (!hasChanges) return state;

          return {
            ownedIds: Array.from(ownedSet),
            selectedIds: Array.from(selectedSet),
          };
        }),

      setHideOwned: (hideOwned: boolean) => set({ hideOwned }),

      setCurrentKnowledge: (currentKnowledge: number) =>
        set({ currentKnowledge }),

      setWinRate: (winRate: number) => set({ winRate }),

      setGamesPerDay: (gamesPerDay: number) => set({ gamesPerDay }),

      setMatchDuration: (matchDuration: number) =>
        set({ matchDuration: Math.max(1, matchDuration) }),
    }),
    {
      name: "spellcasters_calculator_v3",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
