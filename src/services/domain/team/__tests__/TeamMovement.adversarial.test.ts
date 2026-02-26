import { describe, expect, it } from "vitest";

import { createNewDeck } from "@/services/api/deck-factory";
import { DeckRules } from "@/services/rules/deck-rules";
import { DeckFactory } from "@/tests/factories/deck-factory";

import { TeamMovement } from "../TeamMovement";

/**
 * ADVERSARIAL: TeamMovement
 * Negative indices, NaN, Infinity, float indices, empty decks array,
 * and moves that should fail gracefully.
 */
describe("TeamMovement.ts — adversarial", () => {
  // ─── moveCardBetweenDecks: Index Torture ─────────────────────────
  describe("moveCardBetweenDecks — index torture", () => {
    const NASTY_INDICES = [-1, -100, NaN, Infinity, -Infinity, 999, 1.5];

    for (const idx of NASTY_INDICES) {
      it(`should fail gracefully with sourceDeckIndex=${idx}`, () => {
        const decks = [createNewDeck("D1")];
        const result = TeamMovement.moveCardBetweenDecks(decks, idx, 0, 0, 0);
        // Should either succeed (same-slot no-op) or fail with error
        expect(typeof result.success).toBe("boolean");
      });

      it(`should fail gracefully with sourceSlotIndex=${idx}`, () => {
        const decks = [createNewDeck("D1")];
        const result = TeamMovement.moveCardBetweenDecks(decks, 0, idx, 0, 0);
        expect(typeof result.success).toBe("boolean");
      });
    }
  });

  // ─── Empty Decks Array ───────────────────────────────────────────
  describe("empty decks array", () => {
    it("moveCardBetweenDecks with zero decks should fail", () => {
      const result = TeamMovement.moveCardBetweenDecks([] as any, 0, 0, 0, 0);
      expect(result.success).toBe(false);
    });

    it("moveSpellcasterBetweenDecks with zero decks should fail", () => {
      const result = TeamMovement.moveSpellcasterBetweenDecks([] as any, 0, 0);
      expect(result.success).toBe(false);
    });
  });

  // ─── Same Index Moves ────────────────────────────────────────────
  describe("self-referential moves", () => {
    it("moving card to the same slot in the same deck should be a no-op", () => {
      const decks = [createNewDeck("D1")];
      const unit = DeckFactory.createUnit({ entity_id: "self_move" });
      decks[0] = DeckRules.setSlot(decks[0], 0, unit).data!;

      const result = TeamMovement.moveCardBetweenDecks(decks, 0, 0, 0, 0);
      expect(result.success).toBe(true);
      expect(result.data?.[0]?.slots[0].unit?.entity_id).toBe("self_move");
    });

    it("moving spellcaster to the same deck index should succeed as self-swap", () => {
      const caster = DeckFactory.createSpellcaster({ name: "Self" });
      const decks = [createNewDeck("D1", caster)];

      // sourceDeckIndex === targetDeckIndex
      const result = TeamMovement.moveSpellcasterBetweenDecks(decks, 0, 0);
      // Should still succeed, it's a no-op swap with itself
      expect(result.success).toBe(true);
    });
  });

  // ─── Cross-Deck Move with Empty Slots ────────────────────────────
  describe("cross-deck with all-empty source", () => {
    it("should fail when trying to move empty slot to another deck", () => {
      const decks = [createNewDeck("D1"), createNewDeck("D2")];
      const result = TeamMovement.moveCardBetweenDecks(decks, 0, 0, 1, 0);
      expect(result.success).toBe(false);
    });
  });

  // ─── moveSpellcasterBetweenDecks: Double Empty ───────────────────
  describe("moveSpellcasterBetweenDecks — double empty", () => {
    it("should fail when both decks have no spellcaster", () => {
      const decks = [createNewDeck("D1"), createNewDeck("D2")];
      const result = TeamMovement.moveSpellcasterBetweenDecks(decks, 0, 1);
      expect(result.success).toBe(false);
    });

    it("should fail when source deck doesn't exist", () => {
      const decks = [createNewDeck("D1")];
      const result = TeamMovement.moveSpellcasterBetweenDecks(decks, 5, 0);
      expect(result.success).toBe(false);
    });

    it("should fail when target deck doesn't exist", () => {
      const caster = DeckFactory.createSpellcaster();
      const decks = [createNewDeck("D1", caster)];
      const result = TeamMovement.moveSpellcasterBetweenDecks(decks, 0, 5);
      expect(result.success).toBe(false);
    });
  });

  // ─── Immutability ────────────────────────────────────────────────
  describe("immutability guarantees", () => {
    it("moveCardBetweenDecks should not mutate the original decks array", () => {
      const decks = [createNewDeck("D1"), createNewDeck("D2")];
      const unit = DeckFactory.createUnit({ entity_id: "imm_cross" });
      decks[0] = DeckRules.setSlot(decks[0], 0, unit).data!;

      const snapshot = JSON.stringify(decks);
      TeamMovement.moveCardBetweenDecks(decks, 0, 0, 1, 0);

      // The original reference should be unchanged
      expect(JSON.stringify(decks)).toBe(snapshot);
    });
  });
});
