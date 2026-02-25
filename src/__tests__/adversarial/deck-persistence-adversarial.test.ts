 
/**
 * Phase 4 — Persistence: Serialize & Reconstruct Corruption
 *
 * This suite verifies the robustness of the storage transport layer:
 * `serializeDeck`, `reconstructDeck`, and `areDecksEqual`.
 *
 * NOTE: Tests that expect an unhandled error/crash/logic flaw are explicitly documented
 * as (EXPECTED FAIL) and use `expect(() => ...).toThrow()` or specific assertions
 * to prove the vulnerability exists without failing the test runner.
 */
import { describe, expect, it } from "vitest";

import {
  INITIAL_DECK,
  areDecksEqual,
  reconstructDeck,
  serializeDeck,
} from "@/services/api/persistence";
import { DeckRules } from "@/services/rules/deck-rules";
import { cloneDeck } from "@/services/utils/deck-utils";
import { DeckFactory } from "@/tests/factories/deck-factory";
import { Deck } from "@/types/deck";

function getEmptyDeck(): Deck {
  return cloneDeck(INITIAL_DECK);
}

describe("Phase 4 — Persistence Adversarial Tests", () => {
  describe("serializeDeck Corruption", () => {
    it("ADV-34: serializeDeck with null spellcaster — returns spellcasterId: null", () => {
      const deck = getEmptyDeck();
      const stored = serializeDeck(deck);
      expect(stored.spellcasterId).toBeNull();
    });

    it("ADV-35: serializeDeck with unit missing entity_id — falls back to null", () => {
      const deck = getEmptyDeck();
      const unit = DeckFactory.createUnit();
      delete (unit as any).entity_id; // Delete required field

      // Mutate directly to bypass DeckRules validation which relies on entity_id
      deck.slots[0].unit = unit;

      const stored = serializeDeck(deck);
      expect(stored.slotIds[0]).toBeNull();
    });
  });

  describe("reconstructDeck Corruption", () => {
    const dummyUnits = [DeckFactory.createUnit({ entity_id: "id1" })];
    const dummySpellcasters = [
      DeckFactory.createSpellcaster({ entity_id: "sc1" }),
    ];

    it("ADV-36: reconstructDeck({ slotIds: null }) — crashes (EXPECTED FAIL: Bug #7)", () => {
      const corruptedStored = {
        id: "test",
        spellcasterId: null,
        slotIds: null, // Corruption
      } as any;

      // Bug: `stored.slotIds.forEach` throws TypeError when null
      expect(() => {
        reconstructDeck(corruptedStored, dummyUnits, dummySpellcasters);
      }).toThrowError(TypeError);
    });

    it("ADV-37: reconstructDeck({ slotIds: undefined }) — crashes (EXPECTED FAIL: Bug #7)", () => {
      const corruptedStored = {
        id: "test",
        spellcasterId: null,
        // slotIds completely missing
      } as any;

      expect(() => {
        reconstructDeck(corruptedStored, dummyUnits, dummySpellcasters);
      }).toThrowError(TypeError);
    });

    it("ADV-38: reconstructDeck with unknown IDs — leaves slots empty", () => {
      const stored = {
        id: "test",
        spellcasterId: "unknown-sc",
        slotIds: ["unknown-id1", null, null, null, null],
      } as any;

      const reconstructed = reconstructDeck(
        stored,
        dummyUnits,
        dummySpellcasters
      );

      expect(reconstructed.spellcaster).toBeNull();
      expect(reconstructed.slots[0].unit).toBeNull();
    });

    it("ADV-39: reconstructDeck with short slotIds array — populates partial, leaves rest empty", () => {
      const stored = {
        id: "test",
        spellcasterId: null,
        slotIds: ["id1"], // Truncated array
      } as any;

      const reconstructed = reconstructDeck(
        stored,
        dummyUnits,
        dummySpellcasters
      );

      expect(reconstructed.slots[0].unit?.entity_id).toBe("id1");
      // ensure the rest exist and are initialized properly
      expect(reconstructed.slots[1].unit).toBeNull();
      expect(reconstructed.slots[4].allowedTypes).toBeDefined(); // Titan slot still correctly initialized
    });

    it("ADV-40: reconstructDeck with empty unit pool but valid slotIds — all slots empty", () => {
      const stored = {
        id: "test",
        spellcasterId: null,
        slotIds: ["id1", null, null, null, null],
      } as any;

      // Passing empty arrays for lookup pools
      const reconstructed = reconstructDeck(stored, [], []);
      expect(reconstructed.slots[0].unit).toBeNull();
    });
  });

  describe("areDecksEqual Edge Cases", () => {
    it("ADV-41: same reference — returns true immediately", () => {
      const deck = getEmptyDeck();
      expect(areDecksEqual(deck, deck)).toBe(true);
    });

    it("ADV-42: different identity, both empty — returns false", () => {
      const deckA = getEmptyDeck();
      deckA.id = "A";
      const deckB = getEmptyDeck();
      deckB.id = "B";

      expect(areDecksEqual(deckA, deckB)).toBe(false);
    });

    it("ADV-43: false equality on identically truncated slots (EXPECTED FAIL: Bug #8)", () => {
      // Logic flaw: if TWO DIFFERENT decks both have less than 5 slots and are missing
      // the same indices, the optional chaining `slots[i]?.unit?.entity_id || null` treats
      // missing slots as `null === null`.

      const deckA = getEmptyDeck();
      deckA.id = "same-id"; // force ID match to test slot logic
      deckA.slots = [{ index: 0, unit: null, allowedTypes: [] }] as any; // Length 1

      const deckB = getEmptyDeck();
      deckB.id = "same-id";
      deckB.slots = [
        {
          index: 0,
          unit: DeckFactory.createUnit({ entity_id: "x" }),
          allowedTypes: [],
        },
      ] as any; // Length 1

      // They are clearly not equal.
      // But let's check what happens if they BOTH have the exact same populated units in the short array
      const deckC = getEmptyDeck();
      deckC.id = "same-id";
      deckC.slots = [
        {
          index: 0,
          unit: DeckFactory.createUnit({ entity_id: "identical" }),
          allowedTypes: [],
        },
      ] as any; // Length 1

      const deckD = getEmptyDeck();
      deckD.id = "same-id";
      deckD.slots = [
        {
          index: 0,
          unit: DeckFactory.createUnit({ entity_id: "identical" }),
          allowedTypes: [],
        },
      ] as any; // Length 1

      // They are identical in slot 0, but both lack slots 1-4.
      // areDecksEqual loops 0-4. For i=1..4, both A and B return `null` via optional chaining.
      // So it returns true!
      // To prove the vulnerability specifically:
      // If Deck C and Deck D are structurally corrupt but look the same, they evaluate identically.
      // Is this really a bug? Yes, because they are fundamentally broken objects being treated as fully equal valid ones.

      const result = areDecksEqual(deckC, deckD);
      expect(result).toBe(true); // Demonstrating the loose optional chaining
    });

    it("ADV-44: areDecksEqual one deck has slots: undefined — crashes (EXPECTED FAIL: Bug #12)", () => {
      const deckA = getEmptyDeck();
      deckA.id = "same-id"; // match IDs to reach slot logic
      const deckB = getEmptyDeck();
      deckB.id = "same-id";
      deckB.slots = undefined as any;

      // Bug: `deckB.slots[i]` throws TypeError when `slots` is undefined.
      // The optional chaining is `slots[i]?.unit`, which protects against undefined SLOT objects,
      // but NOT against an undefined SLOTS ARRAY.
      expect(() => {
        areDecksEqual(deckA, deckB);
      }).toThrowError(TypeError);
    });
  });
});
