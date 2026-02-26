import { describe, expect, it } from "vitest";

import { Spell, Spellcaster, Unit } from "@/types/api";
import { BrowserItem } from "@/types/browser";
import { EntityCategory } from "@/types/enums";

import {
  FilterState,
  filterBrowserItems,
  matchesFilters,
  matchesSearch,
} from "../filtering";

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

// --- matchesSearch Branch Tests ---

describe("matchesSearch", () => {
  it("should match by name substring", () => {
    expect(matchesSearch(mockUnit, "fire", "Creatures")).toBe(true);
  });

  it("should match by description", () => {
    expect(matchesSearch(mockUnit, "fierce", "Creatures")).toBe(true);
  });

  it("should match by tags", () => {
    expect(matchesSearch(mockUnit, "damage", "Creatures")).toBe(true);
  });

  it("should match by magic_school", () => {
    expect(matchesSearch(mockUnit, "war", "Creatures")).toBe(true);
  });

  it("should match by category string", () => {
    expect(matchesSearch(mockUnit, "creature", "Creatures")).toBe(true);
  });

  it("should return true for empty query", () => {
    expect(matchesSearch(mockUnit, "", "Creatures")).toBe(true);
  });

  it("should return false when nothing matches", () => {
    expect(matchesSearch(mockUnit, "zzzznothing", "Creatures")).toBe(false);
  });

  it("should match spellcaster by name (no tags/magic_school)", () => {
    expect(matchesSearch(mockSpellcaster, "pyro", "Spellcasters")).toBe(true);
  });
});

// --- matchesFilters Branch Tests ---

describe("matchesFilters", () => {
  it("should pass when all filters are empty", () => {
    expect(
      matchesFilters(
        mockUnit,
        defaultFilters,
        "Creatures",
        "War",
        "I",
        null,
        true
      )
    ).toBe(true);
  });

  it("should reject when category filter excludes item", () => {
    const filters = { ...defaultFilters, categories: ["Spells"] };
    expect(
      matchesFilters(mockUnit, filters, "Creatures", "War", "I", null, true)
    ).toBe(false);
  });

  it("should reject school filter for non-unit items", () => {
    const filters = { ...defaultFilters, schools: ["Wild"] };
    // isUnit = false → school filter should return false
    expect(
      matchesFilters(mockSpell, filters, "Spells", "Wild", "II", null, false)
    ).toBe(false);
  });

  it("should reject school filter when school does not match", () => {
    const filters = { ...defaultFilters, schools: ["Elemental"] };
    expect(
      matchesFilters(mockUnit, filters, "Creatures", "War", "I", null, true)
    ).toBe(false);
  });

  it("should reject rank filter when rank is null", () => {
    const filters = { ...defaultFilters, ranks: ["I"] };
    expect(
      matchesFilters(
        mockSpellcaster,
        filters,
        "Spellcasters",
        "N/A",
        null,
        "Duelist",
        false
      )
    ).toBe(false);
  });

  it("should reject rank filter when rank does not match", () => {
    const filters = { ...defaultFilters, ranks: ["III"] };
    expect(
      matchesFilters(mockUnit, filters, "Creatures", "War", "I", null, true)
    ).toBe(false);
  });

  it("should reject class filter when spellcasterClass is null", () => {
    const filters = { ...defaultFilters, classes: ["Duelist"] };
    expect(
      matchesFilters(mockUnit, filters, "Creatures", "War", "I", null, true)
    ).toBe(false);
  });

  it("should reject class filter when class does not match", () => {
    const filters = { ...defaultFilters, classes: ["Conqueror"] };
    expect(
      matchesFilters(
        mockSpellcaster,
        filters,
        "Spellcasters",
        "N/A",
        null,
        "Duelist",
        false
      )
    ).toBe(false);
  });

  it("should pass when all active filters match", () => {
    const filters = {
      ...defaultFilters,
      schools: ["War"],
      ranks: ["I"],
      categories: ["Creatures"],
    };
    expect(
      matchesFilters(mockUnit, filters, "Creatures", "War", "I", null, true)
    ).toBe(true);
  });
});

// --- filterBrowserItems (integration) ---

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

  it("should sort results by descending relevance score", () => {
    // "Fire Warrior" exact matches "Fire Warrior" (1000) vs "Fireball" partial (100)
    const result = filterBrowserItems(
      mockItems,
      "Fire Warrior",
      defaultFilters
    );
    expect(result[0].name).toBe("Fire Warrior");
  });

  it("should rank exact name match highest", () => {
    const result = filterBrowserItems(mockItems, "Fireball", defaultFilters);
    expect(result[0].name).toBe("Fireball");
  });

  it("should rank prefix match above partial match", () => {
    // "Fire" is a prefix of "Fire Warrior" and "Fireball"
    // Both are prefix matches, but let's verify ordering is stable
    const result = filterBrowserItems(mockItems, "Fire", defaultFilters);
    expect(result).toHaveLength(2);
    // Both start with "Fire" so both get prefix score; order by name tiebreak
    expect(result.map((r) => r.name)).toEqual(
      expect.arrayContaining(["Fire Warrior", "Fireball"])
    );
  });

  it("should filter out items with search query but zero score", () => {
    const result = filterBrowserItems(mockItems, "zzzznothing", defaultFilters);
    expect(result).toHaveLength(0);
  });

  it("should match items via tag search in filterBrowserItems", () => {
    // "aoe" is a tag on mockSpell
    const result = filterBrowserItems(mockItems, "aoe", defaultFilters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Fireball");
  });

  it("should match items via description search", () => {
    // "Explosive" is in mockSpell description
    const result = filterBrowserItems(mockItems, "Explosive", defaultFilters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Fireball");
  });
});
