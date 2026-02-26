import { describe, expect, it } from "vitest";

import { Unit } from "@/types/api";
import { BrowserItem } from "@/types/browser";
import { EntityCategory } from "@/types/enums";

import {
  compareByCategoryPriority,
  compareByName,
  compareByRank,
  getComparator,
  groupItems,
} from "../sorting";

// --- Test Fixtures ---

const unitRank1: Unit = {
  entity_id: "u1",
  name: "A-Unit",
  rank: "I",
  category: EntityCategory.Creature,
  magic_school: "Elemental",
} as Unit;

const unitRank2: Unit = {
  entity_id: "u2",
  name: "B-Unit",
  rank: "II",
  category: EntityCategory.Creature,
  magic_school: "War",
} as Unit;

const unitRank3War: Unit = {
  entity_id: "u3",
  name: "C-Unit",
  rank: "III",
  category: EntityCategory.Creature,
  magic_school: "War",
} as Unit;

const unitElemental: Unit = {
  entity_id: "u4",
  name: "D-Unit",
  rank: "I",
  category: EntityCategory.Creature,
  magic_school: "Elemental",
} as Unit;

const spellcaster: BrowserItem = {
  entity_id: "sc1",
  name: "Z-Caster",
  category: EntityCategory.Spellcaster,
} as unknown as BrowserItem;

const _building: BrowserItem = {
  entity_id: "b1",
  name: "Tower",
  category: EntityCategory.Building,
  magic_school: "Astral",
  rank: "I",
} as unknown as BrowserItem;

// --- Comparator Tests ---

describe("Comparators", () => {
  it("compareByRank should sort I before II", () => {
    expect(compareByRank(unitRank1, unitRank2)).toBeLessThan(0);
  });

  it("compareByRank should default to 'I' for items without rank", () => {
    const noRank = { entity_id: "x", name: "X" } as unknown as BrowserItem;
    // Both default to "I", so should be 0
    expect(compareByRank(noRank, unitRank1)).toBe(0);
  });

  it("compareByName should sort alphabetically", () => {
    expect(compareByName(unitRank1, unitRank2)).toBeLessThan(0); // A < B
    expect(compareByName(unitRank2, unitRank1)).toBeGreaterThan(0);
    expect(compareByName(unitRank1, unitRank1)).toBe(0);
  });

  it("compareByCategoryPriority should prioritize Spellcasters over Units", () => {
    expect(compareByCategoryPriority(spellcaster, unitRank1)).toBeLessThan(0);
  });

  it("compareByCategoryPriority should default to priority 99 for unknown category", () => {
    const unknown = {
      entity_id: "x",
      name: "X",
      category: "FutureCategory",
    } as unknown as BrowserItem;
    // Unknown (99) should sort after Creature (2)
    expect(compareByCategoryPriority(unknown, unitRank1)).toBeGreaterThan(0);
  });

  it("compareByCategoryPriority should default to Spellcaster for items without category", () => {
    const noCategory = { entity_id: "x", name: "X" } as unknown as BrowserItem;
    // Defaults to "Spellcaster" (priority 1), same as spellcaster fixture
    expect(compareByCategoryPriority(noCategory, spellcaster)).toBe(0);
  });
});

// --- getComparator Tests ---

describe("getComparator", () => {
  it("'All' mode should sort by Rank then Name", () => {
    const cmp = getComparator("All");
    // unitRank1 (I, A-Unit) vs unitRank2 (II, B-Unit) → I < II
    expect(cmp(unitRank1, unitRank2)).toBeLessThan(0);
  });

  it("'Rank' mode should sort by Category Priority then Name", () => {
    const cmp = getComparator("Rank");
    // spellcaster (priority 1) vs unitRank1 (priority 2) → spellcaster first
    expect(cmp(spellcaster, unitRank1)).toBeLessThan(0);
  });

  it("'Magic School' mode should sort by Category Priority → Rank → Name", () => {
    const cmp = getComparator("Magic School");
    // Same category (Creature), different rank: I < II
    expect(cmp(unitRank1, unitRank2)).toBeLessThan(0);
    // Spellcaster (1) before Creature (2)
    expect(cmp(spellcaster, unitRank1)).toBeLessThan(0);
  });

  it("unknown/default mode should sort by Name only", () => {
    const cmp = getComparator("SomeFutureMode" as any);
    // A-Unit < B-Unit alphabetically
    expect(cmp(unitRank1, unitRank2)).toBeLessThan(0);
  });
});

// --- groupItems Tests ---

describe("groupItems", () => {
  const items = [unitRank2, spellcaster, unitRank1];

  it("should return empty array for empty items", () => {
    expect(groupItems([], "All")).toEqual([]);
    expect(groupItems([], "Rank")).toEqual([]);
    expect(groupItems([], "Magic School")).toEqual([]);
  });

  it("'All' mode should group by category in BROWSER_CATEGORY_ORDER", () => {
    const groups = groupItems(items, "All");
    expect(groups[0].title).toBe("Spellcasters");
    expect(groups[0].items[0].name).toBe("Z-Caster");
    expect(groups[1].title).toBe("Creatures");
    expect(groups[1].items[0].name).toBe("A-Unit");
    expect(groups[1].items[1].name).toBe("B-Unit");
  });

  it("'Rank' mode should group by rank constant order", () => {
    const groups = groupItems(items, "Rank");
    const rank1Group = groups.find((g) => g.title === "Rank I");
    const rank2Group = groups.find((g) => g.title === "Rank II");

    expect(rank1Group).toBeDefined();
    expect(rank1Group?.items).toContain(unitRank1);
    expect(rank2Group).toBeDefined();
    expect(rank2Group?.items).toContain(unitRank2);
  });

  it("'Rank' mode should exclude items without entity_id", () => {
    const noEntityId = { name: "Ghost" } as unknown as BrowserItem;
    const groups = groupItems([unitRank1, noEntityId], "Rank");
    const allItems = groups.flatMap((g) => g.items);
    expect(allItems).not.toContain(noEntityId);
  });

  it("'Magic School' mode should group by school constant order", () => {
    const schoolItems = [unitRank1, unitRank2, unitRank3War, unitElemental];
    const groups = groupItems(schoolItems, "Magic School");

    const elementalGroup = groups.find((g) => g.title === "Elemental");
    const warGroup = groups.find((g) => g.title === "War");

    expect(elementalGroup).toBeDefined();
    expect(elementalGroup!.items).toHaveLength(2); // unitRank1 + unitElemental
    expect(warGroup).toBeDefined();
    expect(warGroup!.items).toHaveLength(2); // unitRank2 + unitRank3War
  });

  it("'Magic School' mode should exclude items without entity_id", () => {
    const noEntityId = { name: "Ghost" } as unknown as BrowserItem;
    const groups = groupItems([unitRank1, noEntityId], "Magic School");
    const allItems = groups.flatMap((g) => g.items);
    expect(allItems).not.toContain(noEntityId);
  });

  it("'Magic School' mode should exclude items without magic_school", () => {
    const noSchool = {
      entity_id: "ns1",
      name: "No School",
      category: EntityCategory.Creature,
    } as unknown as BrowserItem;
    const groups = groupItems([unitRank1, noSchool], "Magic School");
    const allItems = groups.flatMap((g) => g.items);
    expect(allItems).not.toContain(noSchool);
  });

  it("should only emit groups that have items", () => {
    // Only creatures, no spells/titans/buildings
    const groups = groupItems([unitRank1], "All");
    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("Creatures");
  });
});
