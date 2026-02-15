/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import { useDeckBuilder } from "../domain/useDeckBuilder";
import { Unit, Spellcaster } from "@/types/api";
import { useDeckStore } from "@/store/index";
import { EntityCategory } from "@/types/enums";

// Mock dependencies
vi.mock("uuid", () => ({
  v4: () => "mock-uuid",
}));



describe("useDeckBuilder", () => {
    beforeEach(() => {
        useDeckStore.getState().clearDeck();
        useDeckStore.setState({ 
            savedDecks: [], 
            currentDeck: { ...useDeckStore.getState().currentDeck, id: undefined, name: "" } 
        });
    });

  const mockSpellcaster: Spellcaster = {
      entity_id: "sc1",
      spellcaster_id: "sc1",
      name: "Test Mage",
      category: EntityCategory.Spellcaster,
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
      category: EntityCategory.Creature,
      rank: "I",
      health: 10,
      tags: [],
      magic_school: "Wild",
      description: ""
  };

  it("should initialize with empty deck", () => {
    const { result } = renderHook(() => useDeckBuilder());
    expect(result.current.currentDeck.spellcaster).toBeNull();
    expect(result.current.isEmpty).toBe(true);
  });

  it("should set spellcaster", () => {
    const { result } = renderHook(() => useDeckBuilder());
    
    act(() => {
      result.current.setSpellcaster(mockSpellcaster);
    });

    expect(result.current.currentDeck.spellcaster).toEqual(mockSpellcaster);
    expect(result.current.currentDeck.name).toBe("Test Mage Deck"); // Default auto-name
  });

  it("should add unit to slot", () => {
    const { result } = renderHook(() => useDeckBuilder());

    act(() => {
      result.current.setSlot(0, mockUnit);
    });

    expect(result.current.currentDeck.slots[0].unit).toEqual(mockUnit);
    expect(result.current.isEmpty).toBe(false);
  });

  it("should clear slot", () => {
    const { result } = renderHook(() => useDeckBuilder());

    act(() => {
        result.current.setSlot(0, mockUnit);
    });
    expect(result.current.currentDeck.slots[0].unit).toEqual(mockUnit);

    act(() => {
        result.current.clearSlot(0);
    });
    expect(result.current.currentDeck.slots[0].unit).toBeNull();
  });

  it("should swap slots", () => {
      const { result } = renderHook(() => useDeckBuilder());
      const unit2: Unit = { ...mockUnit, entity_id: "u2", name: "Orc" };

      act(() => {
          result.current.setSlot(0, mockUnit);
          result.current.setSlot(1, unit2);
      });

      expect(result.current.currentDeck.slots[0].unit?.name).toBe("Goblin");
      expect(result.current.currentDeck.slots[1].unit?.name).toBe("Orc");

      act(() => {
          result.current.moveSlot(0, 1);
      });

      expect(result.current.currentDeck.slots[0].unit?.name).toBe("Orc");
      expect(result.current.currentDeck.slots[1].unit?.name).toBe("Goblin");
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

      expect(result.current.currentDeck.spellcaster).toBeNull();
      expect(result.current.currentDeck.slots[0].unit).toBeNull();
      expect(result.current.currentDeck.name).toBe("New Deck");
  });

  describe("Constraints & Rules", () => {
      it("should enforce Singleton Rule (move unit if added to new slot)", () => {
          const { result } = renderHook(() => useDeckBuilder());

          // Add Goblin to Slot 0
          act(() => {
              result.current.setSlot(0, mockUnit);
          });
          expect(result.current.currentDeck.slots[0].unit?.entity_id).toBe("u1");

          // Add SAME Goblin to Slot 1
          act(() => {
              result.current.setSlot(1, mockUnit);
          });

          // Slot 0 should be empty now (moved)
          expect(result.current.currentDeck.slots[0].unit).toBeNull();
          // Slot 1 should have Goblin
          expect(result.current.currentDeck.slots[1].unit?.entity_id).toBe("u1");
      });

      it("should prevent adding a Titan to a Unit slot", () => {
          const { result } = renderHook(() => useDeckBuilder());
          const titan: Unit = { ...mockUnit, category: EntityCategory.Titan, entity_id: "t1" } as unknown as Unit;

          act(() => {
              // Slot 0 is allowedTypes: ["UNIT"]
              result.current.setSlot(0, titan);
          });

          // Should be rejected
          expect(result.current.currentDeck.slots[0].unit).toBeNull();
      });

      it("should prevent adding a Unit to a Titan slot", () => {
          const { result } = renderHook(() => useDeckBuilder());

          act(() => {
              // Slot 4 is allowedTypes: ["TITAN"]
              result.current.setSlot(4, mockUnit);
          });

          // Should be rejected
          expect(result.current.currentDeck.slots[4].unit).toBeNull();
      });

      it("should prevent swapping invalid types (Titan <-> Unit)", () => {
          const { result } = renderHook(() => useDeckBuilder());
          const titan: Unit = { ...mockUnit, category: EntityCategory.Titan, entity_id: "t1" } as unknown as Unit;

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
          expect(result.current.currentDeck.slots[0].unit?.entity_id).toBe("u1");
          expect(result.current.currentDeck.slots[4].unit?.entity_id).toBe("t1");
      });
  });

  describe("Team Integration", () => {
      it("should import solo deck to team slot", () => {
          const { result } = renderHook(() => useDeckBuilder());
          
          // Setup: Switch to Team Mode and initialize team decks
          act(() => {
             useDeckStore.setState({ 
                 mode: "TEAM",
                 teamDecks: [
                     { id: "t1", name: "Empty 1", slots: [] as any, spellcaster: null },
                     { id: "t2", name: "Empty 2", slots: [] as any, spellcaster: null },
                     { id: "t3", name: "Empty 3", slots: [] as any, spellcaster: null }
                 ]
             });
          });

          const mockDeck = {
              id: "d1",
              name: "Imported Deck",
              spellcaster: mockSpellcaster,
              slots: [{ unit: mockUnit, unit_id: mockUnit.entity_id }]
          };

          act(() => {

              result.current.importSoloDeckToTeam(0, mockDeck, "new-uuid");
          });

          const teamDecks = useDeckStore.getState().teamDecks;
          expect(teamDecks[0].name).toBe("Imported Deck");
          expect(teamDecks[0].spellcaster?.entity_id).toBe("sc1");
          expect(teamDecks[0].slots[0].unit?.entity_id).toBe("u1");
      });
  });
});
