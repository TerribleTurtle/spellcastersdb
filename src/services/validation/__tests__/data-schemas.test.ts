import { describe, expect, it } from "vitest";

import { EntityCategory } from "@/types/enums";

import {
  AllDataSchema,
  ConsumableSchema,
  DamageModifierSchema,
  InfusionSchema,
  MatchXPSchema,
  SpellSchema,
  SpellcasterSchema,
  TitanSchema,
  UnitSchema,
  UpgradeSchema,
} from "../data-schemas";

describe("data-schemas.ts", () => {
  describe("UnitSchema", () => {
    const validUnitBase = {
      entity_id: "u1",
      name: "Test Creature",
      magic_school: "Wild",
      description: "A valid creature",
      tags: [],
      health: 100,
    };

    it("should parse a valid Creature", () => {
      const creature = { ...validUnitBase, category: EntityCategory.Creature };
      expect(UnitSchema.parse(creature)).toBeDefined();
    });

    it("should parse a valid Building", () => {
      const building = { ...validUnitBase, category: EntityCategory.Building };
      expect(UnitSchema.parse(building)).toBeDefined();
    });

    it("should reject an invalid category", () => {
      const invalid = { ...validUnitBase, category: EntityCategory.Spell };
      expect(() => UnitSchema.parse(invalid)).toThrowError();
    });
    it("should accept a knowledge_cost of 0 or > 0", () => {
      const freeUnit = {
        ...validUnitBase,
        category: EntityCategory.Creature,
        knowledge_cost: 0,
      };
      expect(UnitSchema.parse(freeUnit)).toBeDefined();

      const paidUnit = {
        ...validUnitBase,
        category: EntityCategory.Creature,
        knowledge_cost: 500,
      };
      expect(UnitSchema.parse(paidUnit)).toBeDefined();
    });

    it("should reject invalid knowledge_cost values", () => {
      const negativeCost = {
        ...validUnitBase,
        category: EntityCategory.Creature,
        knowledge_cost: -1,
      };
      expect(() => UnitSchema.parse(negativeCost)).toThrowError();

      const floatCost = {
        ...validUnitBase,
        category: EntityCategory.Creature,
        knowledge_cost: 1.5,
      };
      expect(() => UnitSchema.parse(floatCost)).toThrowError();
    });
  });

  describe("SpellSchema", () => {
    const validSpell = {
      entity_id: "s1",
      name: "Test Spell",
      magic_school: "Elemental",
      description: "A spell",
      tags: [],
      category: EntityCategory.Spell,
    };

    it("should parse a valid Spell", () => {
      expect(SpellSchema.parse(validSpell)).toBeDefined();
    });

    it("should reject missing category", () => {
      const { category, ...rest } = validSpell;
      expect(() => SpellSchema.parse(rest)).toThrowError();
    });

    it("should accept knowledge_cost on spells", () => {
      const spellWithCost = { ...validSpell, knowledge_cost: 200 };
      expect(SpellSchema.parse(spellWithCost)).toBeDefined();
    });
  });

  describe("TitanSchema", () => {
    const validTitan = {
      entity_id: "t1",
      name: "Titan",
      category: EntityCategory.Titan,
      magic_school: "Titan",
      rank: "V",
      description: "Huge titan",
      tags: [],
      health: 5000,
      damage: 100,
      movement_speed: 10,
    };

    it("should parse a valid Titan without weak_points", () => {
      expect(TitanSchema.parse(validTitan)).toBeDefined();
    });

    it("should parse a valid Titan with weak_points", () => {
      const withWeakPoints = {
        ...validTitan,
        weak_points: [
          { location: "head", multiplier: 2, description: "Headshot" },
        ],
      };
      expect(TitanSchema.parse(withWeakPoints)).toBeDefined();
    });

    it("should reject weak_points multiplier < 1", () => {
      const badTitan = {
        ...validTitan,
        weak_points: [{ location: "head", multiplier: 0.5 }],
      };
      expect(() => TitanSchema.parse(badTitan)).toThrowError();
    });
  });

  describe("SpellcasterSchema", () => {
    it("should derive spellcaster_id from entity_id if missing", () => {
      const data = {
        entity_id: "sc_1",
        name: "Test Caster",
        health: 100,
        abilities: {
          passive: [],
          primary: { name: "P", description: "P" },
          defense: { name: "D", description: "D" },
          ultimate: { name: "U", description: "U" },
        },
      };

      const parsed = SpellcasterSchema.parse(data);
      expect(parsed.spellcaster_id).toBe("sc_1");
      expect(parsed.class).toBe("Unknown");
      expect(parsed.description).toBe("");
      expect(parsed.tags).toEqual([]);
    });
  });

  describe("UpgradeSchema", () => {
    it("should parse a valid archetype-based upgrade", () => {
      const data = {
        class: "Conqueror",
        level_cap: 25,
        population_scaling: [{ level: 5, population_cap: 10 }],
        incantation_upgrades: [
          {
            incantation_id: "spell_1",
            upgrades: [
              {
                name: "Power Up",
                description: "More damage",
                effect: { damage: 10 },
              },
            ],
          },
        ],
      };

      const parsed = UpgradeSchema.parse(data);
      expect(parsed.class).toBe("Conqueror");
    });

    it("should default class to 'Unknown' when neither class nor archetype is provided", () => {
      const data = {
        level_cap: 25,
        population_scaling: [],
        incantation_upgrades: [],
      };

      const parsed = UpgradeSchema.parse(data);
      expect(parsed.class).toBe("Unknown");
    });

    it("should allow missing description in upgrades and default to empty string", () => {
      const data = {
        class: "Duelist",
        level_cap: 25,
        population_scaling: [],
        incantation_upgrades: [
          {
            incantation_id: "spell_2",
            upgrades: [
              { name: "Fast Cast", effect: { speed: 10 } }, // no description
            ],
          },
        ],
      };

      const parsed = UpgradeSchema.parse(data);
      expect(parsed.incantation_upgrades[0].upgrades[0].description).toBe("");
    });
  });

  describe("ConsumableSchema", () => {
    it("should default missing tags to [] and set category", () => {
      const data = {
        entity_id: "c_1",
        name: "Health Potion",
      };

      const parsed = ConsumableSchema.parse(data);
      expect(parsed.tags).toEqual([]);
      expect(parsed.category).toBe(EntityCategory.Consumable);
      expect(parsed.description).toBe("");
    });
  });

  describe("InfusionSchema", () => {
    it("should parse a complete valid payload", () => {
      const data = {
        id: "inf_fire",
        name: "Fire Infusion",
        element: "Fire",
        allied_effect: { description: "Buffs" },
        enemy_effect: { description: "Burns" },
      };

      expect(InfusionSchema.parse(data)).toBeDefined();
    });
  });

  describe("Sub-Schemas", () => {
    /* Since ConditionSchema is not directly exported in data-schemas.ts,
       we test it via DamageModifierSchema which uses it */
    it("DamageModifierSchema should accept string and array target_types", () => {
      expect(
        DamageModifierSchema.parse({ target_type: "All", multiplier: 1.5 })
      ).toBeDefined();

      expect(
        DamageModifierSchema.parse({
          target_type: ["Building", "Creature"],
          multiplier: 1.5,
        })
      ).toBeDefined();
    });

    it("DamageModifierSchema should accept string and object conditions", () => {
      expect(
        DamageModifierSchema.parse({
          multiplier: 1.5,
          condition: "Burning",
        })
      ).toBeDefined();

      expect(
        DamageModifierSchema.parse({
          multiplier: 1.5,
          condition: { field: "hp", operator: "<", value: 50 },
        })
      ).toBeDefined();
    });
  });

  describe("MatchXPSchema", () => {
    it("should transform 'kills' to 'summoning' in MatchXP", () => {
      const data = {
        captures: {
          first_territory: 1000,
          regain_territory: 1500,
        },
        kills: {
          spellcaster_death: 250,
          rank_I: 50,
          rank_II: 100,
          rank_III: 300,
          rank_IV: 500,
        },
      };

      const parsed = MatchXPSchema.parse(data);
      // The frontend should see 'summoning' instead of 'kills'
      expect(parsed.summoning).toBeDefined();
      expect(parsed.summoning?.spellcaster_death).toBe(250);
      expect(parsed.summoning?.rank_I).toBe(50);

      // Strict type check to ensure 'kills' is omitted in resulting type
      // @ts-expect-error - 'kills' should be omitted from parsed output after transform to 'summoning'
      expect(parsed.kills).toBeUndefined();
    });

    it("should handle optional kills block safely", () => {
      const data = {
        captures: {
          first_territory: 1000,
        },
      };

      const parsed = MatchXPSchema.parse(data);
      expect(parsed.summoning).toBeUndefined();
    });
  });

  describe("AllDataSchema", () => {
    it("should parse a complete valid payload", () => {
      const data = {
        build_info: { version: "1.0", generated_at: "now" },
        spellcasters: [],
        units: [],
        spells: [],
        titans: [],
        consumables: [],
        upgrades: [],
        infusions: [],
      };

      expect(AllDataSchema.parse(data)).toBeDefined();
    });
  });
});
