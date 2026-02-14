import { describe, it, expect } from "vitest";
import { selectIsEmpty, selectHasChanges } from "../selectors";
import { DeckBuilderState } from "../types";
import { Deck, DeckSlot, SlotType } from "@/types/deck";
import { Spellcaster, Unit } from "@/types/api";

const createMockSlots = (): [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot] => {
    return Array.from({ length: 5 }, (_, i) => ({
        index: i,
        unit: null,
        allowedTypes: i === 4 ? [SlotType.Titan] : [SlotType.Unit]
    })) as [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
};

// Mock Partial State
const createMockState = (overrides: Partial<DeckBuilderState> = {}): DeckBuilderState => ({
  currentDeck: {
    id: undefined,
    name: "",
    spellcaster: null,
    slots: createMockSlots(), 
  } as Deck,
  savedDecks: [],
  teamName: "",
  activeTeamId: null,
  activeSlot: null,
  teamDecks: [
      { spellcaster: null, slots: createMockSlots(), name: "" },
      { spellcaster: null, slots: createMockSlots(), name: "" },
      { spellcaster: null, slots: createMockSlots(), name: "" }
  ] as unknown as [Deck, Deck, Deck],
  savedTeams: [],
  // Dummy implementations for actions
  setDeck: () => {},
  setSpellcaster: () => {},
  removeSpellcaster: () => {},
  setSlot: () => {},
  clearSlot: () => {},
  swapSlots: () => {},
  quickAdd: () => null,
  clearDeck: () => {},
  setDeckName: () => {},
  setTeamName: () => {},
  setActiveTeamId: () => {},
  setTeamDecks: () => {},
  setActiveSlot: () => {},
  saveTeam: () => {},
  loadTeam: () => {},
  deleteTeam: () => {},
  deleteTeams: () => {}, // New action mock
  duplicateTeam: () => {},
  upsertSavedTeam: () => {},
  renameSavedTeam: () => {},
  importSoloDeckToTeam: () => {},
  loadTeamFromData: () => {},
  exportTeamSlotToSolo: () => {},
  clearTeam: () => {},
  saveDeck: () => {},
  saveAsCopy: () => {},
  loadDeck: () => {},
  deleteDeck: () => {},
  duplicateDeck: () => {},
  importDecks: () => {},

  importTeams: () => {},
  moveCardBetweenDecks: () => null,
  moveSpellcasterBetweenDecks: () => {},
  checkActiveTeamDeletion: () => {},
  setSavedDecks: () => {},
  clearSavedTeams: () => {},
  // New action mocks
  setTeamSlot: () => {},
  clearTeamSlot: () => {},
  setTeamSpellcaster: () => {},
  removeTeamSpellcaster: () => {},
  swapTeamSlots: () => {},
  quickAddToTeam: () => null,
  mode: "SOLO",
  viewSummary: false,
  isReadOnly: false,
  viewingTeamData: null,
  viewingTeamId: null,
  viewingTeamName: null,
  viewingDeckData: null,
  viewingDeckId: null,
  pendingImport: null,
  setMode: () => {},
  setViewSummary: () => {},
  setIsReadOnly: () => {},
  setViewingTeam: () => {},
  setViewingDeck: () => {},
  setPendingImport: () => {},
  resolvePendingImport: () => {},
  activeDragItem: null,
  setActiveDragItem: () => {},
  browserFilters: { schools: [], ranks: [], categories: [], classes: [] },
  setBrowserFilters: () => {},
  toggleBrowserFilter: () => {},
  clearBrowserFilters: () => {},
  inspectorOpen: false,
  inspectedCard: null,
  inspectorPosition: null, // Fixed
  openInspector: () => {},
  closeInspector: () => {},
  hoveredItem: null,
  setHoveredItem: () => {},
  isInspectorHovered: false,
  setIsInspectorHovered: () => {},
  commandCenterOpen: false,
  openCommandCenter: () => {},
  closeCommandCenter: () => {},

  deleteDecks: () => {}, // Missing mock
  checkDeckNameAvailable: () => true, // Mock implementation
  renameSavedDeck: () => {},
  importDeckToLibrary: () => {},
  clearSavedDecks: () => {}, // Missing mock
  isImporting: false,
  setIsImporting: () => {},

  ...overrides,
});

describe("DeckStore Selectors", () => {
  describe("selectIsEmpty", () => {
    it("should return true for a fresh deck", () => {
      const state = createMockState();
      expect(selectIsEmpty(state)).toBe(true);
    });

    it("should return false if spellcaster is selected", () => {
      const state = createMockState({
        currentDeck: {
           id: undefined, name: "",
           spellcaster: { spellcaster_id: "1" } as unknown as Spellcaster,
           slots: Array(8).fill({ unit: null })
        } as Deck
      });
      expect(selectIsEmpty(state)).toBe(false);
    });

    it("should return false if a slot is filled", () => {
         const slots = createMockSlots();
         slots[0] = { ...slots[0], unit: { entity_id: "u1" } as unknown as Unit };
         
         const state = createMockState({
            currentDeck: {
               id: undefined, name: "",
               spellcaster: null,
               slots
            } as Deck
          });
          expect(selectIsEmpty(state)).toBe(false);
    });
  });

  describe("selectHasChanges", () => {
      it("should return false if deck is empty and new (no ID)", () => {
          const state = createMockState();
          // Logic: if no ID, return !isEmpty. isEmpty is true, so returns false.
          expect(selectHasChanges(state)).toBe(false);
      });

      it("should return true if deck has content and is new (no ID)", () => {
        const slots = createMockSlots();
        slots[0] = { ...slots[0], unit: { entity_id: "u1" } as unknown as Unit };
        const state = createMockState({
            currentDeck: {
               id: undefined, name: "",
               spellcaster: null,
               slots
            } as Deck
          });
          expect(selectHasChanges(state)).toBe(true);
      });

      it("should return false if deck matches saved version", () => {
           const deck: Deck = { id: "1", name: "My Deck", spellcaster: null, slots: createMockSlots() };
           const state = createMockState({
               currentDeck: { ...deck }, // copy
               savedDecks: [deck]
           });
           expect(selectHasChanges(state)).toBe(false);
      });

      it("should return true if deck differs from saved version", () => {
        const originalDeck: Deck = { id: "1", name: "My Deck", spellcaster: null, slots: createMockSlots() };
        const modifiedDeck: Deck = { ...originalDeck, name: "Modified Name" };
        
        const state = createMockState({
            currentDeck: modifiedDeck,
            savedDecks: [originalDeck]
        });
        expect(selectHasChanges(state)).toBe(true);
   });
  });
});
