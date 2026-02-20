import { describe, expect, it } from "vitest";

import { Spellcaster, Titan, Unit } from "@/types/api";
import { Deck, DeckSlot, SlotType } from "@/types/deck";
import { EntityCategory } from "@/types/enums";

import { DeckRules } from "./deck-rules";

// --- Mocks ---

const MockSpellcaster: Spellcaster = {
  entity_id: "sc-1",
  name: "Test Spellcaster",
  category: EntityCategory.Spellcaster,
  class: "Conqueror",
  tags: [],
  health: 100,
  abilities: {
    passive: [{ name: "P", description: "D" }],
    primary: { name: "P1", description: "D" },
    defense: { name: "D1", description: "D" },
    ultimate: { name: "U", description: "D" },
  },
  movement_type: "Ground",
};

const MockUnit: Unit = {
  entity_id: "u-1",
  name: "Test Unit",
  category: EntityCategory.Creature,
  rank: "I",
  magic_school: "Elemental",
  tags: [],
  description: "Desc",
  // Flat stats
  health: 10,
  range: 10,
  movement_speed: 10,
  damage: 10,
};

const MockTitan: Titan = {
  entity_id: "t-1",
  name: "Test Titan",
  category: EntityCategory.Titan,
  magic_school: "Titan",
  tags: [],
  description: "Titan Desc",
  rank: "V",
  // Flat stats
  health: 1000,
  damage: 100,
  movement_speed: 5,
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

// --- Tests ---

describe("DeckRules", () => {
  describe("setSpellcaster", () => {
    it("should set the spellcaster and auto-generate deck name if empty", () => {
      const deck = DeckRules.setSpellcaster(getInitialDeck(), MockSpellcaster);
      expect(deck.spellcaster).toEqual(MockSpellcaster);
      expect(deck.name).toBe("Test Spellcaster Deck");
    });

    it("should not overwrite an existing custom name", () => {
      const deck = DeckRules.setSpellcaster(
        { ...getInitialDeck(), name: "My Custom Deck" },
        MockSpellcaster
      );
      expect(deck.name).toBe("My Custom Deck");
    });
  });

  describe("quickAdd", () => {
    it("should add a unit to the first empty slot", () => {
      const result = DeckRules.quickAdd(getInitialDeck(), MockUnit);
      expect(result.success).toBe(true);
      expect(result.data?.slots[0].unit).toEqual(MockUnit);
    });

    it("should add a titan to the titan slot", () => {
      const result = DeckRules.quickAdd(getInitialDeck(), MockTitan);
      expect(result.success).toBe(true);
      expect(result.data?.slots[4].unit).toEqual(MockTitan);
      // Ensure it didn't go to slot 0
      expect(result.data?.slots[0].unit).toBeNull();
    });

    it("should fail if the deck is full (units)", () => {
      const deck = getInitialDeck();
      // Fill slots 0-3
      deck.slots[0].unit = { ...MockUnit, entity_id: "u-1" };
      deck.slots[1].unit = { ...MockUnit, entity_id: "u-2" };
      deck.slots[2].unit = { ...MockUnit, entity_id: "u-3" };
      deck.slots[3].unit = { ...MockUnit, entity_id: "u-4" };

      const result = DeckRules.quickAdd(deck, {
        ...MockUnit,
        entity_id: "u-5",
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Deck Full!");
    });

    it("should fail if adding a duplicate unit", () => {
      const deck = DeckRules.quickAdd(getInitialDeck(), MockUnit).data!;
      const result = DeckRules.quickAdd(deck, MockUnit);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Already in deck!");
    });
  });

  describe("setSlot", () => {
    it("should place a unit in a valid slot", () => {
      const result = DeckRules.setSlot(getInitialDeck(), 1, MockUnit);
      expect(result.success).toBe(true);
      expect(result.data?.slots[1].unit).toEqual(MockUnit);
    });

    it("should reject a Titan in a Unit slot", () => {
      const result = DeckRules.setSlot(getInitialDeck(), 0, MockTitan);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Titans cannot go in this slot");
    });

    it("should reject a Unit in a Titan slot", () => {
      const result = DeckRules.setSlot(getInitialDeck(), 4, MockUnit);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Only Titans can go in this slot");
    });

    it("should remove the unit from its old slot if it was already in the deck (move behavior)", () => {
      // Setup: Unit in slot 0
      const deck = getInitialDeck();
      deck.slots[0].unit = MockUnit;

      // Move to slot 1
      const result = DeckRules.setSlot(deck, 1, MockUnit);
      expect(result.success).toBe(true);
      expect(result.data?.slots[1].unit).toEqual(MockUnit);
      expect(result.data?.slots[0].unit).toBeNull();
    });
  });

  describe("swapSlots", () => {
    it("should swap two units", () => {
      const deck = getInitialDeck();
      const u1 = { ...MockUnit, entity_id: "1" };
      const u2 = { ...MockUnit, entity_id: "2" };
      deck.slots[0].unit = u1;
      deck.slots[1].unit = u2;

      const result = DeckRules.swapSlots(deck, 0, 1);
      expect(result.success).toBe(true);
      expect(result.data?.slots[0].unit).toEqual(u2);
      expect(result.data?.slots[1].unit).toEqual(u1);
    });

    it("should fail swapping a Titan into a Unit slot", () => {
      const deck = getInitialDeck();
      deck.slots[4].unit = MockTitan;
      deck.slots[0].unit = MockUnit;

      const result = DeckRules.swapSlots(deck, 4, 0);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});
