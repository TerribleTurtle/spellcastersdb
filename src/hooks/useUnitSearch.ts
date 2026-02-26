import { useMemo } from "react";

import Fuse from "fuse.js";

import type { SortField, SortOrder } from "@/components/database/FilterSidebar";
import { useDebounce } from "@/hooks/useDebounce";
import {
  CATEGORY_PRIORITY,
  RANK_PRIORITY,
  getSearchableAttributes,
} from "@/services/rules/search-rules";
import { UnifiedEntity } from "@/types/api";

interface FilterState {
  schools: string[];
  ranks: string[];
  categories: string[];
  classes: string[];
}

export function useUnitSearch(
  units: UnifiedEntity[],
  searchQuery: string,
  filters: FilterState,
  sortBy?: SortField,
  sortOrder?: SortOrder
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

  // 2. Debounce the search query
  const debouncedQuery = useDebounce(searchQuery, 300);

  // 3. Search & Filter Logic
  const filteredUnits = useMemo(() => {
    let result = units;

    // Step A: Search (Use debounced query)
    if (debouncedQuery.trim().length > 0) {
      result = fuse.search(debouncedQuery).map((res) => res.item);
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

    // Step C: User-driven sort (takes priority when sortBy is set)
    if (sortBy) {
      const dir = sortOrder === "desc" ? -1 : 1;
      result.sort((a, b) => {
        const attrA = getSearchableAttributes(a);
        const attrB = getSearchableAttributes(b);

        let cmp = 0;
        switch (sortBy) {
          case "name":
            cmp = (a.name || "").localeCompare(b.name || "");
            break;
          case "cost":
            cmp =
              ((a as { population?: number }).population ?? 0) -
              ((b as { population?: number }).population ?? 0);
            break;
          case "damage":
            cmp =
              ((a as { damage?: number }).damage ?? 0) -
              ((b as { damage?: number }).damage ?? 0);
            break;
          case "health":
            cmp =
              ((a as { health?: number }).health ?? 0) -
              ((b as { health?: number }).health ?? 0);
            break;
          case "rank": {
            const rankA = RANK_PRIORITY[attrA.rank] || 99;
            const rankB = RANK_PRIORITY[attrB.rank] || 99;
            cmp = rankA - rankB;
            break;
          }
        }

        // Tie-break alphabetically
        if (cmp === 0) cmp = (a.name || "").localeCompare(b.name || "");
        return cmp * dir;
      });
    } else if (
      // Step C (fallback): Priority sort when filters are active and no search
      debouncedQuery.trim().length === 0 &&
      (filters.schools.length > 0 || filters.ranks.length > 0)
    ) {
      result.sort((a, b) => {
        const attrA = getSearchableAttributes(a);
        const attrB = getSearchableAttributes(b);

        const catA = CATEGORY_PRIORITY[attrA.category] || 99;
        const catB = CATEGORY_PRIORITY[attrB.category] || 99;
        if (catA !== catB) return catA - catB;

        const rankA = RANK_PRIORITY[attrA.rank] || 99;
        const rankB = RANK_PRIORITY[attrB.rank] || 99;
        if (rankA !== rankB) return rankA - rankB;

        return (a.name || "").localeCompare(b.name || "");
      });
    }

    return result;
  }, [units, debouncedQuery, filters, fuse, sortBy, sortOrder]);

  return filteredUnits;
}
