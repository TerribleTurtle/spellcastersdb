import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getUniqueName } from "../naming-utils";

describe("getUniqueName", () => {
  it("should return the base name when no conflicts exist", () => {
    const result = getUniqueName("My Deck", []);
    expect(result).toBe("My Deck");
  });

  it("should trim whitespace from the base name", () => {
    const result = getUniqueName("  My Deck  ", []);
    expect(result).toBe("My Deck");
  });

  it("should return the base name if existing names differ (case-insensitive)", () => {
    const result = getUniqueName("New Deck", ["Old Deck", "Other Deck"]);
    expect(result).toBe("New Deck");
  });

  it("should append '(Copy)' on first collision", () => {
    const result = getUniqueName("My Deck", ["My Deck"]);
    expect(result).toBe("My Deck (Copy)");
  });

  it("should be case-insensitive when detecting collisions", () => {
    const result = getUniqueName("My Deck", ["my deck"]);
    expect(result).toBe("My Deck (Copy)");
  });

  it("should append '(Copy 2)' when '(Copy)' also collides", () => {
    const result = getUniqueName("My Deck", ["My Deck", "My Deck (Copy)"]);
    expect(result).toBe("My Deck (Copy 2)");
  });

  it("should increment through multiple collisions", () => {
    const existing = [
      "My Deck",
      "My Deck (Copy)",
      "My Deck (Copy 2)",
      "My Deck (Copy 3)",
    ];
    const result = getUniqueName("My Deck", existing);
    expect(result).toBe("My Deck (Copy 4)");
  });

  describe("Date.now() fallback (100+ collisions)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should fall back to Date.now() after 100 naming collisions", () => {
      // Build an array with 101 colliding names: "Deck", "Deck (Copy)", "Deck (Copy 2)" ... "Deck (Copy 100)"
      const existing = ["Deck"];
      existing.push("Deck (Copy)");
      for (let i = 2; i <= 100; i++) {
        existing.push(`Deck (Copy ${i})`);
      }

      const result = getUniqueName("Deck", existing);

      // With fake timers set to 2025-06-15T12:00:00Z
      const expectedTimestamp = new Date("2025-06-15T12:00:00Z").getTime();
      expect(result).toBe(`Deck (Copy ${expectedTimestamp})`);
    });
  });
});
