import { describe, it, expect } from "vitest";
import { validateDeck } from "./deck-validation";
import { Deck, DeckSlot } from "@/types/deck";
import { Unit, Spellcaster } from "@/types/api";

// --- Type-Safe Mock Helpers ---

function mockSpellcaster(override: Partial<Spellcaster> = {}): Spellcaster {
  return {
    spellcaster_id: "sc_1",
    name: "Test Caster",
    category: "Spellcaster",
    class: "Enchanter", // Valid literal
    tags: [],
    abilities: {
        passive: [],
        primary: { name: "P", description: "D" },
        defense: { name: "D", description: "D" },
        ultimate: { name: "U", description: "D" },
    },
    ...override,
  };
}

function mockUnit(override: Partial<Unit> = {}): Unit {
  return {
    entity_id: "u_1",
    name: "Test Unit",
    category: "Creature", // Valid literal
    rank: "I",
    health: 100,
    tags: [],
    magic_school: "Wild",
    description: "A test unit",
    ...override,
  } as Unit;
}

function createDeck(override: Partial<Deck> = {}): Deck {
  const baseSlots: [DeckSlot, DeckSlot, DeckSlot, DeckSlot, DeckSlot] = [
    { index: 0, unit: mockUnit({ name: "Creature 1", rank: "I" }), allowedTypes: ["UNIT"] },
    { index: 1, unit: mockUnit({ name: "Creature 2", rank: "III" }), allowedTypes: ["UNIT"] },
    { index: 2, unit: mockUnit({ name: "Creature 3", rank: "III" }), allowedTypes: ["UNIT"] },
    { index: 3, unit: mockUnit({ name: "Creature 4", rank: "III" }), allowedTypes: ["UNIT"] },
    { index: 4, unit: mockUnit({ name: "Titan 1", category: "Titan" as any, rank: "V" }), allowedTypes: ["TITAN"] },
  ];

  return {
    slots: baseSlots,
    spellcaster: mockSpellcaster(),
    id: "test",
    name: "Test Deck",
    ...override,
  };
}

describe("validateDeck Logic", () => {
  it("should accept a fully valid deck", () => {
    const deck = createDeck();
    const result = validateDeck(deck);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  describe("Spellcaster Rules", () => {
    it("should fail if spellcaster is missing", () => {
      const deck = createDeck({ spellcaster: null });
      const result = validateDeck(deck);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Select a Spellcaster");
    });
  });

  describe("Unit Count Rules", () => {
    it("should fail if less than 4 units are selected", () => {
        const deck = createDeck();
        // Clear a slot
        deck.slots[0].unit = null; 
        
        const result = validateDeck(deck);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Must have 4 Units");
    });

    it("should fail if Titan is missing", () => {
        const deck = createDeck();
        deck.slots[4].unit = null;

        const result = validateDeck(deck);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Must have 1 Titan");
    });
  });

  describe("Rank & Category Rules", () => {
    it("should fail if NO Rank I or II Creature is present", () => {
        const deck = createDeck();
        // Upgrade the only Rank I unit to Rank III
        deck.slots[0].unit = mockUnit({ name: "Big Unit", rank: "III" });

        const result = validateDeck(deck);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Must include at least 1 Rank I or II Creature");
    });

    it("should fail if the only Rank I/II unit is a BUILDING (must be Creature)", () => {
        const deck = createDeck();
        // Slot 0 is Rank I, but change it to Building
        deck.slots[0].unit = mockUnit({ name: "Tower", rank: "I", category: "Building" });

        const result = validateDeck(deck);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Must include at least 1 Rank I or II Creature");
    });

    it("should fail if the only Rank I/II unit is a SPELL (must be Creature)", () => {
        const deck = createDeck();
        // Slot 0 is Rank I, but change it to Spell. We cast as any because Unit type assumes Creature/Building
        deck.slots[0].unit = mockUnit({ name: "Zap", rank: "I", category: "Spell" as any });

        const result = validateDeck(deck);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Must include at least 1 Rank I or II Creature");
    });

    it("should fail if deck has 4 units but ZERO creatures (all Buildings/Spells)", () => {
        const deck = createDeck();
        
        deck.slots.forEach((s, i) => {
            if (i < 4 && s.unit) {
                const rank = i === 0 ? "I" : "III";
                s.unit = mockUnit({ name: `Building ${i}`, category: "Building", rank });
            }
        });

        const result = validateDeck(deck);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Deck must include at least 1 Creature (cannot be all Spells/Buildings)");
    });
  });
});
