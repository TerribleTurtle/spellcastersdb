import { describe, expect, it } from "vitest";

import { Spell, Spellcaster, Unit } from "@/types/api";
import { BrowserItem } from "@/types/browser";
import { EntityCategory } from "@/types/enums";

import { FilterState, filterBrowserItems } from "../filtering";

// Mocks
const mockUnit: Unit = {
  entity_id: "unit-1",
  name: "Fire Warrior",
  category: EntityCategory.Creature,
  magic_school: "War",
  rank: "I",
  description: "A fierce warrior",
  tags: ["fire", "damage"],
  health: 100,
  movement_type: "Ground",
  movement_speed: 10,
};

const mockSpell: Spell = {
  entity_id: "spell-1",
  name: "Fireball",
  category: EntityCategory.Spell,
  magic_school: "Wild",
  rank: "II",
  description: "Explosive damage",
  tags: ["fire", "aoe"],
};

const mockSpellcaster: Spellcaster = {
  entity_id: "caster-1",
  spellcaster_id: "caster-1",
  name: "Pyromancer",
  category: EntityCategory.Spellcaster,
  class: "Duelist",
  tags: ["magic"],
  health: 200,
  abilities: {
    passive: [],
    primary: { name: "test", description: "test" },
    defense: { name: "test", description: "test" },
    ultimate: { name: "test", description: "test" },
  },
};

const mockItems: BrowserItem[] = [mockUnit, mockSpell, mockSpellcaster];

const defaultFilters: FilterState = {
  schools: [],
  ranks: [],
  categories: [],
  classes: [],
};

describe("filterBrowserItems", () => {
  it("should return all items when no filters or search query are active", () => {
    const result = filterBrowserItems(mockItems, "", defaultFilters);
    expect(result).toHaveLength(3);
  });

  it("should filter by search query (name)", () => {
    const result = filterBrowserItems(mockItems, "Fire", defaultFilters);
    expect(result).toHaveLength(2); // Fire Warrior, Fireball
    expect(result.map((i) => i.name)).toEqual(
      expect.arrayContaining(["Fire Warrior", "Fireball"])
    );
  });

  it("should filter by category", () => {
    const filters = { ...defaultFilters, categories: ["Creatures"] };
    const result = filterBrowserItems(mockItems, "", filters);
    expect(result).toHaveLength(1);
    expect(result[0].entity_id).toBe("unit-1");
  });

  it("should filter by magic school", () => {
    const filters = { ...defaultFilters, schools: ["War"] };
    const result = filterBrowserItems(mockItems, "", filters);
    expect(result).toHaveLength(1);
    expect(result[0].entity_id).toBe("unit-1");
  });

  it("should filter by rank", () => {
    const filters = { ...defaultFilters, ranks: ["II"] };
    const result = filterBrowserItems(mockItems, "", filters);
    expect(result).toHaveLength(1);
    expect(result[0].entity_id).toBe("spell-1");
  });

  it("should filter by spellcaster class", () => {
    const filters = { ...defaultFilters, classes: ["Duelist"] };
    const result = filterBrowserItems(mockItems, "", filters);
    expect(result).toHaveLength(1);
    expect(result[0].entity_id).toBe("caster-1");
  });

  it("should combine search and filters", () => {
    const filters = { ...defaultFilters, schools: ["War"] };
    const result = filterBrowserItems(mockItems, "Warrior", filters);
    expect(result).toHaveLength(1);
    expect(result[0].entity_id).toBe("unit-1");
  });

  it("should return empty array if no matches", () => {
    const result = filterBrowserItems(mockItems, "NonExistent", defaultFilters);
    expect(result).toHaveLength(0);
  });
});
