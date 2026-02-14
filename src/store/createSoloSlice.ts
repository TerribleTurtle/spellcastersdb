import { StateCreator } from "zustand";
import { DeckBuilderState, SoloState } from "./types";
import { Unit, Spell, Titan, Spellcaster } from "@/types/api";
import { INITIAL_DECK } from "@/services/api/persistence";
import { DeckRules } from "@/services/rules/deck-rules";
import { cloneDeck } from "@/services/utils/deck-utils";

export const createSoloSlice: StateCreator<
  DeckBuilderState,
  [], 
  [], 
  SoloState
> = (set) => ({
  currentDeck: { ...INITIAL_DECK, name: "New Deck" },

  setDeck: (deck) => set({ currentDeck: deck }),

  setSpellcaster: (spellcaster) => set((state) => ({
      currentDeck: DeckRules.setSpellcaster(state.currentDeck, spellcaster)
  })),

  removeSpellcaster: () => set((state) => ({
      currentDeck: DeckRules.removeSpellcaster(state.currentDeck)
  })),

  setSlot: (index, unit) => set((state) => {
    const result = DeckRules.setSlot(state.currentDeck, index, unit);
    if (result.success && result.data) {
      return { currentDeck: result.data };
    }
    return {}; 
  }),

  clearSlot: (index) => set((state) => {
    const newDeck = cloneDeck(state.currentDeck);
    newDeck.slots[index].unit = null;
    return { currentDeck: newDeck };
  }),

  swapSlots: (indexA, indexB) => set((state) => {
       const result = DeckRules.swapSlots(state.currentDeck, indexA, indexB);
       if (result.success && result.data) {
           return { currentDeck: result.data };
       }
       return {};
  }),

  quickAdd: (item) => {
      if (item.category === "Consumable" || item.category === "Upgrade") {
          return "Cannot add this item to deck.";
      }

      let error: string | null = null;
      set((state) => {
          // We've already filtered out Consumable/Upgrade so this cast is safe
          const result = DeckRules.quickAdd(state.currentDeck, item as Unit | Spell | Titan | Spellcaster);
          if (result.success && result.data) {
              return { currentDeck: result.data };
          }
          if (result.error) {
              error = result.error;
          }
          return {};
      });
      return error;
  },

  clearDeck: () => set({
      currentDeck: { ...INITIAL_DECK, id: undefined, name: "New Deck" }
  }),

  setDeckName: (name) => set((state) => ({
      currentDeck: { ...state.currentDeck, name }
  })),
});
