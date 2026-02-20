import { StateCreator } from "zustand";

import { INITIAL_DECK } from "@/services/api/persistence";
import { cloneDeck } from "@/services/utils/deck-utils";

import { DeckBuilderState, UIState } from "./types";

export const createUISlice: StateCreator<DeckBuilderState, [], [], UIState> = (
  set,
  get
) => ({
  mode: "SOLO",
  viewSummary: false,
  isReadOnly: false,

  viewingTeamData: null,
  viewingTeamId: null,
  viewingTeamName: null,
  viewingDeckData: null,
  viewingDeckId: null,

  pendingImport: null,
  isImporting: false,
  pendingSwapCard: null,

  setMode: (mode) =>
    set({
      mode,
      ...(mode === "SOLO"
        ? {
            activeSlot: null,
            currentDeck: { ...cloneDeck(INITIAL_DECK), name: "New Deck" },
          }
        : {}),
    }),
  setViewSummary: (viewSummary) => set({ viewSummary }),
  setIsReadOnly: (isReadOnly) => set({ isReadOnly }),

  setViewingTeam: (data, id = null, name = "") =>
    set({
      viewingTeamData: data,
      viewingTeamId: id,
      viewingTeamName: name,
      // When viewing a team, we likely want to be in TEAM mode and View Summary
      ...(data ? { mode: "TEAM", viewSummary: true, isReadOnly: true } : {}),
    }),

  setViewingDeck: (data, id = null) =>
    set({
      viewingDeckData: data,
      viewingDeckId: id,
      // When viewing a deck, we likely want to be in SOLO mode
      ...(data ? { mode: "SOLO", isReadOnly: true } : {}),
    }),

  setPendingImport: (pendingImport) => set({ pendingImport }),
  setIsImporting: (isImporting) => set({ isImporting }),

  resolvePendingImport: (strategy) => {
    const { pendingImport, setDeck, saveDeck, currentDeck } = get();

    if (!pendingImport) return;

    if (strategy === "SAVE_AND_OVERWRITE") {
      saveDeck(currentDeck.name || "Untitled Deck");
    }

    if (strategy === "OVERWRITE" || strategy === "SAVE_AND_OVERWRITE") {
      setDeck(pendingImport);
    }

    set({ pendingImport: null });
  },

  setPendingSwapCard: (card) => set({ pendingSwapCard: card }),

  activeDragItem: null,
  setActiveDragItem: (activeDragItem) => set({ activeDragItem }),

  // Inspector State
  inspectorOpen: false,
  inspectedCard: null,
  inspectorPosition: null,
  inspectorOptions: {},
  openInspector: (item, position, options) =>
    set({
      inspectorOpen: true,
      inspectedCard: item,
      inspectorPosition: position || null,
      inspectorOptions: options || {},
    }),
  closeInspector: () =>
    set({
      inspectorOpen: false,
      inspectedCard: null,
      inspectorPosition: null,
      inspectorOptions: {},
    }),

  // Hover Inspector State
  hoveredItem: null,
  setHoveredItem: (hoveredItem) => set({ hoveredItem }),
  isInspectorHovered: false,
  setIsInspectorHovered: (isInspectorHovered) => set({ isInspectorHovered }),

  // Command Center State
  commandCenterOpen: false,
  openCommandCenter: () => set({ commandCenterOpen: true }),
  closeCommandCenter: () =>
    set({ commandCenterOpen: false, isImporting: false }),

  // Browser Filters
  browserFilters: {
    schools: [],
    ranks: [],
    categories: [],
    classes: [],
  },

  setBrowserFilters: (browserFilters) => set({ browserFilters }),

  toggleBrowserFilter: (type, value) =>
    set((state) => {
      const current = state.browserFilters[type];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      return {
        browserFilters: {
          ...state.browserFilters,
          [type]: updated,
        },
      };
    }),

  clearBrowserFilters: () =>
    set({
      browserFilters: {
        schools: [],
        ranks: [],
        categories: [],
        classes: [],
      },
    }),

  // Welcome Modal State
  hasSeenDeckBuilderWelcome: false,
  setHasSeenDeckBuilderWelcome: (seen: boolean) =>
    set({ hasSeenDeckBuilderWelcome: seen }),
});
