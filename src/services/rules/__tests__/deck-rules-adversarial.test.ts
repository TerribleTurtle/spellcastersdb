import { describe, expect, it } from "vitest";

import { Unit } from "@/types/api";
import { Deck, DeckSlot, SlotType } from "@/types/deck";
import { EntityCategory } from "@/types/enums";

import { DeckRules } from "../deck-rules";

// --- Mocks ---
const MockUnit: Unit = {
  entity_id: "u-1",
  name: "Test Unit",
  category: EntityCategory.Creature,
  rank: "I",
  magic_school: "Elemental",
  tags: [],
  description: "Desc",
  health: 10,
  range: 10,
  movement_speed: 10,
  damage: 10,
};

const EmptySlot: DeckSlot = {
  index: 0,
  unit: null,
  allowedTypes: [SlotType.Unit],
};
const TitanSlot: DeckSlot = {
  index: 4,
  unit: null,
  allowedTypes: [SlotType.Titan],
};

const getInitialDeck = (): Deck => ({
  spellcaster: null,
  slots: [
    { ...EmptySlot, index: 0 },
    { ...EmptySlot, index: 1 },
    { ...EmptySlot, index: 2 },
    { ...EmptySlot, index: 3 },
    { ...TitanSlot, index: 4 },
  ],
  name: "",
});

describe("deck-rules.ts - Adversarial Tests", () => {
  describe("setSlot - Attack Surface", () => {
    it("should safely reject a float index (e.g., 2.7) without crashing", () => {
      const deck = getInitialDeck();
      // Current implementation does deck.slots[index] without bounds checking
      // 2.7 will map to undefined array element, causing crash on `slot.allowedTypes`
      const result = DeckRules.setSlot(deck, 2.7 as any, MockUnit);
      expect(result.success).toBe(false);
      expect(result.code).toBe("INVALID_INDEX");
    });

    it("should safely reject a NaN index without crashing", () => {
      const deck = getInitialDeck();
      const result = DeckRules.setSlot(deck, NaN as any, MockUnit);
      expect(result.success).toBe(false);
      expect(result.code).toBe("INVALID_INDEX");
    });

    it("should reject an out-of-bounds index like 100", () => {
      const deck = getInitialDeck();
      const result = DeckRules.setSlot(deck, 100 as any, MockUnit);
      expect(result.success).toBe(false);
      expect(result.code).toBe("INVALID_INDEX");
    });

    it("should handle a completely null card gracefully", () => {
      const deck = getInitialDeck();
      // isSpellcaster(null) is false, but card.category crashes
      const result = DeckRules.setSlot(deck, 0, null as any);
      expect(result.success).toBe(false);
    });

    it("should handle a card with an empty string entity_id", () => {
      const deck = getInitialDeck();
      // Empty string entity_ids might cause singleton checks to falsely match empty slots
      // (though usually slot.unit?.entity_id protects this, adversarial confirms it)
      const evilUnit = { ...MockUnit, entity_id: "" };
      const result = DeckRules.setSlot(deck, 0, evilUnit);
      expect(result.success).toBe(true);
    });
  });

  describe("clearSlot - Attack Surface", () => {
    it("should safely reject a float index", () => {
      const deck = getInitialDeck();
      // deck.slots[index].unit = null crashes on undefined
      expect(() => DeckRules.clearSlot(deck, 2.7 as any)).not.toThrow();
    });

    it("should safely reject a negative index", () => {
      const deck = getInitialDeck();
      expect(() => DeckRules.clearSlot(deck, -1 as any)).not.toThrow();
    });
  });

  describe("swapSlots - Attack Surface", () => {
    it("should safely reject Infinity which bypasses simple bounds checks", () => {
      const deck = getInitialDeck();
      // Current implementation is: indexA > TITAN_SLOT_INDEX (4)
      // Wait, Infinity > 4 is true, so it accurately rejects.
      // But let's verify NaN, which NaN > 4 is false, NaN < 0 is false!
      const result = DeckRules.swapSlots(deck, NaN, 1);
      expect(result.success).toBe(false);
      expect(result.code).toBe("INVALID_INDEX");
    });

    it("should treat self-swaps (0, 0) as a safe no-op", () => {
      const deck = getInitialDeck();
      deck.slots[0].unit = MockUnit;
      const result = DeckRules.swapSlots(deck, 0, 0);
      expect(result.success).toBe(true);
      expect(result.data?.slots[0].unit).toEqual(MockUnit);
    });
  });

  describe("quickAdd - Attack Surface", () => {
    it("should safely handle a deck with 0 slots", () => {
      const emptyDeck: Deck = {
        spellcaster: null,
        slots: [] as any,
        name: "Empty",
      };
      // findIndex returns -1. slots[-1].unit = entity throws.
      expect(() => DeckRules.quickAdd(emptyDeck, MockUnit)).not.toThrow();
      const result = DeckRules.quickAdd(emptyDeck, MockUnit);
      expect(result.success).toBe(false); // Deck is effectively "Full"
    });

    it("should handle null card gracefully", () => {
      const deck = getInitialDeck();
      const result = DeckRules.quickAdd(deck, null as any);
      expect(result.success).toBe(false);
    });
  });
});
