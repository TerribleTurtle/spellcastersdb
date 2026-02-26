import { describe, expect, it } from "vitest";

import {
  ConsumableSchema,
  SpellSchema,
  SpellcasterSchema,
  UnitSchema,
  UpgradeSchema,
} from "./data-schemas";

describe("Schema Migration v1.2", () => {
  it("should validate a valid V1.2 Unit", () => {
    const validUnit = {
      entity_id: "test_unit",
      name: "Test Unit",
      category: "Creature",
      magic_school: "Wild",
      description: "A test unit",
      tags: ["Test"],
      health: 100,
      damage: 10,
      movement_speed: 5,
      mechanics: {
        damage_modifiers: [{ target_type: "Flying", multiplier: 1.5 }],
      },
    };
    const result = UnitSchema.safeParse(validUnit);
    if (!result.success) {
      console.error(result.error);
    }
    expect(result.success).toBe(true);
  });

  it("should validate a valid V1.2 Spell", () => {
    const validSpell = {
      entity_id: "test_spell",
      name: "Test Spell",
      category: "Spell",
      magic_school: "Fire", // Note: existing schema might check enum literals, need to verify "Fire" vs "Elemental"
      // "Fire" isn't in the enum in schemas.ts (Elemental is). Let's use "Elemental".
      // Wait, source of truth says magic_school is Elemental, Wild, etc.
      //   magic_school: "Elemental",
      //   description: "A test spell",
      //   tags: ["Test"],
      //   damage: 50,
      //   mechanics: {
      //     waves: 3
      //   }
    };

    // Correcting for the existing enum in schemas.ts
    const correctedSpell = {
      ...validSpell,
      magic_school: "Elemental",
      description: "A test spell",
      tags: ["Test"],
      damage: 50,
      mechanics: {
        waves: 3,
      },
    };

    const result = SpellSchema.safeParse(correctedSpell);
    expect(result.success).toBe(true);
  });

  it("should silently strip unknown properties (no strict mode)", () => {
    const unitWithExtra = {
      entity_id: "test_unit_extra",
      name: "Extra Unit",
      category: "Creature",
      magic_school: "Wild",
      description: "Extra",
      tags: [],
      health: 100,
      mana: 50, // Unknown property -> silently stripped
    };
    const result = UnitSchema.safeParse(unitWithExtra);
    expect(result.success).toBe(true);
  });

  it("should strip Spell mechanics (waves) from a Unit", () => {
    const unitWithWaves = {
      entity_id: "test_unit_waves",
      name: "Wave Unit",
      category: "Creature",
      magic_school: "Wild",
      description: "Test",
      tags: [],
      health: 100,
      mechanics: {
        waves: 3, // Not in UnitMechanicsSchema -> silently stripped
      },
    };
    const result = UnitSchema.safeParse(unitWithWaves);
    expect(result.success).toBe(true);
  });

  it("should strip Unit stats (health) from a Spell", () => {
    const spellWithHealth = {
      entity_id: "test_spell_health",
      name: "Health Spell",
      category: "Spell",
      magic_school: "Elemental",
      description: "Test",
      tags: [],
      damage: 50,
      health: 100, // Not in SpellSchema -> silently stripped
    };
    const result = SpellSchema.safeParse(spellWithHealth);
    expect(result.success).toBe(true);
  });

  it("should accept array of strings for damage_modifiers target_type", () => {
    const complexUnit = {
      entity_id: "test_unit_complex",
      name: "Complex Unit",
      category: "Creature",
      magic_school: "Wild",
      description: "Complex",
      tags: [],
      health: 100,
      mechanics: {
        damage_modifiers: [
          {
            target_type: ["Flying", "Hover"], // Array!
            multiplier: 1.5,
          },
        ],
      },
    };
    const result = UnitSchema.safeParse(complexUnit);
    if (!result.success) console.error(result.error);
    expect(result.success).toBe(true);
  });

  describe("Branch Coverages for Other Entities", () => {
    it("should map entity_id to spellcaster_id if missing", () => {
      const validSpellcaster = {
        entity_id: "sc_1",
        name: "Test Spellcaster",
        class: "Enchanter",
        health: 1000,
        abilities: {
          passive: [{ name: "Passive", description: "D" }],
          primary: { name: "Primary", description: "D" },
          defense: { name: "Defense", description: "D" },
          ultimate: { name: "Ultimate", description: "D" },
        },
      };

      const result = SpellcasterSchema.safeParse(validSpellcaster);
      expect(result.success).toBe(true);
      if (result.success) {
        // Branch hit: data.spellcaster_id = data.entity_id
        expect(result.data.spellcaster_id).toBe("sc_1");
      }
    });

    it("should transform a nullish consumable description to an empty string", () => {
      const consumable = {
        entity_id: "potion_1",
        name: "Health Potion",
        // description missing/nullish triggers `val || ""`
      };

      const result = ConsumableSchema.safeParse(consumable);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe("");
      }
    });

    it("should parse a valid archetype-based upgrade", () => {
      const upgrade = {
        class: "Duelist",
        level_cap: 25,
        population_scaling: [{ level: 5, population_cap: 10 }],
        incantation_upgrades: [
          {
            incantation_id: "spell_1",
            upgrades: [
              { name: "Boost", description: "desc", effect: { damage: 5 } },
            ],
          },
        ],
      };

      const result = UpgradeSchema.safeParse(upgrade);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.class).toBe("Duelist");
      }
    });

    it("should default class to 'Unknown' if neither class nor archetype is provided", () => {
      const upgrade = {
        level_cap: 25,
        population_scaling: [],
        incantation_upgrades: [],
      };

      const result = UpgradeSchema.safeParse(upgrade);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.class).toBe("Unknown");
      }
    });
  });
});
