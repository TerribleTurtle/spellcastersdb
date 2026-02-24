import { describe, expect, it } from "vitest";

import { Spellcaster, Unit } from "@/types/api";
import { Deck, DeckSlot, SlotType } from "@/types/deck";

import {
  selectCurrentDeck,
  selectHasChanges,
  selectIsEmpty,
  selectIsExistingDeck,
  selectIsExistingTeam,
  selectIsSaved,
  selectIsTeamSaved,
  selectSavedDecks,
} from "../selectors";
import { DeckBuilderState } from "../types";

const createMockSlots = (): [
  DeckSlot,
  DeckSlot,
  DeckSlot,
  DeckSlot,
  DeckSlot,
] => {
  return Array.from({ length: 5 }, (_, i) => ({
    index: i,
    unit: null,
    allowedTypes: i === 4 ? [SlotType.Titan] : [SlotType.Unit],
  })) as [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot];
};

// Mock Partial State
const createMockState = (
  overrides: Partial<DeckBuilderState> = {}
): DeckBuilderState => ({
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
    { spellcaster: null, slots: createMockSlots(), name: "" },
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
  saveTeamAsCopy: () => {},
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

  hasSeenDeckBuilderWelcome: false,
  setHasSeenDeckBuilderWelcome: () => {},

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

  isImporting: false,
  setIsImporting: () => {},

  deleteDecks: () => {},
  checkDeckNameAvailable: () => true,
  renameSavedDeck: () => {},
  importDeckToLibrary: () => {},
  clearSavedDecks: () => {},
  pendingSwapCard: null,
  setPendingSwapCard: () => {},

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
          id: undefined,
          name: "",
          spellcaster: { spellcaster_id: "1" } as unknown as Spellcaster,
          slots: Array(8).fill({ unit: null }),
        } as Deck,
      });
      expect(selectIsEmpty(state)).toBe(false);
    });

    it("should return false if a slot is filled", () => {
      const slots = createMockSlots();
      slots[0] = { ...slots[0], unit: { entity_id: "u1" } as unknown as Unit };

      const state = createMockState({
        currentDeck: {
          id: undefined,
          name: "",
          spellcaster: null,
          slots,
        } as Deck,
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
          id: undefined,
          name: "",
          spellcaster: null,
          slots,
        } as Deck,
      });
      expect(selectHasChanges(state)).toBe(true);
    });

    it("should return false if deck matches saved version", () => {
      const deck: Deck = {
        id: "1",
        name: "My Deck",
        spellcaster: null,
        slots: createMockSlots(),
      };
      const state = createMockState({
        currentDeck: { ...deck }, // copy
        savedDecks: [deck],
      });
      expect(selectHasChanges(state)).toBe(false);
    });

    it("should return true if deck differs from saved version", () => {
      const originalDeck: Deck = {
        id: "1",
        name: "My Deck",
        spellcaster: null,
        slots: createMockSlots(),
      };
      const modifiedDeck: Deck = { ...originalDeck, name: "Modified Name" };

      const state = createMockState({
        currentDeck: modifiedDeck,
        savedDecks: [originalDeck],
      });
      expect(selectHasChanges(state)).toBe(true);
    });
  });

  describe("selectCurrentDeck", () => {
    it("should return currentDeck", () => {
      const state = createMockState();

      expect(selectCurrentDeck(state)).toBe(state.currentDeck);
    });
  });

  describe("selectSavedDecks", () => {
    it("should return savedDecks", () => {
      const state = createMockState();

      expect(selectSavedDecks(state)).toBe(state.savedDecks);
    });
  });

  describe("selectIsSaved", () => {
    it("should return false if deck has no ID", () => {
      const state = createMockState();
      expect(selectIsSaved(state)).toBe(false);
    });

    it("should return false if ID is not in savedDecks", () => {
      const state = createMockState({
        currentDeck: {
          id: "1",
          name: "",
          spellcaster: null,
          slots: createMockSlots(),
        } as Deck,
        savedDecks: [],
      });
      expect(selectIsSaved(state)).toBe(false);
    });

    it("should return false if deck differs from saved version", () => {
      const originalDeck: Deck = {
        id: "1",
        name: "My Deck",
        spellcaster: null,
        slots: createMockSlots(),
      };
      const modifiedDeck: Deck = { ...originalDeck, name: "Diff" };
      const state = createMockState({
        currentDeck: modifiedDeck,
        savedDecks: [originalDeck],
      });
      expect(selectIsSaved(state)).toBe(false);
    });

    it("should return true if deck exactly matches saved version", () => {
      const originalDeck: Deck = {
        id: "1",
        name: "My Deck",
        spellcaster: null,
        slots: createMockSlots(),
      };
      const state = createMockState({
        currentDeck: { ...originalDeck },
        savedDecks: [originalDeck],
      });
      expect(selectIsSaved(state)).toBe(true);
    });
  });

  describe("selectIsExistingDeck", () => {
    it("should return false if deck has no ID", () => {
      expect(selectIsExistingDeck(createMockState())).toBe(false);
    });

    it("should return false if ID not in savedDecks", () => {
      const state = createMockState({
        currentDeck: {
          id: "1",
          name: "",
          spellcaster: null,
          slots: createMockSlots(),
        } as Deck,
        savedDecks: [],
      });
      expect(selectIsExistingDeck(state)).toBe(false);
    });

    it("should return true if ID is in savedDecks (ignoring changes)", () => {
      const originalDeck: Deck = {
        id: "1",
        name: "My Deck",
        spellcaster: null,
        slots: createMockSlots(),
      };
      const modifiedDeck: Deck = { ...originalDeck, name: "Diff" };
      const state = createMockState({
        currentDeck: modifiedDeck,
        savedDecks: [originalDeck],
      });
      expect(selectIsExistingDeck(state)).toBe(true);
    });
  });

  describe("selectIsExistingTeam", () => {
    it("should return false if no activeTeamId", () => {
      expect(selectIsExistingTeam(createMockState())).toBe(false);
    });

    it("should return false if team not in savedTeams", () => {
      const state = createMockState({ activeTeamId: "t1", savedTeams: [] });
      expect(selectIsExistingTeam(state)).toBe(false);
    });

    it("should return true if team is in savedTeams", () => {
      const state = createMockState({
        activeTeamId: "t1",
        savedTeams: [
          {
            id: "t1",
            name: "T",
            decks: [] as unknown as [Deck, Deck, Deck],
          },
        ],
      });
      expect(selectIsExistingTeam(state)).toBe(true);
    });
  });

  describe("selectIsTeamSaved", () => {
    const mockTeamDecks = [
      { id: "1", name: "", spellcaster: null, slots: createMockSlots() },
      { id: "2", name: "", spellcaster: null, slots: createMockSlots() },
      { id: "3", name: "", spellcaster: null, slots: createMockSlots() },
    ] as unknown as [Deck, Deck, Deck];

    it("should return false if no activeTeamId", () => {
      expect(selectIsTeamSaved(createMockState())).toBe(false);
    });

    it("should return false if activeTeamId not found in savedTeams", () => {
      const state = createMockState({ activeTeamId: "t1", savedTeams: [] });
      expect(selectIsTeamSaved(state)).toBe(false);
    });

    it("should return false if team name differs", () => {
      const state = createMockState({
        activeTeamId: "t1",
        teamName: "Diff Name",
        teamDecks: mockTeamDecks,
        savedTeams: [{ id: "t1", name: "T", decks: mockTeamDecks }],
      });
      expect(selectIsTeamSaved(state)).toBe(false);
    });

    it("should return false if deck length differs", () => {
      const state = createMockState({
        activeTeamId: "t1",
        teamName: "T",
        teamDecks: mockTeamDecks,
        // @ts-expect-error Mocking mismatched lengths
        savedTeams: [{ id: "t1", name: "T", decks: [], createdAt: 0 }],
      });
      expect(selectIsTeamSaved(state)).toBe(false);
    });

    it("should return false if any deck differs", () => {
      const modifiedDecks = [...mockTeamDecks] as [Deck, Deck, Deck];
      modifiedDecks[0] = { ...modifiedDecks[0], name: "Diff" };
      const state = createMockState({
        activeTeamId: "t1",
        teamName: "T",
        teamDecks: modifiedDecks,
        savedTeams: [{ id: "t1", name: "T", decks: mockTeamDecks }],
      });
      expect(selectIsTeamSaved(state)).toBe(false);
    });

    it("should return true if exactly matches", () => {
      const state = createMockState({
        activeTeamId: "t1",
        teamName: "T",
        teamDecks: [...mockTeamDecks] as [Deck, Deck, Deck],
        savedTeams: [
          {
            id: "t1",
            name: "T",
            decks: [...mockTeamDecks] as [Deck, Deck, Deck],
          },
        ],
      });
      expect(selectIsTeamSaved(state)).toBe(true);
    });
  });
});
