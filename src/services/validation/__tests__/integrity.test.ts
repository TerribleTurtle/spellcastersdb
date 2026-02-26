import { describe, expect, it } from "vitest";

import { AllDataResponse, Unit } from "@/types/api";

import { validateIntegrity } from "../integrity-checker";

describe("Data Integrity Checker", () => {
  const mockData: AllDataResponse = {
    build_info: { version: "0.0.0", generated_at: "" },
    spellcasters: [],
    units: [],
    spells: [],
    titans: [],
    consumables: [],
    upgrades: [],
    infusions: [],
  };

  it("should detect duplicate unit IDs", () => {
    const data = {
      ...mockData,
      units: [
        { entity_id: "u1", category: "Creature" },
        { entity_id: "u1", category: "Building" },
      ] as unknown as Unit[],
    };

    const issues = validateIntegrity(data);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "error",
          message: expect.stringContaining("Duplicate Entity ID"),
        }),
      ])
    );
  });

  it("should detect duplicate spellcaster IDs", () => {
    const data = {
      ...mockData,
      spellcasters: [
        { entity_id: "sc1" },
        { entity_id: "sc1" },
      ] as unknown as any[],
    };

    const issues = validateIntegrity(data);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "error",
          path: "duplicate_check.spellcasters",
          message: expect.stringContaining("Duplicate Entity ID"),
        }),
      ])
    );
  });

  it("should not check duplicate upgrades (archetype-based, no entity_id)", () => {
    const data = {
      ...mockData,
      upgrades: [
        {
          class: "Conqueror",
          level_cap: 25,
          population_scaling: [],
          incantation_upgrades: [],
        },
        {
          class: "Duelist",
          level_cap: 25,
          population_scaling: [],
          incantation_upgrades: [],
        },
      ] as unknown as any[],
    };

    const issues = validateIntegrity(data);
    // No upgrade-related issues expected since we no longer check upgrade duplicates
    expect(issues.filter((i) => i.path.includes("upgrades")).length).toBe(0);
  });

  it("should detect broken spawner links on units", () => {
    const data = {
      ...mockData,
      units: [
        {
          entity_id: "spawner_unit",
          category: "Creature",
          mechanics: {
            spawner: [{ unit_id: "missing_unit", count: 1, trigger: "Death" }],
          },
        },
      ] as unknown as Unit[],
    };

    const issues = validateIntegrity(data);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "warning",
          path: "spawner_unit.mechanics.spawner",
          message: expect.stringContaining("spawns unknown unit_id"),
        }),
      ])
    );
  });

  it("should detect broken spawner links on spells", () => {
    const data = {
      ...mockData,
      spells: [
        {
          entity_id: "spawner_spell",
          mechanics: {
            spawner: [{ unit_id: "missing_unit", count: 1, trigger: "Spawn" }],
          },
        },
      ] as unknown as any[],
    };

    const issues = validateIntegrity(data);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "warning",
          path: "spawner_spell.mechanics.spawner",
        }),
      ])
    );
  });

  it("should not crash if mechanics are missing", () => {
    const data = {
      ...mockData,
      units: [{ entity_id: "u1" }] as unknown as Unit[],
      spells: [{ entity_id: "s1" }] as unknown as any[],
    };

    const issues = validateIntegrity(data);
    expect(issues).toHaveLength(0);
  });

  it("should pass for valid data", () => {
    const data = {
      ...mockData,
      units: [
        { entity_id: "u1", category: "Creature" },
        {
          entity_id: "spawner",
          category: "Creature",
          mechanics: {
            spawner: [{ unit_id: "u1", count: 1, trigger: "Death" }],
          },
        },
      ] as unknown as Unit[],
    };

    const issues = validateIntegrity(data);
    expect(issues).toHaveLength(0);
  });
});
