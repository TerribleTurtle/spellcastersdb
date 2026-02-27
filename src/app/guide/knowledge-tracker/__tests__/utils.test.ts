import { describe, expect, it } from "vitest";

import { UnifiedEntity } from "@/types/api";

import { groupCalculatorEntities } from "../utils";

// Mock entities for testing sorting and grouping
const entityA = {
  entity_id: "a",
  name: "Zeta",
  category: "Spellcaster",
  knowledge_cost: 100,
} as unknown as UnifiedEntity;

const entityB = {
  entity_id: "b",
  name: "Alpha",
  category: "Spellcaster",
  knowledge_cost: 200,
} as unknown as UnifiedEntity;

const entityC = {
  entity_id: "c",
  name: "Beta",
  category: "Creature",
  rank: "V",
  knowledge_cost: 300,
} as unknown as UnifiedEntity;

const entityD = {
  entity_id: "d",
  name: "Gamma",
  category: "Creature",
  rank: "I",
  knowledge_cost: 400,
} as unknown as UnifiedEntity;

const mockEntities = [entityA, entityB, entityC, entityD];

describe("groupCalculatorEntities", () => {
  it("groups and sorts by BROWSER_CATEGORY_ORDER then Rank then Name", () => {
    // Should group as:
    // Spellcasters: Alpha, Zeta
    // Creatures: Gamma (Rank I), Beta (Rank V)
    const result = groupCalculatorEntities(mockEntities, new Set(), false);

    expect(result).toHaveLength(2);

    expect(result[0].title).toBe("Spellcasters");
    expect(result[0].items[0].entity_id).toBe("b"); // Alpha (name asc)
    expect(result[0].items[1].entity_id).toBe("a"); // Zeta

    expect(result[1].title).toBe("Creatures");
    expect(result[1].items[0].entity_id).toBe("d"); // Gamma (Rank I)
    expect(result[1].items[1].entity_id).toBe("c"); // Beta (Rank V)
  });

  it("filters out owned items when hideOwned is true", () => {
    const ownedSet = new Set(["b", "d"]);
    const result = groupCalculatorEntities(mockEntities, ownedSet, true);

    // Alpha (b) and Gamma (d) hidden.
    // Spellcasters: Zeta
    // Creatures: Beta
    expect(result).toHaveLength(2);
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].entity_id).toBe("a");

    expect(result[1].items).toHaveLength(1);
    expect(result[1].items[0].entity_id).toBe("c");
  });

  it("keeps owned items but sorts them correctly when hideOwned is false", () => {
    const ownedSet = new Set(["b"]);
    const result = groupCalculatorEntities(mockEntities, ownedSet, false);

    // Alpha is owned, should still be in the list, sorting logic handles the rest
    expect(result[0].items).toHaveLength(2);
    expect(result[0].items.map((i) => i.entity_id)).toContain("b");
  });
});
