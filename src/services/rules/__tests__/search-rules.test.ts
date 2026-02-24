import { describe, expect, it } from "vitest";

import { UnifiedEntity } from "@/types/api";

import { getSearchableAttributes } from "../search-rules";

// Helper to create a minimal entity with the required fields
function makeEntity(overrides: Record<string, unknown>): UnifiedEntity {
  return {
    entity_id: "e1",
    name: "Test Entity",
    category: "Creature",
    magic_school: "Wild",
    tags: ["tag1"],
    ...overrides,
  } as unknown as UnifiedEntity;
}

describe("getSearchableAttributes", () => {
  it("should return Spellcaster attributes", () => {
    const entity = makeEntity({
      category: "Spellcaster",
      name: "Archmage",
      class: "Enchanter",
    });
    const result = getSearchableAttributes(entity);

    expect(result).toEqual({
      category: "Spellcaster",
      school: "Spellcaster",
      rank: "LEGENDARY",
      class: "Enchanter",
      tags: ["Spellcaster", "Archmage"],
    });
  });

  it("should default Spellcaster class to 'Unknown' if missing", () => {
    const entity = makeEntity({ category: "Spellcaster", name: "Anon" });
    delete (entity as unknown as Record<string, unknown>).class;
    const result = getSearchableAttributes(entity);

    expect(result.class).toBe("Unknown");
  });

  it("should return Consumable attributes", () => {
    const entity = makeEntity({
      category: "Consumable",
      rarity: "RARE",
      tags: ["heal"],
    });
    const result = getSearchableAttributes(entity);

    expect(result).toEqual({
      category: "Consumable",
      school: "Item",
      rank: "RARE",
      class: "Item",
      tags: ["heal"],
    });
  });

  it("should default Consumable rank to 'COMMON' if rarity is missing", () => {
    const entity = makeEntity({ category: "Consumable" });
    const result = getSearchableAttributes(entity);

    expect(result.rank).toBe("COMMON");
  });

  it("should return Titan attributes", () => {
    const entity = makeEntity({
      category: "Titan",
      magic_school: "Order",
      tags: ["big"],
    });
    const result = getSearchableAttributes(entity);

    expect(result).toEqual({
      category: "Titan",
      school: "Order",
      rank: "TITAN",
      class: "Titan",
      tags: ["big"],
    });
  });

  it("should return Upgrade attributes", () => {
    const entity = makeEntity({
      category: "Upgrade",
      tags: ["speed"],
    });
    const result = getSearchableAttributes(entity);

    expect(result).toEqual({
      category: "Upgrade",
      school: "Technology",
      rank: "UPGRADE",
      class: "Upgrade",
      tags: ["speed"],
    });
  });

  it("should return Unit/Spell attributes with rank from entity", () => {
    const entity = makeEntity({
      category: "Creature",
      magic_school: "Chaos",
      rank: "III",
      tags: ["melee"],
    });
    const result = getSearchableAttributes(entity);

    expect(result).toEqual({
      category: "Creature",
      school: "Chaos",
      rank: "III",
      class: "Unit",
      tags: ["melee"],
    });
  });

  it("should default rank to 'I' when entity has no rank", () => {
    const entity = makeEntity({ category: "Creature", magic_school: "Wild" });
    const result = getSearchableAttributes(entity);

    expect(result.rank).toBe("I");
  });

  it("should handle entities with empty tags array", () => {
    const entity = makeEntity({
      category: "Titan",
      magic_school: "Order",
      tags: [],
    });
    const result = getSearchableAttributes(entity);

    expect(result.tags).toEqual([]);
  });
});
