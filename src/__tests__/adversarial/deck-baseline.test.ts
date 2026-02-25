/**
 * Phase 1 — Baseline Sanity Tests (Control Group)
 *
 * These tests establish a known-good foundation for the deck builder.
 * If any of these break after future changes, you know exactly what regressed.
 */
import { describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import {
  areDecksEqual,
  reconstructDeck,
  serializeDeck,
} from "@/services/api/persistence";
import { DeckRules } from "@/services/rules/deck-rules";
import { cloneDeck, isDeckEmpty } from "@/services/utils/deck-utils";
import { validateDeck } from "@/services/validation/deck-validation";
import { DeckFactory } from "@/tests/factories/deck-factory";
import { Deck, DeckSlot, SlotType } from "@/types/deck";

// --- Helpers ---

function getEmptyDeck(): Deck {
  return cloneDeck(INITIAL_DECK);
}

function getFullyValidDeck(): Deck {
  let deck = getEmptyDeck();

  // Set Spellcaster
  deck = DeckRules.setSpellcaster(deck, DeckFactory.createSpellcaster());

  // Fill unit slots 0-3 (slot 0 is Rank I to satisfy rank rule)
  const units = [
    DeckFactory.createUnit({
      entity_id: "u-baseline-1",
      name: "Rank I Creature",
      rank: "I",
    }),
    DeckFactory.createUnit({
      entity_id: "u-baseline-2",
      name: "Rank III A",
      rank: "III",
    }),
    DeckFactory.createUnit({
      entity_id: "u-baseline-3",
      name: "Rank III B",
      rank: "III",
    }),
    DeckFactory.createUnit({
      entity_id: "u-baseline-4",
      name: "Rank III C",
      rank: "III",
    }),
  ];
  for (const unit of units) {
    const result = DeckRules.quickAdd(deck, unit);
    if (result.success) deck = result.data!;
  }

  // Titan
  const titan = DeckFactory.createTitan({ entity_id: "t-baseline-1" });
  const titanResult = DeckRules.quickAdd(deck, titan);
  if (titanResult.success) deck = titanResult.data!;

  return deck;
}

// --- Tests ---

describe("Phase 1 — Baseline Sanity Tests", () => {
  describe("quickAdd Baselines", () => {
    it("BL-1: should add a unit to the first empty slot", () => {
      const deck = getEmptyDeck();
      const unit = DeckFactory.createUnit({ entity_id: "bl-u1" });

      const result = DeckRules.quickAdd(deck, unit);

      expect(result.success).toBe(true);
      expect(result.data?.slots[0].unit).toEqual(unit);
      expect(result.data?.slots[1].unit).toBeNull();
    });

    it("BL-2: should add a Titan to slot 4, leaving slots 0-3 empty", () => {
      const deck = getEmptyDeck();
      const titan = DeckFactory.createTitan({ entity_id: "bl-t1" });

      const result = DeckRules.quickAdd(deck, titan);

      expect(result.success).toBe(true);
      expect(result.data?.slots[4].unit).toEqual(titan);
      // Slots 0-3 must remain empty
      for (let i = 0; i < 4; i++) {
        expect(result.data?.slots[i].unit).toBeNull();
      }
    });

    it("BL-3: should set a Spellcaster via quickAdd", () => {
      const deck = getEmptyDeck();
      const sc = DeckFactory.createSpellcaster({ entity_id: "bl-sc1" });

      const result = DeckRules.quickAdd(deck, sc);

      expect(result.success).toBe(true);
      expect(result.data?.spellcaster).toEqual(sc);
    });
  });

  describe("setSlot Baseline", () => {
    it("BL-4: should place a valid unit at index 1", () => {
      const deck = getEmptyDeck();
      const unit = DeckFactory.createUnit({ entity_id: "bl-u2" });

      const result = DeckRules.setSlot(deck, 1, unit);

      expect(result.success).toBe(true);
      expect(result.data?.slots[1].unit).toEqual(unit);
      expect(result.data?.slots[0].unit).toBeNull();
    });
  });

  describe("clearSlot Baseline", () => {
    it("BL-5: should clear a filled slot", () => {
      let deck = getEmptyDeck();
      const unit = DeckFactory.createUnit({ entity_id: "bl-u3" });
      deck = DeckRules.quickAdd(deck, unit).data!;

      // Confirm it's filled
      expect(deck.slots[0].unit).toEqual(unit);

      // Clear it
      const cleared = DeckRules.clearSlot(deck, 0);
      expect(cleared.slots[0].unit).toBeNull();
    });
  });

  describe("swapSlots Baseline", () => {
    it("BL-6: should swap two filled unit slots", () => {
      let deck = getEmptyDeck();
      const u1 = DeckFactory.createUnit({
        entity_id: "bl-swap-1",
        name: "Alpha",
      });
      const u2 = DeckFactory.createUnit({
        entity_id: "bl-swap-2",
        name: "Beta",
      });
      deck = DeckRules.quickAdd(deck, u1).data!;
      deck = DeckRules.quickAdd(deck, u2).data!;

      const result = DeckRules.swapSlots(deck, 0, 1);

      expect(result.success).toBe(true);
      expect(result.data?.slots[0].unit?.entity_id).toBe("bl-swap-2");
      expect(result.data?.slots[1].unit?.entity_id).toBe("bl-swap-1");
    });
  });

  describe("setSpellcaster Baseline", () => {
    it("BL-7: should set hero and auto-generate deck name", () => {
      const deck = getEmptyDeck();
      const sc = DeckFactory.createSpellcaster({ name: "Ishtar" });

      const result = DeckRules.setSpellcaster(deck, sc);

      expect(result.spellcaster).toEqual(sc);
      expect(result.name).toBe("Ishtar Deck");
    });
  });

  describe("validateDeck Baseline", () => {
    it("BL-8: should validate a fully valid deck with 0 errors", () => {
      const deck = getFullyValidDeck();
      const result = validateDeck(deck);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.stats.unitCount).toBe(4);
      expect(result.stats.titanCount).toBe(1);
      expect(result.stats.hasSpellcaster).toBe(true);
    });
  });

  describe("Serialize / Reconstruct Round-Trip", () => {
    it("BL-9: should preserve equality through serialize → reconstruct", () => {
      const deck = getFullyValidDeck();

      // Serialize
      const stored = serializeDeck(deck);
      expect(stored.spellcasterId).toBeTruthy();
      expect(stored.slotIds.filter(Boolean)).toHaveLength(5);

      // Build lookup pools from the deck itself
      const units = deck.slots.map((s) => s.unit).filter(Boolean) as any[];
      const spellcasters = deck.spellcaster ? [deck.spellcaster] : [];

      // Reconstruct
      const reconstructed = reconstructDeck(stored, units, spellcasters);

      // Core equality: same unit IDs in same positions
      for (let i = 0; i < 5; i++) {
        expect(reconstructed.slots[i]?.unit?.entity_id).toBe(
          deck.slots[i]?.unit?.entity_id
        );
      }
      expect(reconstructed.spellcaster?.entity_id).toBe(
        deck.spellcaster?.entity_id
      );
    });
  });

  describe("isDeckEmpty Baseline", () => {
    it("BL-10: should return true for a fresh initial deck", () => {
      const deck = getEmptyDeck();
      expect(isDeckEmpty(deck)).toBe(true);
    });
  });

  describe("cloneDeck Baseline", () => {
    it("BL-11: should produce a fully independent deep copy", () => {
      const deck = getFullyValidDeck();
      const clone = cloneDeck(deck);

      // Values match
      expect(clone).toEqual(deck);

      // References differ
      expect(clone).not.toBe(deck);
      expect(clone.slots).not.toBe(deck.slots);
      expect(clone.spellcaster).not.toBe(deck.spellcaster);

      // Mutation isolation: changing the clone does NOT affect the original
      clone.slots[0].unit = null;
      expect(deck.slots[0].unit).not.toBeNull();
    });
  });
});
