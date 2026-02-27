import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CalculatorState {
  selectedIds: string[];
  ownedIds: string[];
  isBeta: boolean;
  hideOwned: boolean;
  currentKnowledge: number;
  winRate: number;
  gamesPerDay: number;
}

interface CalculatorActions {
  toggleEntity: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearAll: () => void;
  toggleOwned: (id: string) => void;
  clearOwned: () => void;
  initializeDefaults: (defaultIds: string[]) => void;
  setBeta: (isBeta: boolean) => void;
  setHideOwned: (hideOwned: boolean) => void;
  setCurrentKnowledge: (amount: number) => void;
  setWinRate: (rate: number) => void;
  setGamesPerDay: (games: number) => void;
}

type CalculatorStore = CalculatorState & CalculatorActions;

const initialState: CalculatorState = {
  selectedIds: [],
  ownedIds: [],
  isBeta: false,
  hideOwned: false,
  currentKnowledge: 0,
  winRate: 0.5,
  gamesPerDay: 5,
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

      toggleOwned: (id: string) =>
        set((state) => {
          const ownedSet = new Set(state.ownedIds);
          const selectedSet = new Set(state.selectedIds);

          if (ownedSet.has(id)) {
            ownedSet.delete(id);
          } else {
            ownedSet.add(id);
            // Mutual exclusion: if we marked it owned, it can't be selected
            selectedSet.delete(id);
          }

          return {
            ownedIds: Array.from(ownedSet),
            selectedIds: Array.from(selectedSet),
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

      setBeta: (isBeta: boolean) => set({ isBeta }),

      setHideOwned: (hideOwned: boolean) => set({ hideOwned }),

      setCurrentKnowledge: (currentKnowledge: number) =>
        set({ currentKnowledge }),

      setWinRate: (winRate: number) => set({ winRate }),

      setGamesPerDay: (gamesPerDay: number) => set({ gamesPerDay }),
    }),
    {
      name: "spellcasters_calculator_v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
