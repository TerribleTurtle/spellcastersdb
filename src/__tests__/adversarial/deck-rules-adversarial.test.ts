/**
 * Phase 2 — DeckRules: Mutation & Gate Abuse
 *
 * This suite intentionally tries to break `DeckRules` using out-of-bounds indices,
 * malformed objects, type subversion, and mutability leaks.
 *
 * NOTE: Tests that expect an unhandled error/crash are explicitly documented
 * as (EXPECTED FAIL) and use `expect(() => ...).toThrow()` so the test runner passes,
 * but the existence of the vulnerability is proven.
 */
import { describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { DECK_ERRORS } from "@/services/config/errors";
import { DeckRules } from "@/services/rules/deck-rules";
import { cloneDeck } from "@/services/utils/deck-utils";
import { DeckFactory } from "@/tests/factories/deck-factory";
import { Deck, DeckSlot } from "@/types/deck";
import { EntityCategory, SlotType } from "@/types/enums";

// --- Helpers ---
function getEmptyDeck(): Deck {
  return cloneDeck(INITIAL_DECK);
}

function getFullDeck(): Deck {
  let deck = getEmptyDeck();
  deck = DeckRules.setSpellcaster(deck, DeckFactory.createSpellcaster());

  for (let i = 0; i < 4; i++) {
    deck = DeckRules.quickAdd(
      deck,
      DeckFactory.createUnit({ entity_id: `u-${i}` })
    ).data!;
  }
  deck = DeckRules.quickAdd(
    deck,
    DeckFactory.createTitan({ entity_id: `t-1` })
  ).data!;

  return deck;
}

// --- Tests ---
describe("Phase 2 — DeckRules Adversarial Tests", () => {
  describe("setSlot Adversarial", () => {
    it("ADV-1: OOB negative index — crashes instead of graceful fail (EXPECTED FAIL: Bug #3)", () => {
      const deck = getEmptyDeck();
      const unit = DeckFactory.createUnit();

      // Bug: `newDeck.slots[-1]` is undefined. `slot.allowedTypes` throws TypeError.
      expect(() => {
        DeckRules.setSlot(deck, -1, unit);
      }).toThrowError(TypeError);
    });

    it("ADV-2: OOB positive index — crashes instead of graceful fail (EXPECTED FAIL: Bug #3)", () => {
      const deck = getEmptyDeck();
      const unit = DeckFactory.createUnit();

      // Bug: `newDeck.slots[99]` is undefined.
      expect(() => {
        DeckRules.setSlot(deck, 99, unit);
      }).toThrowError(TypeError);
    });

    it("ADV-3: NaN index — crashes instead of graceful fail", () => {
      const deck = getEmptyDeck();
      const unit = DeckFactory.createUnit();

      // Bug: `newDeck.slots[NaN]` is undefined.
      expect(() => {
        DeckRules.setSlot(deck, NaN as any, unit);
      }).toThrowError(TypeError);
    });

    it("ADV-11: setSlot with Spellcaster entity — returns error", () => {
      const deck = getEmptyDeck();
      const sc = DeckFactory.createSpellcaster() as any;

      const result = DeckRules.setSlot(deck, 0, sc);

      expect(result.success).toBe(false);
      expect(result.error).toBe(DECK_ERRORS.SPELLCASTER_IN_NORMAL_SLOT);
    });

    it("ADV-12: setSlot Titan into unit slot — returns mismatch error", () => {
      const deck = getEmptyDeck();
      const titan = DeckFactory.createTitan();

      const result = DeckRules.setSlot(deck, 0, titan);

      expect(result.success).toBe(false);
      expect(result.error).toBe(DECK_ERRORS.UNIT_SLOT_MISMATCH);
    });

    it("ADV-13: setSlot Unit into Titan slot — returns mismatch error", () => {
      const deck = getEmptyDeck();
      const unit = DeckFactory.createUnit();

      const result = DeckRules.setSlot(deck, 4, unit); // Slot 4 is Titan

      expect(result.success).toBe(false);
      expect(result.error).toBe(DECK_ERRORS.TITAN_SLOT_MISMATCH);
    });

    it("ADV-18: setSlot unit with undefined category — bypasses Titan check silently", () => {
      const deck = getEmptyDeck();
      const unit = DeckFactory.createUnit();
      // Explicitly delete category to bypass checks
      delete (unit as any).category;

      const result = DeckRules.setSlot(deck, 4, unit); // Try to put in Titan slot
      // Because `isTitan` checks `undefined === EntityCategory.Titan` (false), it bypasses the Titan guard
      // and then is allowed into the Titan slot because the slot allows Unit?
      // Wait, slot 4 only allows Titan types.
      // Ah: `slot.allowedTypes.includes(SlotType.Titan) && !isTitan`
      // If `allowedTypes.includes(Titan)` (which slot 4 does), and `!isTitan` (which it is, because category is undefined),
      // it returns `TITAN_SLOT_MISMATCH`

      // Let's just assert exactly what happens based on the rules.
      expect(result.success).toBe(false);
      expect(result.error).toBe(DECK_ERRORS.TITAN_SLOT_MISMATCH);
    });

    it("ADV-19: Mutate slot allowedTypes before setSlot", () => {
      const deck = getEmptyDeck();
      const unit = DeckFactory.createUnit();

      // Mutate the original deck structure
      const originalAllowedTypes = [...deck.slots[4].allowedTypes];
      deck.slots[4].allowedTypes = [SlotType.Unit] as any; // Force slot 4 to accept Units

      const result = DeckRules.setSlot(deck, 4, unit);

      // If it copies correctly, it will allow the unit into slot 4 now because the config was mutable
      expect(result.success).toBe(true);

      // Restore
      deck.slots[4].allowedTypes = originalAllowedTypes;
    });
  });

  describe("clearSlot Adversarial", () => {
    it("ADV-4: OOB negative index — crashes (EXPECTED FAIL: Bug #1)", () => {
      const deck = getEmptyDeck();
      // Bug: `newDeck.slots[-1].unit = null`
      expect(() => {
        DeckRules.clearSlot(deck, -1);
      }).toThrowError(TypeError);
    });

    it("ADV-5: OOB positive index — crashes (EXPECTED FAIL: Bug #2)", () => {
      const deck = getEmptyDeck();
      expect(() => {
        DeckRules.clearSlot(deck, 99);
      }).toThrowError(TypeError);
    });

    it("ADV-6: clearSlot on already empty slot behaves idempotently", () => {
      const deck = getEmptyDeck();
      expect(deck.slots[0].unit).toBeNull();
      const result = DeckRules.clearSlot(deck, 0);
      expect(result.slots[0].unit).toBeNull();
    });
  });

  describe("quickAdd Adversarial", () => {
    it("ADV-7: quickAdd same unit × 10 rapidly", () => {
      let deck = getEmptyDeck();
      const unit = DeckFactory.createUnit();

      const first = DeckRules.quickAdd(deck, unit);
      expect(first.success).toBe(true);
      deck = first.data!;

      // Next 9 should all fail consistently with DUPLICATE_UNIT
      for (let i = 0; i < 9; i++) {
        const result = DeckRules.quickAdd(deck, unit);
        expect(result.success).toBe(false);
        expect(result.error).toBe(DECK_ERRORS.DUPLICATE_UNIT);
      }
    });

    it("ADV-8: Fill deck, then quickAdd × 5 more units", () => {
      const deck = getFullDeck();
      const unit = DeckFactory.createUnit({ entity_id: "overflow-unit" });

      for (let i = 0; i < 5; i++) {
        const result = DeckRules.quickAdd(deck, unit);
        expect(result.success).toBe(false);
        expect(result.error).toBe(DECK_ERRORS.DECK_FULL);
      }
    });

    it("ADV-9: quickAdd empty object — routes to addUnit, errors peacefully", () => {
      const deck = getEmptyDeck();
      const garbage = {} as any;

      // Because it has no class/abilities, isSpellcaster=false.
      // Because category is undefined, isTitan=false.
      // Routes to addUnit, which will try to read `entity_id` and potentially fail validation or duplicate checks.
      const result = DeckRules.quickAdd(deck, garbage);

      // Usually fails or adds an empty string. Let's just ensure it DOES NOT CRASH.
      expect(result).toBeDefined();
    });

    it("ADV-10: quickAdd object with class+abilities but wrong type — misroutes to Spellcaster (EXPECTED FAIL: Bug #5)", () => {
      const deck = getEmptyDeck();
      // Simulate standard Unit but it accidentally shares keys with Spellcaster
      const fakeSpellcaster = DeckFactory.createUnit({
        entity_id: "u-fake-sc",
        name: "Fake SC",
      }) as any;
      fakeSpellcaster.class = "Warrior"; // Matches spelling of Spellcaster class key
      fakeSpellcaster.abilities = {}; // Matches spelling of Spellcaster abilities key

      const result = DeckRules.quickAdd(deck, fakeSpellcaster);

      // Because `isSpellcaster` only checks `!!entity.class && !!entity.abilities`,
      // this Unit will wrongly be processed as a Spellcaster!
      expect(result.success).toBe(true);
      expect(result.data?.spellcaster?.entity_id).toBe("u-fake-sc");
    });
  });

  describe("swapSlots Adversarial", () => {
    it("ADV-14: swapSlots(deck, 0, 0) self-swap", () => {
      let deck = getEmptyDeck();
      const unit = DeckFactory.createUnit();
      deck = DeckRules.quickAdd(deck, unit).data!;

      const result = DeckRules.swapSlots(deck, 0, 0);
      expect(result.success).toBe(true);
      expect(result.data?.slots[0].unit).toEqual(unit);
    });

    it("ADV-15: swapSlots with negative index", () => {
      const deck = getEmptyDeck();
      const result = DeckRules.swapSlots(deck, -1, 0);

      expect(result.success).toBe(false);
      expect(result.error).toBe(DECK_ERRORS.INVALID_SLOT_INDEX);
    });

    it("ADV-16: swapSlots two empty slots", () => {
      const deck = getEmptyDeck();
      const result = DeckRules.swapSlots(deck, 0, 1);

      expect(result.success).toBe(true);
      expect(result.data?.slots[0].unit).toBeNull();
      expect(result.data?.slots[1].unit).toBeNull();
    });
  });

  describe("setSpellcaster Mutability Leak", () => {
    it("ADV-17: setSpellcaster shallow spread leaks slot references (EXPECTED FAIL: Bug #4)", () => {
      const originalDeck = getEmptyDeck();
      const sc = DeckFactory.createSpellcaster();

      // Because setSpellcaster does `return { ...deck, spellcaster: sc }`,
      // the new deck's `slots` array is literally a reference to `originalDeck.slots`.
      const newDeck = DeckRules.setSpellcaster(originalDeck, sc);

      // Mutate newDeck's slot
      const unit = DeckFactory.createUnit();
      newDeck.slots[0].unit = unit;

      // Assert that originalDeck's slot was ALSO mutated, proving the bug
      expect(originalDeck.slots[0].unit).toEqual(unit);
    });
  });
});
