import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UnifiedEntity } from "@/types/api";

import { useUnitSearch } from "../useUnitSearch";

// Mock debounce so search updates instantly
vi.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

const mockFilters = {
  schools: [],
  ranks: [],
  categories: [],
  classes: [],
};

// Based on getSearchableAttributes logic:
// Spellcaster gets: class = entity.class, school = "Spellcaster", rank = "LEGENDARY"
// Creature gets: class = "Unit", school = entity.magic_school, rank = entity.rank
const mockUnits: UnifiedEntity[] = [
  {
    entity_id: "1",
    name: "Alpha Creature",
    category: "Creature",
    rank: "I",
    magic_school: "Nature",
    class: "Fighter", // Ignored by filter, it becomes "Unit"
    tags: ["beast", "fast"],
  } as unknown as UnifiedEntity,
  {
    entity_id: "2",
    name: "Zeta Creature",
    category: "Creature",
    rank: "II",
    magic_school: "Wild",
    class: "Mage",
    tags: [],
  } as unknown as UnifiedEntity,
  {
    entity_id: "3",
    name: "Beta Spell",
    category: "Spell",
    rank: "I",
    magic_school: "Nature",
    class: "Enchanter",
    tags: ["buff"],
  } as unknown as UnifiedEntity,
  {
    entity_id: "4",
    name: "Omega Structure",
    category: "Structure",
    rank: "III",
    magic_school: "Earth",
    class: "",
    tags: [],
  } as unknown as UnifiedEntity,
  {
    // Edge case: empty strings, unknown attributes
    entity_id: "5",
    name: "",
    category: "Unknown",
    rank: "Unknown",
    magic_school: "Unknown",
    class: "Unknown",
    tags: [],
  } as unknown as UnifiedEntity,
  {
    // Used for tie-breaking "Zeta Creature"
    entity_id: "6",
    name: "Zeta Creature Alt",
    category: "Creature",
    rank: "II",
    magic_school: "Wild",
    class: "Mage",
    tags: [],
  } as unknown as UnifiedEntity,
  {
    // Need a Spellcaster to test `class` matching
    entity_id: "7",
    name: "Mage Hero",
    category: "Spellcaster",
    rank: "LEGENDARY",
    magic_school: "Any",
    class: "Mage", // This one survives the mapping
    tags: [],
  } as unknown as UnifiedEntity,
];

