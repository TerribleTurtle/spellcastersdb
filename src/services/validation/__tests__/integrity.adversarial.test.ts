import { describe, expect, it } from "vitest";

import { AllDataResponse } from "@/types/api";

import { validateIntegrity } from "../integrity-checker";

/**
 * ADVERSARIAL: Integrity Checker
 * Massive arrays, unicode entity IDs, empty mechanics, and N² worst cases.
 */

const BASE_DATA: AllDataResponse = {
  build_info: { version: "1.0", generated_at: "" },
  units: [],
  spells: [],
  spellcasters: [],
  titans: [],
  consumables: [],
  upgrades: [],
  infusions: [],
  _source: "test",
};

describe("integrity-checker.ts — adversarial", () => {
  // ─── Massive Duplicate Storm ─────────────────────────────────────
  it("should detect duplicates in a 1000-element array", () => {
    const units = Array.from({ length: 1000 }, () => ({
      entity_id: "same_id",
      name: "Clone",
      category: "Creature",
      health: 1,
      movement_speed: 1,
      magic_school: "Wild",
      tags: [],
      description: "",
      range: 1,
      damage: 1,
    })) as any;

    const issues = validateIntegrity({ ...BASE_DATA, units });
    // Should detect 999 duplicates
    expect(issues.length).toBe(999);
    expect(issues.every((i) => i.severity === "error")).toBe(true);
  });

  // ─── Unicode Entity IDs ──────────────────────────────────────────
  it("should correctly match unicode entity IDs in spawner check", () => {
    const units = [
      {
        entity_id: "🔥fire_unit",
        name: "Fire Unit",
        category: "Creature",
        health: 100,
        movement_speed: 5,
        magic_school: "Elemental",
        tags: [],
        description: "",
        range: 1,
        damage: 10,
        mechanics: {
          spawner: [{ unit_id: "🔥fire_unit" }], // self-spawn — valid
        },
      },
    ] as any;

    const issues = validateIntegrity({ ...BASE_DATA, units });
    expect(issues).toHaveLength(0);
  });

  it("should flag spawner pointing to non-existent unicode ID", () => {
    const units = [
      {
        entity_id: "🔥fire_unit",
        name: "Fire Unit",
        category: "Creature",
        health: 100,
        movement_speed: 5,
        magic_school: "Elemental",
        tags: [],
        description: "",
        range: 1,
        damage: 10,
        mechanics: {
          spawner: [{ unit_id: "❄️ice_unit" }], // doesn't exist
        },
      },
    ] as any;

    const issues = validateIntegrity({ ...BASE_DATA, units });
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("warning");
  });

  // ─── Empty/Undefined Mechanics ───────────────────────────────────
  it("should handle units with mechanics: undefined", () => {
    const units = [
      {
        entity_id: "no_mech",
        name: "Plain",
        category: "Creature",
        health: 1,
        movement_speed: 1,
        magic_school: "Wild",
        tags: [],
        description: "",
        range: 1,
        damage: 1,
        mechanics: undefined,
      },
    ] as any;
    const issues = validateIntegrity({ ...BASE_DATA, units });
    expect(issues).toHaveLength(0);
  });

  it("should handle units with mechanics: {} (empty object)", () => {
    const units = [
      {
        entity_id: "empty_mech",
        name: "Empty",
        category: "Creature",
        health: 1,
        movement_speed: 1,
        magic_school: "Wild",
        tags: [],
        description: "",
        range: 1,
        damage: 1,
        mechanics: {},
      },
    ] as any;
    const issues = validateIntegrity({ ...BASE_DATA, units });
    expect(issues).toHaveLength(0);
  });

  it("should handle units with mechanics.spawner: [] (empty array)", () => {
    const units = [
      {
        entity_id: "empty_spawner",
        name: "Empty Spawner",
        category: "Creature",
        health: 1,
        movement_speed: 1,
        magic_school: "Wild",
        tags: [],
        description: "",
        range: 1,
        damage: 1,
        mechanics: { spawner: [] },
      },
    ] as any;
    const issues = validateIntegrity({ ...BASE_DATA, units });
    expect(issues).toHaveLength(0);
  });

  // ─── Spell Spawner Cross-Reference ───────────────────────────────
  it("should check spawners on spells that reference unit IDs", () => {
    const units = [
      {
        entity_id: "valid_unit",
        name: "Valid",
        category: "Creature",
        health: 1,
        movement_speed: 1,
        magic_school: "Wild",
        tags: [],
        description: "",
        range: 1,
        damage: 1,
      },
    ] as any;
    const spells = [
      {
        entity_id: "spell_with_spawner",
        name: "Summon",
        category: "Spell",
        magic_school: "Wild",
        tags: [],
        description: "",
        mechanics: {
          spawner: [
            { unit_id: "valid_unit" }, // valid
            { unit_id: "ghost_unit" }, // invalid
          ],
        },
      },
    ] as any;

    const issues = validateIntegrity({ ...BASE_DATA, units, spells });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("ghost_unit");
  });

  // ─── Zero-Length Data ────────────────────────────────────────────
  it("should return 0 issues for completely empty data", () => {
    const issues = validateIntegrity(BASE_DATA);
    expect(issues).toHaveLength(0);
  });

  // ─── Upgrade data is now archetype-based ──────────────────────────
  it("should not detect duplicates in upgrades (archetype-based, no entity_id)", () => {
    const upgrades = [
      {
        archetype: "Conqueror",
        level_cap: 25,
        population_scaling: [],
        incantation_upgrades: [],
      },
      {
        archetype: "Duelist",
        level_cap: 25,
        population_scaling: [],
        incantation_upgrades: [],
      },
    ];

    const issues = validateIntegrity({ ...BASE_DATA, upgrades } as any);
    expect(issues.filter((i) => i.path.includes("upgrades")).length).toBe(0);
  });
});
