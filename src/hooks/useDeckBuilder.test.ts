import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeckBuilder } from "./useDeckBuilder";
import { Unit, Spellcaster } from "@/types/api";

// Mock dependencies
vi.mock("uuid", () => ({
  v4: () => "mock-uuid",
}));

// Mock storage hook to avoid localStorage interactions during these tests
vi.mock("./deck-builder/useDeckStorage", () => ({
  useDeckStorage: () => ({
    savedDecks: [],
    setSavedDecks: vi.fn(),
    isInitialized: true,
  }),
  INITIAL_DECK: {
    spellcaster: null,
    slots: [
      { index: 0, unit: null, allowedTypes: ["UNIT"] },
      { index: 1, unit: null, allowedTypes: ["UNIT"] },
      { index: 2, unit: null, allowedTypes: ["UNIT"] },
      { index: 3, unit: null, allowedTypes: ["UNIT"] },
      { index: 4, unit: null, allowedTypes: ["TITAN"] },
    ],
  },
  STORAGE_KEY_CURRENT: "test-current",
  STORAGE_KEY_SAVED: "test-saved",
}));

// Mock validation to keep this unit test focused on state changes
vi.mock("./deck-builder/useDeckValidation", () => ({
  useDeckValidation: () => ({
    isValid: true,
    errors: [],
    stats: {},
    reminder: "",
  }),
}));

describe("useDeckBuilder", () => {
  const mockSpellcaster: Spellcaster = {
      entity_id: "sc1",
      spellcaster_id: "sc1",
      name: "Test Mage",
      category: "Spellcaster",
      class: "Enchanter",
      tags: [],
      abilities: {
          passive: [],
          primary: { name: "P", description: "" },
          defense: { name: "D", description: "" },
          ultimate: { name: "U", description: "" }
      },
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

  it("should initialize with empty deck", () => {
    const { result } = renderHook(() => useDeckBuilder());
    expect(result.current.deck.spellcaster).toBeNull();
    expect(result.current.isEmpty).toBe(true);
  });

  it("should set spellcaster", () => {
    const { result } = renderHook(() => useDeckBuilder());
    
    act(() => {
      result.current.setSpellcaster(mockSpellcaster);
    });

    expect(result.current.deck.spellcaster).toEqual(mockSpellcaster);
    expect(result.current.deck.name).toBe("Test Mage Deck"); // Default auto-name
  });

  it("should add unit to slot", () => {
    const { result } = renderHook(() => useDeckBuilder());

    act(() => {
      result.current.setSlot(0, mockUnit);
    });

    expect(result.current.deck.slots[0].unit).toEqual(mockUnit);
    expect(result.current.isEmpty).toBe(false);
  });

  it("should clear slot", () => {
    const { result } = renderHook(() => useDeckBuilder());

    act(() => {
        result.current.setSlot(0, mockUnit);
    });
    expect(result.current.deck.slots[0].unit).toEqual(mockUnit);

    act(() => {
        result.current.clearSlot(0);
    });
    expect(result.current.deck.slots[0].unit).toBeNull();
  });

  it("should swap slots", () => {
      const { result } = renderHook(() => useDeckBuilder());
      const unit2: Unit = { ...mockUnit, entity_id: "u2", name: "Orc" };

      act(() => {
          result.current.setSlot(0, mockUnit);
          result.current.setSlot(1, unit2);
      });

      expect(result.current.deck.slots[0].unit?.name).toBe("Goblin");
      expect(result.current.deck.slots[1].unit?.name).toBe("Orc");

      act(() => {
          result.current.moveSlot(0, 1);
      });

      expect(result.current.deck.slots[0].unit?.name).toBe("Orc");
      expect(result.current.deck.slots[1].unit?.name).toBe("Goblin");
  });

  it("should clear entire deck", () => {
      const { result } = renderHook(() => useDeckBuilder());

      act(() => {
          result.current.setSpellcaster(mockSpellcaster);
          result.current.setSlot(0, mockUnit);
      });

      expect(result.current.isEmpty).toBe(false);

      act(() => {
          result.current.clearDeck();
      });

      expect(result.current.deck.spellcaster).toBeNull();
      expect(result.current.deck.slots[0].unit).toBeNull();
      expect(result.current.deck.name).toBe("");
  });

  describe("Constraints & Rules", () => {
      it("should enforce Singleton Rule (move unit if added to new slot)", () => {
          const { result } = renderHook(() => useDeckBuilder());

          // Add Goblin to Slot 0
          act(() => {
              result.current.setSlot(0, mockUnit);
          });
          expect(result.current.deck.slots[0].unit?.entity_id).toBe("u1");

          // Add SAME Goblin to Slot 1
          act(() => {
              result.current.setSlot(1, mockUnit);
          });

          // Slot 0 should be empty now (moved)
          expect(result.current.deck.slots[0].unit).toBeNull();
          // Slot 1 should have Goblin
          expect(result.current.deck.slots[1].unit?.entity_id).toBe("u1");
      });

      it("should prevent adding a Titan to a Unit slot", () => {
          const { result } = renderHook(() => useDeckBuilder());
          const titan: Unit = { ...mockUnit, category: "Titan", entity_id: "t1" } as unknown as Unit;

          act(() => {
              // Slot 0 is allowedTypes: ["UNIT"]
              result.current.setSlot(0, titan);
          });

          // Should be rejected
          expect(result.current.deck.slots[0].unit).toBeNull();
      });

      it("should prevent adding a Unit to a Titan slot", () => {
          const { result } = renderHook(() => useDeckBuilder());

          act(() => {
              // Slot 4 is allowedTypes: ["TITAN"]
              result.current.setSlot(4, mockUnit);
          });

          // Should be rejected
          expect(result.current.deck.slots[4].unit).toBeNull();
      });

      it("should prevent swapping invalid types (Titan <-> Unit)", () => {
          const { result } = renderHook(() => useDeckBuilder());
          const titan: Unit = { ...mockUnit, category: "Titan", entity_id: "t1" } as unknown as Unit;

          act(() => {
              // Setup correct state first
              result.current.setSlot(0, mockUnit); // Slot 0: Unit
              result.current.setSlot(4, titan);    // Slot 4: Titan
          });

          // Try to swap Slot 0 (Unit) and Slot 4 (Titan)
          // This would put Titan in Slot 0 (Invalid) and Unit in Slot 4 (Invalid)
          act(() => {
              result.current.moveSlot(0, 4);
          });

          // Should remain unchanged
          expect(result.current.deck.slots[0].unit?.entity_id).toBe("u1");
          expect(result.current.deck.slots[4].unit?.entity_id).toBe("t1");
      });
  });
});
