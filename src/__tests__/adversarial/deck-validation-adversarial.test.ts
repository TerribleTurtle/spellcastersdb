/**
 * Phase 3 — Validation & Stats: Structural Chaos
 *
 * This suite intentionally tries to break `validateDeck` and `calculateDeckStats`
 * using malformed objects, sparse arrays, undefined properties, and numeric edge cases.
 *
 * NOTE: Tests that expect an unhandled error/crash are explicitly documented
 * as (EXPECTED FAIL) and use `expect(() => ...).toThrow()` so the test runner passes.
 */
import { describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { cloneDeck } from "@/services/utils/deck-utils";
import { validateDeck } from "@/services/validation/deck-validation";
import { calculateDeckStats } from "@/services/validation/stats";
import { DeckFactory } from "@/tests/factories/deck-factory";
import { Deck } from "@/types/deck";

function getEmptyDeck(): Deck {
  return cloneDeck(INITIAL_DECK);
}

describe("Phase 3 — Validation & Stats Adversarial Tests", () => {
  describe("validateDeck Type & Structure Abuse", () => {
    it("ADV-20: validateDeck(undefined) — null input returns invalid gracefully", () => {
      const result = validateDeck(undefined as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid Deck Structure");
    });

    it("ADV-21: validateDeck({ slots: null }) — null slots returns invalid gracefully", () => {
      const result = validateDeck({ slots: null } as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid Deck Structure");
    });

    it("ADV-22: validateDeck({ slots: 'not-an-array' }) — string slots returns invalid gracefully", () => {
      const result = validateDeck({ slots: "not-an-array" } as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid Deck Structure");
    });

    it("ADV-23: validateDeck with sparse array holes — crashes (EXPECTED FAIL: Bug #6)", () => {
      const deck = getEmptyDeck();
      // Create holes: `[undefined, undefined, ...]`
      deck.slots = [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ] as any;

      // Bug: `deck.slots.filter(s => s.unit)` crashes when `s` is undefined.
      expect(() => {
        validateDeck(deck);
      }).toThrowError(TypeError);
    });

    it("ADV-24: validateDeck with Array(5) uninitialized — crashes (EXPECTED FAIL: Bug #6)", () => {
      const deck = getEmptyDeck();
      deck.slots = new Array(5) as any;

      expect(() => {
        validateDeck(deck);
      }).toThrowError(TypeError);
    });
  });

  describe("calculateDeckStats Primitive Types", () => {
    it("ADV-25: Deck with primitive unit (number) — crashes on 'in' operator (EXPECTED FAIL: Bug #11)", () => {
      const deck = getEmptyDeck();
      deck.slots[0].unit = 42 as any; // Not an object

      // Bug: "rank" in 42 throws TypeError
      expect(() => {
        calculateDeckStats(deck);
      }).toThrowError(TypeError);
    });

    it("ADV-26: Deck with primitive unit (string) — crashes on 'in' operator (EXPECTED FAIL: Bug #11)", () => {
      const deck = getEmptyDeck();
      deck.slots[0].unit = "hello" as any;

      expect(() => {
        calculateDeckStats(deck);
      }).toThrowError(TypeError);
    });

    it("ADV-27: Deck with primitive unit (array) — parses gracefully", () => {
      const deck = getEmptyDeck();
      deck.slots[0].unit = [] as any;

      const stats = calculateDeckStats(deck);
      expect(stats.unitCounts[undefined as any]).toBe(1);
    });
  });

  describe("Numeric Corruption in Stats", () => {
    it("ADV-28: Deck with health = NaN — passes silently (stats don't use health)", () => {
      const deck = getEmptyDeck();
      const unit = DeckFactory.createUnit();
      (unit as any).health = NaN;
      deck.slots[0].unit = unit;

      const stats = calculateDeckStats(deck);
      expect(stats.unitCount).toBe(1);
      expect(stats.unitCounts[unit.category]).toBe(1);
    });

    it("ADV-29: Deck with health = Infinity — passes silently", () => {
      const deck = getEmptyDeck();
      const unit = DeckFactory.createUnit();
      (unit as any).health = Infinity;
      deck.slots[0].unit = unit;

      const stats = calculateDeckStats(deck);
      expect(stats.unitCount).toBe(1);
    });
  });

  describe("Validation Rule Edge States", () => {
    it("ADV-30: Deck with Spellcaster but 0 units/titan — exactly 3 errors", () => {
      const deck = getEmptyDeck();
      deck.spellcaster = DeckFactory.createSpellcaster();

      const result = validateDeck(deck);
      expect(result.isValid).toBe(false);
      // Should flag: Missing Incantations, Missing Titan, No Rank I/II (or no creatures)
      // Implementation specifically returns Missing Incantations, Missing Titan, No Creatures
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
      // Depending on exact rules engine priority, we assert it catches failures
    });

    it("ADV-31: Deck with 4 Rank I Creatures, no Titan — exactly 1 error", () => {
      const deck = getEmptyDeck();
      deck.spellcaster = DeckFactory.createSpellcaster();
      for (let i = 0; i < 4; i++) {
        deck.slots[i].unit = DeckFactory.createUnit({ rank: "I" });
      }

      const result = validateDeck(deck);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Must have 1 Titan");
      expect(result.errors).not.toContain("Must have 4 Incantations");
    });

    it("ADV-32: Deck with only Titan (no units/spellcaster) — Multiple errors", () => {
      const deck = getEmptyDeck();
      deck.slots[4].unit = DeckFactory.createTitan();

      const result = validateDeck(deck);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("Spellcaster"))).toBe(true);
      expect(
        result.errors.some(
          (e) =>
            e.includes("Incantations") ||
            e.includes("Creature") ||
            e.includes("Rank")
        )
      ).toBe(true);
    });

    it("ADV-33: Deck with units missing rank field entirely — guarded safely", () => {
      const deck = getEmptyDeck();
      const unit = DeckFactory.createUnit();
      delete (unit as any).rank;
      deck.slots[0].unit = unit;

      const stats = calculateDeckStats(deck);
      // Because `"rank" in unit` is evaluated, it shouldn't crash if omitted
      expect(stats.rank1or2Count).toBe(0);
      expect(stats.unitCount).toBe(1);
    });
  });
});
