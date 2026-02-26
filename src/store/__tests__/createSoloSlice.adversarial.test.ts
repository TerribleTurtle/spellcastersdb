import { describe, expect, it } from "vitest";
import { create } from "zustand";

import { INITIAL_DECK } from "@/services/api/persistence";
import { DeckBuilderState } from "@/store/types";
import { DeckFactory } from "@/tests/factories/deck-factory";

import { createSoloSlice } from "../createSoloSlice";

const useStore = create<DeckBuilderState>()(
  (...a) =>
    ({
      ...createSoloSlice(...a),
    }) as any
);

/**
 * ADVERSARIAL: createSoloSlice
 * Rapid-fire mutations, null/undefined bombs, category spoofing,
 * and double operations.
 */
describe("createSoloSlice.ts — adversarial", () => {
  // ─── Rapid-Fire Mutations ────────────────────────────────────────
  describe("rapid-fire mutations", () => {
    it("should handle 100 rapid setSlot calls without corruption", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });

      for (let i = 0; i < 100; i++) {
        const unit = DeckFactory.createUnit({
          entity_id: `rapid_${i % 4}`, // Cycles through 4 IDs
          name: `Rapid ${i}`,
        });
        useStore.getState().setSlot(i % 4, unit);
      }

      // Deck should still be valid — last unit for each slot
      const deck = useStore.getState().currentDeck;
      expect(deck.slots).toHaveLength(5);
      for (let i = 0; i < 4; i++) {
        expect(deck.slots[i].unit).not.toBeNull();
      }
    });

    it("should handle alternating add/clear cycles without state corruption", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });
      const unit = DeckFactory.createUnit({ entity_id: "toggle" });

      for (let i = 0; i < 50; i++) {
        useStore.getState().setSlot(0, unit);
        useStore.getState().clearSlot(0);
      }

      expect(useStore.getState().currentDeck.slots[0].unit).toBeNull();
    });
  });

  // ─── Category Spoofing ───────────────────────────────────────────
  describe("category spoofing", () => {
    it("quickAdd should reject 'Consumable' category", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });
      const fake = {
        ...DeckFactory.createUnit(),
        category: "Consumable",
      };
      const result = useStore.getState().quickAdd(fake as any);
      expect(typeof result).toBe("string"); // Error message
    });

    it("quickAdd should reject 'Upgrade' category", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });
      const fake = {
        ...DeckFactory.createUnit(),
        category: "Upgrade",
      };
      const result = useStore.getState().quickAdd(fake as any);
      expect(typeof result).toBe("string"); // Error message
    });

    it("quickAdd should reject empty string category", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });
      const fake = {
        ...DeckFactory.createUnit(),
        category: "",
      };
      // Should either error or try to add — just shouldn't crash
      const result = useStore.getState().quickAdd(fake as any);
      expect(result === null || typeof result === "string").toBe(true);
    });
  });

  // ─── Double Operations ───────────────────────────────────────────
  describe("double operations", () => {
    it("double removeSpellcaster should not crash", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });
      useStore.getState().removeSpellcaster();
      useStore.getState().removeSpellcaster();
      expect(useStore.getState().currentDeck.spellcaster).toBeNull();
    });

    it("double clearDeck should not crash", () => {
      useStore.getState().clearDeck();
      useStore.getState().clearDeck();
      expect(useStore.getState().currentDeck.name).toBe("New Deck");
    });

    it("clearSlot on already-empty slot should not crash", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });
      useStore.getState().clearSlot(0);
      useStore.getState().clearSlot(0);
      expect(useStore.getState().currentDeck.slots[0].unit).toBeNull();
    });
  });

  // ─── Boundary Slot Indices via Store ─────────────────────────────
  describe("boundary slot indices via store actions", () => {
    it("setSlot with index -1 should not mutate state", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });
      const snapshot = JSON.stringify(useStore.getState().currentDeck);
      useStore.getState().setSlot(-1 as any, DeckFactory.createUnit());
      expect(JSON.stringify(useStore.getState().currentDeck)).toBe(snapshot);
    });

    it("setSlot with index 5 should not mutate state", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });
      const snapshot = JSON.stringify(useStore.getState().currentDeck);
      useStore.getState().setSlot(5 as any, DeckFactory.createUnit());
      expect(JSON.stringify(useStore.getState().currentDeck)).toBe(snapshot);
    });

    it("clearSlot with index NaN is ignored safely (fixed bug)", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });
      // clearSlot(NaN) is now caught by validation bounds checking
      expect(() => useStore.getState().clearSlot(NaN as any)).not.toThrow();
    });

    it("swapSlots with same indices should be a no-op", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });
      const unit = DeckFactory.createUnit({ entity_id: "swap_noop" });
      useStore.getState().setSlot(0, unit);

      useStore.getState().swapSlots(0, 0);
      expect(useStore.getState().currentDeck.slots[0].unit?.entity_id).toBe(
        "swap_noop"
      );
    });
  });

  // ─── XSS in Deck Names ──────────────────────────────────────────
  describe("XSS in deck names", () => {
    const XSS = [
      '<script>alert("xss")</script>',
      '"><img src=x onerror=alert(1)>',
      "a".repeat(10_000),
      "\x00\x01\x02",
      "${process.exit(1)}",
    ];

    for (const payload of XSS) {
      it(`setDeckName should accept "${payload.slice(0, 30)}" without crashing`, () => {
        useStore.getState().setDeckName(payload);
        expect(useStore.getState().currentDeck.name).toBe(payload);
      });
    }
  });

  // ─── quickAdd Until Full Then Keep Going ─────────────────────────
  describe("quickAdd overflow stress test", () => {
    it("should handle 20 quickAdd calls on a 4-unit deck without crashing", () => {
      useStore.getState().setDeck({ ...INITIAL_DECK });

      const results: (string | null)[] = [];
      for (let i = 0; i < 20; i++) {
        const unit = DeckFactory.createUnit({ entity_id: `stress_${i}` });
        results.push(useStore.getState().quickAdd(unit));
      }

      // First 4 should succeed, rest should fail
      expect(results.slice(0, 4).every((r) => r === null)).toBe(true);
      expect(results.slice(4).every((r) => typeof r === "string")).toBe(true);
    });
  });
});
