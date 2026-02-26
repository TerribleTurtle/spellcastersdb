import { describe, expect, it } from "vitest";

import { createNewDeck } from "@/services/api/deck-factory";
import { DeckRules } from "@/services/rules/deck-rules";
import { DeckFactory } from "@/tests/factories/deck-factory";

/**
 * ADVERSARIAL: DeckRules
 * Boundary indices, type confusion, duplicate injection, null bombs,
 * and slot mismatch attacks.
 */
describe("DeckRules — adversarial", () => {
  // ─── Boundary Slot Indices ───────────────────────────────────────
  describe("boundary slot indices", () => {
    const baseDeck = () => createNewDeck("Test");

    it("setSlot with index -1 should fail gracefully", () => {
      const unit = DeckFactory.createUnit();
      const result = DeckRules.setSlot(baseDeck(), -1 as any, unit);
      expect(result.success).toBe(false);
    });

    it("setSlot with index 5 (out of bounds) should fail gracefully", () => {
      const unit = DeckFactory.createUnit();
      const result = DeckRules.setSlot(baseDeck(), 5 as any, unit);
      expect(result.success).toBe(false);
    });

    it("setSlot with index NaN should fail gracefully", () => {
      const unit = DeckFactory.createUnit();
      const result = DeckRules.setSlot(baseDeck(), NaN as any, unit);
      expect(result.success).toBe(false);
    });

    it("setSlot with index Infinity should fail gracefully", () => {
      const unit = DeckFactory.createUnit();
      const result = DeckRules.setSlot(baseDeck(), Infinity as any, unit);
      expect(result.success).toBe(false);
    });

    it("setSlot with index -Infinity should fail gracefully", () => {
      const unit = DeckFactory.createUnit();
      const result = DeckRules.setSlot(baseDeck(), -Infinity as any, unit);
      expect(result.success).toBe(false);
    });

    it("setSlot with float index 1.7 should fail (isValidIndex rejects non-integers)", () => {
      const unit = DeckFactory.createUnit();
      const result = DeckRules.setSlot(baseDeck(), 1.7 as any, unit);
      expect(result.success).toBe(false);
    });

    it("setSlot with index 4.9 should fail (isValidIndex rejects non-integers)", () => {
      const titan = DeckFactory.createTitan();
      const result = DeckRules.setSlot(baseDeck(), 4.9 as any, titan);
      expect(result.success).toBe(false);
    });

    it("clearSlot with NaN index should return deck unchanged", () => {
      const deck = baseDeck();
      const result = DeckRules.clearSlot(deck, NaN as any);
      expect(result).toEqual(deck);
    });

    it("clearSlot with -1 should return deck unchanged", () => {
      const deck = baseDeck();
      const result = DeckRules.clearSlot(deck, -1 as any);
      expect(result).toEqual(deck);
    });

    it("swapSlots with NaN indices should fail", () => {
      const result = DeckRules.swapSlots(baseDeck(), NaN, 0);
      expect(result.success).toBe(false);
    });

    it("swapSlots with Infinity indices should fail", () => {
      const result = DeckRules.swapSlots(baseDeck(), 0, Infinity);
      expect(result.success).toBe(false);
    });
  });

  // ─── Null/Undefined Card Bombs ───────────────────────────────────
  describe("null and undefined card attacks", () => {
    it("setSlot with null card should fail", () => {
      const result = DeckRules.setSlot(createNewDeck("T"), 0, null as any);
      expect(result.success).toBe(false);
    });

    it("setSlot with undefined card should fail", () => {
      const result = DeckRules.setSlot(createNewDeck("T"), 0, undefined as any);
      expect(result.success).toBe(false);
    });

    it("quickAdd with null card should fail", () => {
      const result = DeckRules.quickAdd(createNewDeck("T"), null);
      expect(result.success).toBe(false);
    });

    it("quickAdd with undefined card should fail", () => {
      const result = DeckRules.quickAdd(createNewDeck("T"), undefined as any);
      expect(result.success).toBe(false);
    });
  });

  // ─── Type Confusion: Titan in Unit Slot ──────────────────────────
  describe("slot type mismatch attacks", () => {
    it("should reject Titan in unit slot (index 0)", () => {
      const titan = DeckFactory.createTitan();
      const result = DeckRules.setSlot(createNewDeck("T"), 0, titan);
      expect(result.success).toBe(false);
      expect(result.code).toBe("SLOT_MISMATCH");
    });

    it("should reject Unit in Titan slot (index 4)", () => {
      const unit = DeckFactory.createUnit();
      const result = DeckRules.setSlot(createNewDeck("T"), 4, unit);
      expect(result.success).toBe(false);
      expect(result.code).toBe("SLOT_MISMATCH");
    });

    it("should reject Spellcaster via setSlot (must use setSpellcaster)", () => {
      const caster = DeckFactory.createSpellcaster();
      const result = DeckRules.setSlot(createNewDeck("T"), 0, caster as any);
      expect(result.success).toBe(false);
      expect(result.code).toBe("INVALID_TYPE");
    });
  });

  // ─── Duplicate Entity Injection ──────────────────────────────────
  describe("duplicate entity injection", () => {
    it("quickAdd should reject placing the same entity_id twice", () => {
      let deck = createNewDeck("T");
      const unit = DeckFactory.createUnit({ entity_id: "dup_test" });

      const r1 = DeckRules.quickAdd(deck, unit);
      expect(r1.success).toBe(true);
      deck = r1.data!;

      const r2 = DeckRules.quickAdd(deck, unit);
      expect(r2.success).toBe(false);
      expect(r2.code).toBe("DUPLICATE_UNIT");
    });

    it("setSlot should swap when same entity_id is placed in different slot", () => {
      let deck = createNewDeck("T");
      const unit = DeckFactory.createUnit({
        entity_id: "singleton_test",
        name: "S1",
      });

      // Place in slot 0
      const r1 = DeckRules.setSlot(deck, 0, unit);
      expect(r1.success).toBe(true);
      deck = r1.data!;

      // Place same entity in slot 1 — should trigger singleton swap
      const r2 = DeckRules.setSlot(deck, 1, unit);
      expect(r2.success).toBe(true);
      expect(r2.data?.slots[1].unit?.entity_id).toBe("singleton_test");
      // Slot 0 should now be empty (swapped away)
      expect(r2.data?.slots[0].unit).toBeNull();
    });
  });

  // ─── Deck Full Attack ────────────────────────────────────────────
  describe("deck overflow", () => {
    it("should reject 5th quickAdd unit when all 4 unit slots are full", () => {
      let deck = createNewDeck("Full");
      for (let i = 0; i < 4; i++) {
        const r = DeckRules.quickAdd(
          deck,
          DeckFactory.createUnit({ entity_id: `u${i}` })
        );
        expect(r.success).toBe(true);
        deck = r.data!;
      }

      const overflow = DeckRules.quickAdd(
        deck,
        DeckFactory.createUnit({ entity_id: "u_overflow" })
      );
      expect(overflow.success).toBe(false);
      expect(overflow.code).toBe("DECK_FULL");
    });

    it("should allow Titan even when unit slots are full", () => {
      let deck = createNewDeck("Full");
      for (let i = 0; i < 4; i++) {
        const r = DeckRules.quickAdd(
          deck,
          DeckFactory.createUnit({ entity_id: `u${i}` })
        );
        deck = r.data!;
      }

      const titan = DeckRules.quickAdd(deck, DeckFactory.createTitan());
      expect(titan.success).toBe(true);
    });
  });

  // ─── Spellcaster Edge Cases ──────────────────────────────────────
  describe("spellcaster weirdness", () => {
    it("setSpellcaster should rename deck if name is 'New Deck'", () => {
      const deck = createNewDeck("New Deck");
      const caster = DeckFactory.createSpellcaster({ name: "Merlin" });
      const result = DeckRules.setSpellcaster(deck, caster);
      expect(result.name).toBe("Merlin Deck");
    });

    it("setSpellcaster should NOT rename if deck has a custom name", () => {
      const deck = createNewDeck("My Custom Deck");
      const caster = DeckFactory.createSpellcaster({ name: "Merlin" });
      const result = DeckRules.setSpellcaster(deck, caster);
      expect(result.name).toBe("My Custom Deck");
    });

    it("removeSpellcaster should set to null without crashing", () => {
      const deck = createNewDeck("T");
      const cleared = DeckRules.removeSpellcaster(deck);
      expect(cleared.spellcaster).toBeNull();
      // Double removal should also be safe
      const doubleCleared = DeckRules.removeSpellcaster(cleared);
      expect(doubleCleared.spellcaster).toBeNull();
    });
  });

  // ─── swapSlots Cross-Type Attack ─────────────────────────────────
  describe("swapSlots type enforcement", () => {
    it("should reject swapping Unit slot with Titan slot content", () => {
      let deck = createNewDeck("T");
      const unit = DeckFactory.createUnit({ entity_id: "swap_u" });
      const titan = DeckFactory.createTitan({ entity_id: "swap_t" });

      deck = DeckRules.setSlot(deck, 0, unit).data!;
      deck = DeckRules.setSlot(deck, 4, titan).data!;

      // Attempt to swap slot 0 (unit) with slot 4 (titan)
      const result = DeckRules.swapSlots(deck, 0, 4);
      expect(result.success).toBe(false);
      expect(result.code).toBe("SWAP_INVALID");
    });
  });

  // ─── Immutability Check ──────────────────────────────────────────
  describe("immutability guarantees", () => {
    it("setSlot should not mutate the original deck", () => {
      const original = createNewDeck("Immutable");
      const originalSlot0 = original.slots[0].unit;

      const unit = DeckFactory.createUnit();
      DeckRules.setSlot(original, 0, unit);

      // Original should be untouched
      expect(original.slots[0].unit).toBe(originalSlot0);
    });

    it("swapSlots should not mutate the original deck", () => {
      let deck = createNewDeck("Immutable");
      const u1 = DeckFactory.createUnit({ entity_id: "imm_1", name: "A" });
      const u2 = DeckFactory.createUnit({ entity_id: "imm_2", name: "B" });
      deck = DeckRules.setSlot(deck, 0, u1).data!;
      deck = DeckRules.setSlot(deck, 1, u2).data!;

      const snapshot = JSON.stringify(deck);
      DeckRules.swapSlots(deck, 0, 1);
      expect(JSON.stringify(deck)).toBe(snapshot);
    });
  });
});
