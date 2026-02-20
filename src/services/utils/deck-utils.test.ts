import { describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { Spellcaster, Unit } from "@/types/api";
import { Deck } from "@/types/deck";

import { isDeckEmpty } from "./deck-utils";

describe("deck-utils", () => {
  describe("isDeckEmpty", () => {
    it("should return true for a fresh initial deck", () => {
      expect(isDeckEmpty(INITIAL_DECK)).toBe(true);
    });

    it("should return false if spellcaster is present", () => {
      const deck: Deck = {
        ...INITIAL_DECK,
        spellcaster: { entity_id: "sc1" } as unknown as Spellcaster,
      };
      expect(isDeckEmpty(deck)).toBe(false);
    });

    it("should return false if a unit is in a slot", () => {
      const deck: Deck = { ...INITIAL_DECK, slots: [...INITIAL_DECK.slots] };
      deck.slots[0] = { ...deck.slots[0], unit: { entity_id: "u1" } as Unit };
      expect(isDeckEmpty(deck)).toBe(false);
    });
  });
});
