import { useMemo } from "react";
import Fuse from "fuse.js";
import { UnifiedEntity } from "@/types/api";

interface FilterState {
  schools: string[];
  ranks: string[];
  categories: string[];
  classes: string[];
}

// Helper to extract filterable attributes safely
function getSearchableAttributes(entity: UnifiedEntity) {
  // Hero
  if ("hero_id" in entity) {
    return {
      category: "Spellcaster",
      school: "Spellcaster",     // Virtual School for filtering
      rank: "LEGENDARY",  // Virtual Rank
      class: entity.class || "Unknown",
      tags: ["Spellcaster", entity.name],
    };
  }
  // Consumable
  if ("consumable_id" in entity) {
    return {
      category: "Consumable",
      school: "Item",     // Virtual School
      rank: entity.rarity || "COMMON",
      class: "Item",
      tags: entity.tags || [],
    };
  }
  // Unit (Standard)
  return {
    category: entity.category,
    school: entity.magic_school,
    rank: entity.card_config.rank,
    class: "Unit",
    tags: entity.tags || [],
  };
}

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
    return result.filter((entity) => {
      const attrs = getSearchableAttributes(entity);

      // Magic Schools
      if (
        filters.schools.length > 0 &&
        !filters.schools.includes(attrs.school)
      ) {
        return false;
      }

      // Ranks
      if (
        filters.ranks.length > 0 &&
        !filters.ranks.includes(attrs.rank)
      ) {
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
  }, [units, searchQuery, filters, fuse]);

  return filteredUnits;
}
