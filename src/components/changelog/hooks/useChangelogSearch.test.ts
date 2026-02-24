// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PatchEntry } from "@/types/patch-history";

import { useChangelogSearch } from "./useChangelogSearch";

// Mock debounce to return immediately to avoid timer acrobatics in tests
vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: vi.fn(<T>(value: T, _delay: number): T => value),
}));

const mockPatches: PatchEntry[] = [
  {
    id: "patch-1",
    version: "1.0.0",
    title: "Initial Release",
    date: "2024-01-01T00:00:00.000Z",
    type: "Content",
    changes: [
      {
        target_id: "unit_vampire",
        name: "Vampire",
        field: "hp",
        change_type: "edit",
        category: "Unit",
        diffs: [{ old: 10, new: 15 }],
      },
      {
        target_id: "spell_fireball",
        name: "Fireball",
        field: "damage",
        change_type: "delete",
        category: "Spell",
        diffs: [{ old: 50, new: 40 }],
      },
    ],
  },
  {
    id: "patch-2",
    version: "1.0.1",
    title: "Hotfix",
    date: "2024-01-02T00:00:00.000Z",
    type: "Hotfix",
    changes: [
      {
        target_id: "unit_vampire",
        name: "Vampire",
        field: "attack",
        change_type: "add",
        category: "Unit",
        diffs: [{ old: 5, new: 4 }],
      },
    ],
  },
];

describe("useChangelogSearch", () => {
  it("should initialize and flatten the patches correctly", () => {
    const { result } = renderHook(() => useChangelogSearch(mockPatches));

    // 2 patches, total 3 changes -> 3 flattened rows
    expect(result.current.totalCount).toBe(3);
    expect(result.current.results).toHaveLength(3);

    // Check categories derived
    expect(result.current.allCategories).toEqual(["Spell", "Unit"]);
  });

  describe("Sorting", () => {
    it("should default to date-desc", () => {
      const { result } = renderHook(() => useChangelogSearch(mockPatches));

      expect(result.current.sortMode).toBe("date-desc");
      expect(result.current.results[0].patchId).toBe("patch-2"); // Newer patch first
      expect(result.current.results[1].patchId).toBe("patch-1");
    });

    it("should sort by date-asc", () => {
      const { result } = renderHook(() => useChangelogSearch(mockPatches));

      act(() => {
        result.current.setSortMode("date-asc");
      });

      expect(result.current.results[0].patchId).toBe("patch-1"); // Older patch first
      expect(result.current.results[2].patchId).toBe("patch-2");
    });

    it("should sort by name-asc", () => {
      const { result } = renderHook(() => useChangelogSearch(mockPatches));

      act(() => {
        result.current.setSortMode("name-asc");
      });

      // Fireball, Vampire, Vampire
      expect(result.current.results[0].name).toBe("Fireball");
      expect(result.current.results[1].name).toBe("Vampire");
      expect(result.current.results[2].name).toBe("Vampire");
    });

    it("should sort by name-desc", () => {
      const { result } = renderHook(() => useChangelogSearch(mockPatches));

      act(() => {
        result.current.setSortMode("name-desc");
      });

      expect(result.current.results[0].name).toBe("Vampire");
      expect(result.current.results[2].name).toBe("Fireball");
    });
  });

  describe("Filtering", () => {
    it("should toggle patchType filters", () => {
      const { result } = renderHook(() => useChangelogSearch(mockPatches));

      expect(result.current.hasActiveFilters).toBe(false);

      act(() => {
        result.current.togglePatchType("Content");
      });

      expect(result.current.hasActiveFilters).toBe(true);
      expect(result.current.results).toHaveLength(2); // Only changes from patch-1
      expect(
        result.current.results.every((r) => r.patchType === "Content")
      ).toBe(true);

      // Toggle off
      act(() => {
        result.current.togglePatchType("Content");
      });
      expect(result.current.results).toHaveLength(3); // All changes
    });

    it("should toggle changeType filters", () => {
      const { result } = renderHook(() => useChangelogSearch(mockPatches));

      act(() => {
        result.current.toggleChangeType("edit");
      });

      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].changeType).toBe("edit");

      // Toggle off
      act(() => {
        result.current.toggleChangeType("edit");
      });
      expect(result.current.results).toHaveLength(3);
    });

    it("should toggle category filters", () => {
      const { result } = renderHook(() => useChangelogSearch(mockPatches));

      act(() => {
        result.current.toggleCategory("Spell");
      });

      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].category).toBe("Spell");

      // Toggle off
      act(() => {
        result.current.toggleCategory("Spell");
      });
      expect(result.current.results).toHaveLength(3);
    });

    it("should combine multiple filters with AND (within categories it reduces options)", () => {
      // Note: The logic is actually: items must match the selected patchTypes AND changeTypes AND categories.
      // E.g. patch=major AND change=buff
      const { result } = renderHook(() => useChangelogSearch(mockPatches));

      act(() => {
        result.current.togglePatchType("Content");
        result.current.toggleChangeType("edit");
      });

      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].name).toBe("Vampire");
    });
  });

  describe("Searching", () => {
    it("should search items by text using Fuse.js", () => {
      const { result } = renderHook(() => useChangelogSearch(mockPatches));

      act(() => {
        result.current.setSearchQuery("Fireball");
      });

      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].name).toBe("Fireball");
    });
  });

  describe("clearAll", () => {
    it("should reset search, filters, and sort", () => {
      const { result } = renderHook(() => useChangelogSearch(mockPatches));

      act(() => {
        result.current.setSearchQuery("Fireball");
        result.current.toggleCategory("Spell");
        result.current.setSortMode("name-asc");
      });

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.searchQuery).toBe("");
      expect(result.current.sortMode).toBe("date-desc");
      expect(result.current.filters.categories).toEqual([]);
      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.results).toHaveLength(3);
    });
  });
});
