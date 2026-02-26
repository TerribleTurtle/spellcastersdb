import { describe, expect, it } from "vitest";

import { BrowserItem } from "@/types/browser";
import { EntityCategory } from "@/types/enums";

import {
  FilterState,
  filterBrowserItems,
  matchesFilters,
  matchesSearch,
} from "../filtering";

// Evil Fixtures
const createEvilItem = (overrides: any): BrowserItem => {
  return {
    entity_id: "evil-1",
    name: "Valid Name",
    category: EntityCategory.Spellcaster,
    class: "Mage",
    health: 100,
    tags: ["tag1"],
    ...overrides,
  } as unknown as BrowserItem;
};

const defaultFilters: FilterState = {
  schools: [],
  ranks: [],
  categories: [],
  classes: [],
};

describe("filtering.ts - Adversarial Tests", () => {
  describe("matchesSearch - Attack Surface", () => {
    it("should not crash when item.name is null", () => {
      const evilItem = createEvilItem({ name: null });
      // The current implementation calls item.name.toLowerCase() without checking.
      // This test proves the vulnerability and verifies the fix.
      expect(() =>
        matchesSearch(evilItem, "search", "Spellcaster")
      ).not.toThrow();
    });

    it("should not crash when item.name is undefined", () => {
      const evilItem = createEvilItem({ name: undefined });
      expect(() =>
        matchesSearch(evilItem, "search", "Spellcaster")
      ).not.toThrow();
    });

    it("should not crash when item.name is a number", () => {
      const evilItem = createEvilItem({ name: 12345 });
      expect(() => matchesSearch(evilItem, "123", "Spellcaster")).not.toThrow();
    });

    it("should not crash when tags is not an array (e.g. string/prototype pollution)", () => {
      const evilItem = createEvilItem({ tags: "__proto__" });
      expect(() =>
        matchesSearch(evilItem, "proto", "Spellcaster")
      ).not.toThrow();
    });

    it("should not crash when tags contains non-string values", () => {
      const evilItem = createEvilItem({ tags: [null, undefined, 42, {}] });
      expect(() => matchesSearch(evilItem, "42", "Spellcaster")).not.toThrow();
    });

    it("should not crash when description is a number", () => {
      const evilItem = createEvilItem({ description: 404 });
      expect(() => matchesSearch(evilItem, "404", "Spellcaster")).not.toThrow();
    });

    it("should not crash when magic_school is a number or null", () => {
      const evilItem = createEvilItem({ magic_school: null });
      expect(() =>
        matchesSearch(evilItem, "null", "Spellcaster")
      ).not.toThrow();
    });

    it("should safely handle backslash queries without regex errors", () => {
      const item = createEvilItem({});
      expect(() => matchesSearch(item, "\\", "Spellcaster")).not.toThrow();
    });
  });

  describe("calculateScore (via filterBrowserItems) - Attack Surface", () => {
    it("should not crash when item.name is null", () => {
      const evilItem = createEvilItem({ name: null });
      expect(() =>
        filterBrowserItems([evilItem], "query", defaultFilters)
      ).not.toThrow();
    });

    it("should not crash when search query is purely special characters", () => {
      const evilItem = createEvilItem({});
      expect(() =>
        filterBrowserItems([evilItem], "?*+()[]\\", defaultFilters)
      ).not.toThrow();
    });
  });

  describe("matchesFilters - Attack Surface", () => {
    it("should safely handle null/undefined in active filter arrays", () => {
      const evilFilters: FilterState = {
        schools: [null as any, undefined as any, ""],
        ranks: [null as any],
        categories: [null as any],
        classes: [undefined as any],
      };
      const item = createEvilItem({});
      expect(() =>
        matchesFilters(
          item,
          evilFilters,
          "Spellcaster",
          "None",
          null,
          "Mage",
          false
        )
      ).not.toThrow();
    });
  });

  describe("filterBrowserItems - Performance & Stability", () => {
    it("should handle 10,000 items gracefully (DoS test)", () => {
      const massiveArray = Array.from({ length: 10000 }).map((_, i) =>
        createEvilItem({
          entity_id: `id-${i}`,
          name: `Massive Item ${i} `.repeat(20), // 300+ char name
          description: `Description ${i} `.repeat(50), // 700+ char description
          tags: [`tag${i}`, "sharedTag"],
        })
      );

      const start = performance.now();
      const result = filterBrowserItems(
        massiveArray,
        "sharedTag",
        defaultFilters
      );
      const end = performance.now();

      expect(end - start).toBeLessThan(500); // Enforce strict 500ms DoD requirement
      expect(result.length).toBe(10000);
    });

    it("should gracefully handle totally empty objects", () => {
      const emptyItem = {} as BrowserItem;
      expect(() =>
        filterBrowserItems([emptyItem], "query", defaultFilters)
      ).not.toThrow();
    });
  });
});
