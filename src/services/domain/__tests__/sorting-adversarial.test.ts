import { describe, expect, it } from "vitest";

import { BrowserItem } from "@/types/browser";
import { EntityCategory } from "@/types/enums";

import {
  compareByCategoryPriority,
  compareByName,
  compareByRank,
  getComparator,
  groupItems,
} from "../sorting";

// Evil Fixtures
const createEvilItem = (overrides: any): BrowserItem => {
  return {
    entity_id: "evil-1",
    name: "Valid Name",
    category: EntityCategory.Spellcaster,
    ...overrides,
  } as unknown as BrowserItem;
};

describe("sorting.ts - Adversarial Tests", () => {
  describe("Comparators - Attack Surface", () => {
    it("compareByName should not crash if name is null", () => {
      const a = createEvilItem({ name: null });
      const b = createEvilItem({ name: "Bob" });
      // localeCompare on null throws
      expect(() => compareByName(a, b)).not.toThrow();
    });

    it("compareByName should not crash if name is undefined", () => {
      const a = createEvilItem({ name: undefined });
      const b = createEvilItem({ name: "Bob" });
      expect(() => compareByName(a, b)).not.toThrow();
    });

    it("compareByRank should not crash if rank is a number (not a string)", () => {
      const a = createEvilItem({ rank: 2 });
      const b = createEvilItem({ rank: "V" });
      // localeCompare on number throws
      expect(() => compareByRank(a, b)).not.toThrow();
    });

    it("compareByRank should fallback safely if prototype polluted", () => {
      const a = createEvilItem({ tags: [] });
      Object.setPrototypeOf(a, { rank: "V" }); // Pollute prototype
      const b = createEvilItem({ rank: "I" });
      // "rank" in a is true, but we should make sure localeCompare processes it safely
      expect(() => compareByRank(a, b)).not.toThrow();
    });

    it("compareByCategoryPriority should not crash on unknown categories", () => {
      const a = createEvilItem({ category: "__INVALID_CAT__" });
      const b = createEvilItem({ category: null });
      expect(() => compareByCategoryPriority(a, b)).not.toThrow();
    });
  });

  describe("getComparator - Edge Cases", () => {
    it("should fallback safely when mode is empty string", () => {
      const comparator = getComparator("" as any);
      expect(typeof comparator).toBe("function");
    });
  });

  describe("groupItems - Attack Surface", () => {
    it("should handle items with entity_id but null category in 'All' mode", () => {
      const item = createEvilItem({ category: null, entity_id: "id" });
      // Usually fails to map, but shouldn't crash
      expect(() => groupItems([item], "All")).not.toThrow();
    });

    it("should handle 1000 identical items without stack overflow", () => {
      const massiveArray = Array.from({ length: 1000 }).map(() =>
        createEvilItem({ rank: "I", name: "Clone" })
      );
      expect(() => groupItems(massiveArray, "All")).not.toThrow();
    });

    it("should drop items completely missing expected fields gracefully in Rank mode", () => {
      const item = createEvilItem({});
      // Delete properties
      delete (item as any).rank;
      expect(() => groupItems([item], "Rank")).not.toThrow();
    });
  });
});
