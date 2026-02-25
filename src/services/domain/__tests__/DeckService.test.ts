import { describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { DeckService } from "@/services/domain/DeckService";
import { cloneDeck } from "@/services/utils/deck-utils";
import { DeckFactory } from "@/tests/factories/deck-factory";

describe("DeckService", () => {
  describe("clone", () => {
    it("should return a deep copy (identity + mutation isolation)", () => {
      const original = cloneDeck(INITIAL_DECK);
      original.spellcaster = DeckFactory.createSpellcaster();
      original.slots[0].unit = DeckFactory.createUnit();

      const cloned = DeckService.clone(original);

      // 1. Identity isolation
      expect(cloned).not.toBe(original);
      expect(cloned.slots).not.toBe(original.slots);

      // 2. Data parity
      expect(cloned).toEqual(original);

      // 3. Mutation isolation
      cloned.slots[0].unit = null;
      expect(original.slots[0].unit).not.toBeNull();
    });
  });

  describe("validate", () => {
    it("should return the correct ValidationResult shape for an empty deck", () => {
      const deck = cloneDeck(INITIAL_DECK);
      const result = DeckService.validate(deck);

      expect(result).toHaveProperty("isValid");
      expect(result).toHaveProperty("errors");
      expect(result).toHaveProperty("stats");

      expect(result.isValid).toBe(false);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should prove independence through a clone -> mutate -> validate round-trip", () => {
      const validDeck = cloneDeck(INITIAL_DECK);
      // Make it valid (simplified)
      validDeck.spellcaster = DeckFactory.createSpellcaster();
      validDeck.slots[4].unit = DeckFactory.createTitan();
      for (let i = 0; i < 4; i++) {
        validDeck.slots[i].unit = DeckFactory.createUnit({ rank: "I" });
      }

      const originalResult = DeckService.validate(validDeck);
      expect(originalResult.isValid).toBe(true); // Assuming valid based on mock rules

      // Clone, then mutate the clone to make it invalid
      const cloned = DeckService.clone(validDeck);
      cloned.slots[4].unit = null; // Remove Titan

      const cloneResult = DeckService.validate(cloned);
      expect(cloneResult.isValid).toBe(false);
      expect(cloneResult.errors.some((e) => e.includes("Titan"))).toBe(true);

      // Ensure original is still valid
      const originalResultAfter = DeckService.validate(validDeck);
      expect(originalResultAfter.isValid).toBe(true);
    });
  });
});
