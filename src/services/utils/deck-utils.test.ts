import { describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { Spellcaster, Unit } from "@/types/api";
import { Deck } from "@/types/deck";

import {
  cloneDeck,
  cloneSlots,
  findAutoFillSlot,
  isDeckEmpty,
} from "./deck-utils";

describe("deck-utils", () => {
  describe("isDeckEmpty", () => {
    it("should return true for a fresh initial deck", () => {
      expect(isDeckEmpty(INITIAL_DECK)).toBe(true);
    });

    it("should return false if spellcaster is present", () => {
      const deck: Deck = {
        ...INITIAL_DECK,
        spellcaster: { entity_id: "sc1" } as unknown as Spellcaster,
      };
      expect(isDeckEmpty(deck)).toBe(false);
    });

    it("should return false if a unit is in a slot", () => {
      const deck: Deck = { ...INITIAL_DECK, slots: [...INITIAL_DECK.slots] };
      deck.slots[0] = { ...deck.slots[0], unit: { entity_id: "u1" } as Unit };
      expect(isDeckEmpty(deck)).toBe(false);
    });

    it("should return false if only titan is present in slot 4 (no units 0-3)", () => {
      const deck = cloneDeck(INITIAL_DECK);
      deck.slots[4].unit = {
        entity_id: "t1",
        category: "Titan",
      } as unknown as Unit;
      expect(isDeckEmpty(deck)).toBe(false);
    });
  });

  describe("cloneSlots", () => {
    it("should shallow clone slots array but maintain unit references", () => {
      const originalSlots = [...INITIAL_DECK.slots];
      originalSlots[0] = {
        ...originalSlots[0],
        unit: { entity_id: "u1", name: "Original" } as Unit,
      };

      const cloned = cloneSlots(originalSlots);

      expect(cloned).toEqual(originalSlots); // values match
      expect(cloned).not.toBe(originalSlots); // array reference differs
      expect(cloned[0]).not.toBe(originalSlots[0]); // slot object reference differs
      expect(cloned[0].unit).toBe(originalSlots[0].unit); // unit reference is maintained (shallow copy of slot)
    });
  });

  describe("cloneDeck", () => {
    it("should deep clone entire deck using structuredClone", () => {
      const original: Deck = {
        ...INITIAL_DECK,
        spellcaster: { entity_id: "sc1", name: "Caster" } as Spellcaster,
        slots: [...INITIAL_DECK.slots],
      };
      original.slots[1] = {
        ...original.slots[1],
        unit: { entity_id: "u2" } as Unit,
      };

      const cloned = cloneDeck(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.spellcaster).not.toBe(original.spellcaster);
      expect(cloned.slots).not.toBe(original.slots);

      // structuredClone preserves the exact ID, ID rotation is handled by context importers
      expect(cloned.id).toBe(original.id);
    });
  });

  describe("findAutoFillSlot", () => {
    it("should prefer slot index 4 for Titan category units if empty", () => {
      const deck = cloneDeck(INITIAL_DECK);
      const titan = { category: "Titan" } as unknown as Unit;
      expect(findAutoFillSlot(deck, titan)).toBe(4);
    });

    it("should return -1 for Spellcasters because they don't go in slots", () => {
      const deck = cloneDeck(INITIAL_DECK);
      const spellcaster = { category: "Spellcaster" } as unknown as Unit;
      expect(findAutoFillSlot(deck, spellcaster)).toBe(-1);
    });

    it("should return the first available empty slot for normal units", () => {
      const deck = cloneDeck(INITIAL_DECK);
      // Fill slot 0
      deck.slots[0].unit = { entity_id: "u1" } as Unit;

      const unit = { rank: "I" } as Unit;
      expect(findAutoFillSlot(deck, unit)).toBe(1); // Should find next empty
    });

    it("should return -1 when all unit slots (0-3) are full but titan slot (4) is open, for a non-Titan item", () => {
      const deck = cloneDeck(INITIAL_DECK);
      for (let i = 0; i < 4; i++) {
        deck.slots[i].unit = { entity_id: `u${i}` } as Unit;
      }
      // Slot 4 (Titan) is still empty
      const nonTitanUnit = {
        category: "Creature",
        rank: "I",
      } as unknown as Unit;
      expect(findAutoFillSlot(deck, nonTitanUnit)).toBe(-1);
    });

    it("should return -1 if all slots are full", () => {
      const deck = cloneDeck(INITIAL_DECK);
      // Fill all 4 slots
      for (let i = 0; i < 4; i++) {
        deck.slots[i].unit = { entity_id: `u${i}` } as Unit;
      }

      const unit = { rank: "I" } as Unit;
      expect(findAutoFillSlot(deck, unit)).toBe(-1);
    });
  });
});
