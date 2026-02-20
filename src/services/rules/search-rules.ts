import { UnifiedEntity } from "@/types/api";

export const CATEGORY_PRIORITY: Record<string, number> = {
  Spellcaster: 1,
  Creature: 2,
  Building: 3,
  Spell: 4,
  Titan: 5,
  Consumable: 6,
  Item: 6,
};

export const RANK_PRIORITY: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  COMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
  TITAN: 0, // Ensure Titans are prioritized if rank is used
};

export interface SearchableAttributes {
  category: string;
  school: string;
  rank: string;
  class: string;
  tags: string[];
}

// Helper to extract filterable attributes safely
export function getSearchableAttributes(
  entity: UnifiedEntity
): SearchableAttributes {
  // Spellcaster
  if (entity.category === "Spellcaster") {
    return {
      category: "Spellcaster",
      school: "Spellcaster", // Virtual School for filtering
      rank: "LEGENDARY", // Virtual Rank
      class: entity.class || "Unknown",
      tags: ["Spellcaster", entity.name],
    };
  }
  // Consumable
  if (entity.category === "Consumable") {
    return {
      category: "Consumable",
      school: "Item", // Virtual School
      rank: entity.rarity || "COMMON",
      class: "Item",
      tags: entity.tags || [],
    };
  }
  // Titan
  if (entity.category === "Titan") {
    return {
      category: "Titan",
      school: entity.magic_school,
      rank: "TITAN",
      class: "Titan",
      tags: entity.tags || [],
    };
  }
  // Upgrade
  if (entity.category === "Upgrade") {
    return {
      category: "Upgrade",
      school: "Technology",
      rank: "UPGRADE",
      class: "Upgrade",
      tags: entity.tags || [],
    };
  }

  // Unit or Spell (Incantation)
  // Both have magic_school.
  // Unit has flat props. Spell might not (check interface).
  const rank = "rank" in entity && entity.rank ? entity.rank : "I";

  return {
    category: entity.category,
    school: entity.magic_school,
    rank: rank,
    class: "Unit",
    tags: entity.tags || [],
  };
}
