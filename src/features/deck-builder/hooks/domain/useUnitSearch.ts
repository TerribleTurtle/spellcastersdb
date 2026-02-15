import { useMemo } from "react";

import Fuse from "fuse.js";

import { UnifiedEntity } from "@/types/api";

interface FilterState {
  schools: string[];
  ranks: string[];
  categories: string[];
  classes: string[];
}

import { CATEGORY_PRIORITY, RANK_PRIORITY, getSearchableAttributes } from "@/services/rules/search-rules";

export function useUnitSearch(
  units: UnifiedEntity[],
  searchQuery: string,
  filters: FilterState
) {
  // 1. Fuse Instance
  const fuse = useMemo(() => {
    return new Fuse(units, {
      keys: ["name", "category", "magic_school", "tags", "description"],
      threshold: 0.3,
      ignoreLocation: true,
      // Custom getFn could be used, but standard keys work if we accept some misses on virtual fields
      // or we map the data first. Mapping is safer.
    });
  }, [units]);

  // 2. Search & Filter Logic
  const filteredUnits = useMemo(() => {
    let result = units;

    // Step A: Search
    if (searchQuery.trim().length > 0) {
      result = fuse.search(searchQuery).map((res) => res.item);
    }

    // Step B: Filter
    result = result.filter((entity) => {
      const attrs = getSearchableAttributes(entity);

      // Magic Schools
      if (
        filters.schools.length > 0 &&
        !filters.schools.includes(attrs.school)
      ) {
        return false;
      }

      // Ranks
      if (filters.ranks.length > 0 && !filters.ranks.includes(attrs.rank)) {
        return false;
      }

      // Categories
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(attrs.category)
      ) {
        return false;
      }

      // Classes
      if (
        filters.classes.length > 0 &&
        !filters.classes.includes(attrs.class)
      ) {
        return false;
      }

      return true;
    });

    // Step C: Sort (Only if filters are active and no search query)
    // User Request: "ranks should be sorted Creatures > spells > buidings"
    // "Magic Schools should be Creature > Spells > buildings"
    // Condition: Only apply when School or Rank filters are active to preserve "All" view.
    if (
      searchQuery.trim().length === 0 &&
      (filters.schools.length > 0 || filters.ranks.length > 0)
    ) {
      result.sort((a, b) => {
        const attrA = getSearchableAttributes(a);
        const attrB = getSearchableAttributes(b);

        // 1. Primary Sort: Category (Creature > Spell > Building)
        const catA = CATEGORY_PRIORITY[attrA.category] || 99;
        const catB = CATEGORY_PRIORITY[attrB.category] || 99;
        if (catA !== catB) return catA - catB;

        // 2. Secondary Sort: Rank (I > II > III > IV)
        // Note: For School view, this sorts by Rank within Category
        const rankA = RANK_PRIORITY[attrA.rank] || 99;
        const rankB = RANK_PRIORITY[attrB.rank] || 99;
        if (rankA !== rankB) return rankA - rankB;

        // 3. Tertiary Sort: Alphabetical
        return (a.name || "").localeCompare(b.name || "");
      });
    }

    return result;
  }, [units, searchQuery, filters, fuse]);

  return filteredUnits;
}
