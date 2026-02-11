
import { describe, it, expect } from "vitest";
import { UnitSchema, SpellSchema, MechanicsSchema } from "./schemas";

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
        damage_modifiers: [
            { target_type: "Flying", multiplier: 1.5 }
        ]
      }
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
            waves: 3
        }
    };


    const result = SpellSchema.safeParse(correctedSpell);
    expect(result.success).toBe(true);
  });

  it("should fail properties not in schema (Strictness Check - Unit)", () => {
    const invalidUnit = {
      entity_id: "test_unit_bad",
      name: "Bad Unit",
      category: "Creature",
      magic_school: "Wild",
      description: "Bad",
      tags: [],
      health: 100,
      mana: 50 // Unknown property -> Should fail now
    };
    const result = UnitSchema.safeParse(invalidUnit);
    expect(result.success).toBe(false); 
  });

  it("should fail if Unit has Spell mechanics (waves)", () => {
      const invalidUnit = {
        entity_id: "test_unit_waves",
        name: "Wave Unit",
        category: "Creature",
        magic_school: "Wild",
        description: "Bad",
        tags: [],
        health: 100,
        mechanics: {
            waves: 3 // Illegal on Unit
        }
      };
      const result = UnitSchema.safeParse(invalidUnit);
      expect(result.success).toBe(false);
  });

  it("should fail if Spell has Unit stats (health)", () => {
    const invalidSpell = {
      entity_id: "test_spell_health",
      name: "Health Spell",
      category: "Spell",
      magic_school: "Elemental",
      description: "Bad",
      tags: [],
      damage: 50,
      health: 100 // Illegal on Spell
    };
    const result = SpellSchema.safeParse(invalidSpell);
    expect(result.success).toBe(false);
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
                    multiplier: 1.5 
                }
            ]
        }
      };
      const result = UnitSchema.safeParse(complexUnit);
      if (!result.success) console.error(result.error);
      expect(result.success).toBe(true);
  });
});
