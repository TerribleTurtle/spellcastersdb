import { describe, expect, it } from "vitest";

import { createNewDeck } from "@/services/api/deck-factory";
import { DeckRules } from "@/services/rules/deck-rules";
import { DeckFactory } from "@/tests/factories/deck-factory";
import { Deck } from "@/types/deck";

import { TeamMovement } from "../TeamMovement";

describe("TeamMovement.ts", () => {
  describe("moveCardBetweenDecks", () => {
    it("should return early logic for same slot intra-deck move", () => {
      const decks = [
        createNewDeck("D1"),
        createNewDeck("D2"),
        createNewDeck("D3"),
      ] as [Deck, Deck, Deck];
      const result = TeamMovement.moveCardBetweenDecks(decks, 0, 0, 0, 0);
      expect(result.data).toEqual(decks);
      expect(result.success).toBe(true);
    });

    it("should swap two occupied slots in the same deck", () => {
      const decks = [
        createNewDeck("D1"),
        createNewDeck("D2"),
        createNewDeck("D3"),
      ] as [Deck, Deck, Deck];
      const unit1 = DeckFactory.createUnit({ name: "U1", entity_id: "u1" });
      const unit2 = DeckFactory.createUnit({ name: "U2", entity_id: "u2" });

      // Setup: put U1 in slot 0, U2 in slot 1
      decks[0] = DeckRules.setSlot(decks[0], 0, unit1).data || decks[0];
      decks[0] = DeckRules.setSlot(decks[0], 1, unit2).data || decks[0];

      const result = TeamMovement.moveCardBetweenDecks(decks, 0, 0, 0, 1);
      expect(result.success).toBe(true);
      expect(result.data?.[0]?.slots[0].unit?.name).toBe("U2");
      expect(result.data?.[0]?.slots[1].unit?.name).toBe("U1");
    });

    it("should move to an empty slot across different decks", () => {
      const decks = [
        createNewDeck("D1"),
        createNewDeck("D2"),
        createNewDeck("D3"),
      ] as [Deck, Deck, Deck];
      const unit = DeckFactory.createUnit({ name: "U1" });

      // Setup: U1 in deck 0, slot 0. Deck 1, slot 1 is empty.
      decks[0] = DeckRules.setSlot(decks[0], 0, unit).data || decks[0];

      const result = TeamMovement.moveCardBetweenDecks(decks, 0, 0, 1, 1);
      expect(result.success).toBe(true);
      expect(result.data?.[0]?.slots[0].unit).toBeNull();
      expect(result.data?.[1]?.slots[1].unit?.name).toBe("U1");
    });

    it("should return false if source slot is empty", () => {
      const decks = [
        createNewDeck("D1"),
        createNewDeck("D2"),
        createNewDeck("D3"),
      ] as [Deck, Deck, Deck];
      const result = TeamMovement.moveCardBetweenDecks(decks, 0, 0, 1, 0);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return false for invalid deck indices", () => {
      const decks = [
        createNewDeck("D1"),
        createNewDeck("D2"),
        createNewDeck("D3"),
      ] as [Deck, Deck, Deck];
      const result = TeamMovement.moveCardBetweenDecks(decks, 9, 0, 0, 0);
      expect(result.success).toBe(false);
    });
  });

  describe("moveSpellcasterBetweenDecks", () => {
    it("should move a spellcaster from one deck to an empty spellcaster slot in another", () => {
      const caster1 = DeckFactory.createSpellcaster({ name: "SC1" });
      const decks = [
        createNewDeck("D1", caster1),
        createNewDeck("D2", undefined),
        createNewDeck("D3", undefined),
      ] as [Deck, Deck, Deck];

      const result = TeamMovement.moveSpellcasterBetweenDecks(decks, 0, 1);

      expect(result.success).toBe(true);
      expect(result.data?.[0]?.spellcaster).toBeNull();
      expect(result.data?.[1]?.spellcaster?.name).toBe("SC1");
    });

    it("should swap two spellcasters if both decks are occupied", () => {
      const caster1 = DeckFactory.createSpellcaster({ name: "SC1" });
      const caster2 = DeckFactory.createSpellcaster({ name: "SC2" });
      const decks = [
        createNewDeck("D1", caster1),
        createNewDeck("D2", caster2),
        createNewDeck("D3", undefined),
      ] as [Deck, Deck, Deck];

      const result = TeamMovement.moveSpellcasterBetweenDecks(decks, 0, 1);

      expect(result.success).toBe(true);
      expect(result.data?.[0]?.spellcaster?.name).toBe("SC2");
      expect(result.data?.[1]?.spellcaster?.name).toBe("SC1");
    });

    it("should return false if source deck has no spellcaster", () => {
      const decks = [
        createNewDeck("D1", undefined),
        createNewDeck("D2", undefined),
        createNewDeck("D3", undefined),
      ] as [Deck, Deck, Deck];

      const result = TeamMovement.moveSpellcasterBetweenDecks(decks, 0, 1);
      expect(result.success).toBe(false);
      expect(result.error).toBe("No spellcaster at source");
    });

    it("should return false for invalid deck indices", () => {
      const decks = [
        createNewDeck("D1"),
        createNewDeck("D2"),
        createNewDeck("D3"),
      ] as [Deck, Deck, Deck];
      const result = TeamMovement.moveSpellcasterBetweenDecks(decks, 0, 5);
      expect(result.success).toBe(false);
    });
  });
});
