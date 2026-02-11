import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeckStorage, INITIAL_DECK, STORAGE_KEY_CURRENT, STORAGE_KEY_SAVED } from "./useDeckStorage";
import { Unit, Spellcaster } from "@/types/api";

// --- Mocks ---

const mockSpellcaster: Spellcaster = {
    entity_id: "sc1",
    spellcaster_id: "sc1",
    name: "Test Mage",
    category: "Spellcaster",
    class: "Enchanter",
    tags: [],
    abilities: { passive: [], primary: { name: "", description: "" }, defense: { name: "", description: "" }, ultimate: { name: "", description: "" } },
    health: 100,
    movement_speed: 30
};

const mockUnit: Unit = {
    entity_id: "u1",
    name: "Goblin",
    category: "Creature",
    rank: "I",
    health: 10,
    tags: [],
    magic_school: "Wild",
    description: ""
};

// Mock LocalStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useDeckStorage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("should initialize with default deck if storage is empty", () => {
    const { result } = renderHook(() => {
        const [deck, setDeck] =  React.useState(INITIAL_DECK);
        return useDeckStorage(deck, setDeck, [], []);
    });

    expect(result.current.isInitialized).toBe(true);
    // Should verify setDeck wasn't called with anything weird, 
    // but since we passed INITIAL_DECK state, it stays that way.
  });

  it("should hydrate from localStorage on mount", () => {
      // Setup Storage
      const storedDeck = {
          id: "saved-id",
          name: "Saved Deck",
          spellcasterId: "sc1",
          slotIds: ["u1", null, null, null, null]
      };
      localStorageMock.setItem(STORAGE_KEY_CURRENT, JSON.stringify(storedDeck));

      let deckState = INITIAL_DECK;
      const setDeck = vi.fn((newVal) => {
          if (typeof newVal === 'function') {
              deckState = newVal(deckState);
          } else {
              deckState = newVal;
          }
      });

      renderHook(() => useDeckStorage(deckState, setDeck, [mockUnit], [mockSpellcaster]));

      expect(setDeck).toHaveBeenCalled();
      expect(deckState.id).toBe("saved-id");
      expect(deckState.spellcaster?.spellcaster_id).toBe("sc1");
      expect(deckState.slots[0].unit?.entity_id).toBe("u1");
  });

  it("should persist deck changes to localStorage", () => {
      let deckState = { ...INITIAL_DECK, name: "My New Deck" };
      const setDeck = vi.fn();

      const { rerender } = renderHook(
          ({ deck }) => useDeckStorage(deck, setDeck, [], []),
          { initialProps: { deck: deckState } }
      );

      // Verify save occurred
      const saved = JSON.parse(localStorageMock.getItem(STORAGE_KEY_CURRENT)!);
      expect(saved.name).toBe("My New Deck");

      // Update Deck
      deckState = { ...deckState, name: "Updated Name" };
      rerender({ deck: deckState });

      const updated = JSON.parse(localStorageMock.getItem(STORAGE_KEY_CURRENT)!);
      expect(updated.name).toBe("Updated Name");
  });

  it("should save to savedDecks list", () => {
      const { result } = renderHook(() => {
          const [deck, setDeck] = React.useState(INITIAL_DECK);
          return useDeckStorage(deck, setDeck, [], []);
      });

      // Manually trigger save to list
      const deckToSave = { ...INITIAL_DECK, id: "d1", name: "Deck 1" };
      
      act(() => {
          result.current.setSavedDecks([deckToSave]);
      });

      const savedList = JSON.parse(localStorageMock.getItem(STORAGE_KEY_SAVED)!);
      expect(savedList).toHaveLength(1);
      expect(savedList[0].id).toBe("d1");
  });

  it("should sync from external events (Cross-Tab Sync)", () => {
      const { result } = renderHook(() => {
          const [deck, setDeck] = React.useState(INITIAL_DECK);
          return useDeckStorage(deck, setDeck, [], []);
      });

      // Simulate external write to localStorage
      const newSavedList = [{ id: "d2", name: "External Deck", spellcasterId: null, slotIds: [null,null,null,null,null] }];
      localStorageMock.setItem(STORAGE_KEY_SAVED, JSON.stringify(newSavedList));

      // Dispatch Storage Event
      act(() => {
          window.dispatchEvent(new StorageEvent("storage", {
              key: STORAGE_KEY_SAVED,
              newValue: JSON.stringify(newSavedList)
          }));
      });

      expect(result.current.savedDecks).toHaveLength(1);
      expect(result.current.savedDecks[0].name).toBe("External Deck");
  });
});

import React from "react";
