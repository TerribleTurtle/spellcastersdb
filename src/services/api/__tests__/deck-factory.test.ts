import { describe, expect, it } from "vitest";

import { DeckFactory } from "@/tests/factories/deck-factory";
import { SlotType } from "@/types/enums";

import { createNewDeck } from "../deck-factory";

describe("deck-factory.ts - Deck Creation", () => {
  it("should create a deck with default name when none provided", () => {
    const deck = createNewDeck();
    expect(deck.name).toBe("New Deck");
    expect(deck.spellcaster).toBeNull();
  });

  it("should create a deck with the provided custom name", () => {
    const deck = createNewDeck("My Custom Deck");
    expect(deck.name).toBe("My Custom Deck");
  });

  it("should set the spellcaster if provided", () => {
    const caster = DeckFactory.createSpellcaster({ name: "Fire Caster" });
    const deck = createNewDeck("Deck", caster);

    expect(deck.spellcaster).toBeDefined();
    expect(deck.spellcaster?.name).toBe("Fire Caster");
  });

  it("should initialize exactly 5 empty slots", () => {
    const deck = createNewDeck();
    expect(deck.slots).toHaveLength(5);

    // Check all slots start empty
    expect(deck.slots[0].unit).toBeNull();
    expect(deck.slots[1].unit).toBeNull();
    expect(deck.slots[2].unit).toBeNull();
    expect(deck.slots[3].unit).toBeNull();
    expect(deck.slots[4].unit).toBeNull();
  });

  it("should set the correct allowedTypes for normal slots vs titan slot", () => {
    const deck = createNewDeck();

    // Indices 0-3 are Unit slots
    expect(deck.slots[0].allowedTypes).toEqual([SlotType.Unit]);
    expect(deck.slots[1].allowedTypes).toEqual([SlotType.Unit]);
    expect(deck.slots[2].allowedTypes).toEqual([SlotType.Unit]);
    expect(deck.slots[3].allowedTypes).toEqual([SlotType.Unit]);

    // Index 4 is the Titan slot
    expect(deck.slots[4].allowedTypes).toEqual([SlotType.Titan]);
  });
});