describe("useUnitSearch", () => {
  describe("filtering", () => {
    it("should return all units if query and filters are empty", () => {
      const { result } = renderHook(() =>
        useUnitSearch(mockUnits, "", mockFilters)
      );
      expect(result.current).toHaveLength(7);
    });

    it("should filter by magic_school", () => {
      const { result } = renderHook(() =>
        useUnitSearch(mockUnits, "", { ...mockFilters, schools: ["Nature"] })
      );
      expect(result.current).toHaveLength(2); // Alpha Creature, Beta Spell
    });

    it("should filter by rank", () => {
      const { result } = renderHook(() =>
        // Spells/Creatures use exact rank, Spellcaster overrides to LEGENDARY
        useUnitSearch(mockUnits, "", { ...mockFilters, ranks: ["II"] })
      );
      expect(result.current).toHaveLength(2); // Zeta Creature, Zeta Creature Alt
    });

    it("should filter by category", () => {
      const { result } = renderHook(() =>
        useUnitSearch(mockUnits, "", { ...mockFilters, categories: ["Spell"] })
      );
      expect(result.current).toHaveLength(1); // Beta Spell
    });

    it("should filter by class", () => {
      const { result } = renderHook(() =>
        useUnitSearch(mockUnits, "", { ...mockFilters, classes: ["Mage"] })
      );
      // Only the Spellcaster keeps its "Mage" class. Others become "Unit".
      expect(result.current).toHaveLength(1);
      expect(result.current[0].entity_id).toBe("7"); // Mage Hero
    });
  });

  describe("searching", () => {
    it("should return matches using Fuse when query is active", () => {
      const { result } = renderHook(() =>
        useUnitSearch(mockUnits, "Alpha", mockFilters)
      );
      expect(result.current).toHaveLength(1);
      expect(result.current[0].entity_id).toBe("1");
    });

    it("should match by tags", () => {
      const { result } = renderHook(() =>
        useUnitSearch(mockUnits, "buff", mockFilters)
      );
      expect(result.current).toHaveLength(1);
      expect(result.current[0].entity_id).toBe("3");
    });

    it("should not sort via custom sort when query is active", () => {
      // Sorting block only executes if `debouncedQuery.trim().length === 0`
      const { result } = renderHook(() =>
        useUnitSearch(mockUnits, "Creature", {
          ...mockFilters,
          schools: ["Nature", "Wild"],
        })
      );
      expect(result.current.length).toBeGreaterThan(0);
    });
  });

  describe("sorting", () => {
    it("should sort by Category > Rank > Name when query is empty but filter is active", () => {
      // Input deliberately mixed
      const unsortedInput: UnifiedEntity[] = [
        mockUnits[3], // Structure (Rank III)
        mockUnits[2], // Spell (Rank I)
        mockUnits[1], // Creature (Rank II, Zeta)
        mockUnits[0], // Creature (Rank I, Alpha)
        mockUnits[4], // Unknown (Unknown fallback 99 priority)
        mockUnits[5], // Creature (Rank II, Zeta Alt)
        mockUnits[6], // Spellcaster (Rank LEGENDARY)
        { ...mockUnits[4], entity_id: "8", name: "Another Unknown" } as any, // 2nd Unknown to force rankB fallback
      ];

      const { result } = renderHook(() =>
        useUnitSearch(unsortedInput, " ", {
          ...mockFilters,
          ranks: ["I", "II", "III", "Unknown", "LEGENDARY"], // Triggers sorting lock
        })
      );

      const sortedIds = result.current.map((u) => u.entity_id);

      // Expected Sort Order logic:
      // Primary: Category: Spellcaster (1) > Creature (2) > Spell (4) > Structure (99) > Unknown (99)
      // Secondary: Rank: I (1) > II (2) > III (3) > LEGENDARY (4) > Unknown (99)
      // Tertiary: Name alphabetical

      // 1. "7": Spellcaster, Rank LEGENDARY (4), "Mage Hero"
      // 2. "1": Creature, Rank I, "Alpha Creature"
      // 3. "2": Creature, Rank II, "Zeta Creature"
      // 4. "6": Creature, Rank II, "Zeta Creature Alt"
      // 5. "3": Spell, Rank I, "Beta Spell"
      // 6. "4": Structure, Rank III, "Omega Structure"
      // 7. "5": Unknown, Rank Null, ""
      // 8. "8": Unknown, Rank Null, "Another Unknown"

      expect(sortedIds).toEqual(["7", "1", "2", "6", "3", "4", "5", "8"]);
    });

    it("should handle objects with no name for alphabetical sort", () => {
      const nameless1 = {
        ...mockUnits[0],
        entity_id: "n1",
        name: undefined,
      } as any;
      const nameless2 = {
        ...mockUnits[0],
        entity_id: "n2",
        name: "",
      } as any;

      const { result } = renderHook(() =>
        useUnitSearch([nameless2, nameless1], "", {
          ...mockFilters,
          schools: ["Nature"],
        })
      );
      const sortedIds = result.current.map((u) => u.entity_id);
      expect(sortedIds).toHaveLength(2); // Should not crash
    });
    describe("Adversarial & Edge Cases", () => {
      it("returns empty array when input units is empty", () => {
        const { result } = renderHook(() =>
          useUnitSearch([], "Search", mockFilters)
        );
        expect(result.current).toEqual([]);
      });

      it("processes whitespace-only query as empty query (no fuse search)", () => {
        const { result } = renderHook(() =>
          useUnitSearch(mockUnits, "   ", mockFilters)
        );
        // Since it's treated as empty, no search filtering occurs, length 7
        expect(result.current).toHaveLength(7);
      });

      it("handles entities with null or undefined names during sort", () => {
        const evilUnits = [
          { ...mockUnits[0], name: null as any },
          { ...mockUnits[0], name: undefined as any },
        ] as any;
        const { result } = renderHook(() =>
          useUnitSearch(evilUnits, "", { ...mockFilters, ranks: ["I"] })
        );
        expect(result.current).toHaveLength(2); // Should not crash
      });

      it("returns nothing if all category filters mismatch", () => {
        const { result } = renderHook(() =>
          useUnitSearch(mockUnits, "", {
            ...mockFilters,
            categories: ["BogusCategory"],
          })
        );
        expect(result.current).toHaveLength(0);
      });
    });
  });
});
