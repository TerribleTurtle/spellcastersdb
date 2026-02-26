import { describe, expect, it } from "vitest";

import {
  AllDataSchema,
  ConsumableSchema,
  InfusionSchema,
  SpellSchema,
  SpellcasterSchema,
  TitanSchema,
  UnitSchema,
  UpgradeSchema,
} from "../data-schemas";

/**
 * ADVERSARIAL: Zod Schema Parsing
 * Feeds garbage, overflow numbers, XSS payloads, empty objects,
 * wrong types, and massive arrays into every schema.
 */
describe("data-schemas.ts — adversarial", () => {
  // ─── Complete Garbage ────────────────────────────────────────────
  describe("total garbage input", () => {
    const GARBAGE = [
      null,
      undefined,
      0,
      "",
      true,
      [],
      "random string",
      42,
      NaN,
      Infinity,
    ];

    for (const garbage of GARBAGE) {
      it(`UnitSchema.safeParse(${JSON.stringify(garbage)}) should fail`, () => {
        expect(UnitSchema.safeParse(garbage).success).toBe(false);
      });
      it(`SpellSchema.safeParse(${JSON.stringify(garbage)}) should fail`, () => {
        expect(SpellSchema.safeParse(garbage).success).toBe(false);
      });
      it(`TitanSchema.safeParse(${JSON.stringify(garbage)}) should fail`, () => {
        expect(TitanSchema.safeParse(garbage).success).toBe(false);
      });
    }
  });

  // ─── Empty Object ───────────────────────────────────────────────
  describe("empty object attacks", () => {
    it("UnitSchema should reject {}", () => {
      expect(UnitSchema.safeParse({}).success).toBe(false);
    });
    it("SpellSchema should reject {}", () => {
      expect(SpellSchema.safeParse({}).success).toBe(false);
    });
    it("TitanSchema should reject {}", () => {
      expect(TitanSchema.safeParse({}).success).toBe(false);
    });
    it("SpellcasterSchema should reject {}", () => {
      expect(SpellcasterSchema.safeParse({}).success).toBe(false);
    });
    it("UpgradeSchema should accept {} and default class to 'Unknown'", () => {
      const result = UpgradeSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.class).toBe("Unknown");
      }
    });
    it("ConsumableSchema should reject {}", () => {
      expect(ConsumableSchema.safeParse({}).success).toBe(false);
    });
    it("InfusionSchema should reject {}", () => {
      expect(InfusionSchema.safeParse({}).success).toBe(false);
    });
  });

  // ─── XSS / Injection Payloads ───────────────────────────────────
  describe("XSS and injection payloads in string fields", () => {
    const XSS_PAYLOADS = [
      '<script>alert("xss")</script>',
      '"><img src=x onerror=alert(1)>',
      "{{constructor.constructor('return this')()}}",
      "${7*7}",
      "' OR 1=1 --",
      "\x00\x01\x02", // null bytes
      "a".repeat(100_000), // pathological length
    ];

    for (const payload of XSS_PAYLOADS) {
      it(`UnitSchema should accept or reject XSS in name field without crashing: "${payload.slice(0, 30)}..."`, () => {
        const result = UnitSchema.safeParse({
          entity_id: "xss_test",
          name: payload,
          category: "Creature",
          health: 100,
          movement_speed: 5,
          magic_school: "Wild",
          tags: [],
          description: "test",
          range: 1,
          damage: 10,
        });
        // We don't care if it passes or fails, just that it doesn't crash
        expect(typeof result.success).toBe("boolean");
      });
    }
  });

  // ─── Number Overflow ────────────────────────────────────────────
  describe("number boundary attacks", () => {
    it("TitanSchema should reject weak_points multiplier of 0", () => {
      const r = TitanSchema.safeParse({
        entity_id: "t_overflow",
        name: "Big",
        category: "Titan",
        rank: "V",
        health: 999,
        movement_speed: 1,
        magic_school: "Titan",
        tags: [],
        description: "desc",
        damage: 99,
        weak_points: [{ description: "weak", multiplier: 0 }],
      });
      expect(r.success).toBe(false);
    });

    it("TitanSchema should reject weak_points multiplier of -1", () => {
      const r = TitanSchema.safeParse({
        entity_id: "t_neg",
        name: "Neg",
        category: "Titan",
        rank: "V",
        health: 999,
        movement_speed: 1,
        magic_school: "Titan",
        tags: [],
        description: "desc",
        damage: 99,
        weak_points: [{ description: "weak", multiplier: -1 }],
      });
      expect(r.success).toBe(false);
    });

    it("TitanSchema should reject weak_points multiplier of exactly 1 (refinement is > 1)", () => {
      const r = TitanSchema.safeParse({
        entity_id: "t_one",
        name: "One",
        category: "Titan",
        rank: "V",
        health: 999,
        movement_speed: 1,
        magic_school: "Titan",
        tags: [],
        description: "desc",
        damage: 99,
        weak_points: [{ description: "weak", multiplier: 1 }],
      });
      expect(r.success).toBe(false);
    });

    it("TitanSchema should accept weak_points multiplier of Infinity (if not constrained)", () => {
      const r = TitanSchema.safeParse({
        entity_id: "t_inf",
        name: "Inf",
        category: "Titan",
        rank: "V",
        health: 999,
        movement_speed: 1,
        magic_school: "Titan",
        tags: [],
        description: "desc",
        damage: 99,
        weak_points: [{ description: "weak", multiplier: Infinity }],
      });
      // Zod allows Infinity for z.number() by default — just verify no crash
      expect(typeof r.success).toBe("boolean");
    });

    it("UnitSchema should reject knowledge_cost as NaN or Infinity", () => {
      const validUnit = {
        entity_id: "u_cost",
        name: "Cost",
        category: "Creature",
        health: 100,
        magic_school: "Wild",
        tags: [],
        description: "test",
      };

      expect(
        UnitSchema.safeParse({ ...validUnit, knowledge_cost: NaN }).success
      ).toBe(false);
      expect(
        UnitSchema.safeParse({ ...validUnit, knowledge_cost: Infinity }).success
      ).toBe(false);
    });

    it("UnitSchema should reject knowledge_cost as a string", () => {
      const validUnit = {
        entity_id: "u_cost",
        name: "Cost",
        category: "Creature",
        health: 100,
        magic_school: "Wild",
        tags: [],
        description: "test",
      };

      expect(
        UnitSchema.safeParse({ ...validUnit, knowledge_cost: "500" }).success
      ).toBe(false);
    });
  });

  // ─── UpgradeSchema Archetype Validation ───────────────────────────
  describe("UpgradeSchema archetype validation", () => {
    it("should accept unknown archetype strings (API drift resilience)", () => {
      const r = UpgradeSchema.safeParse({
        class: "InvalidClass",
        level_cap: 25,
        population_scaling: [],
        incantation_upgrades: [],
      });
      expect(r.success).toBe(true);
    });

    it("should reject archetype as a number", () => {
      const r = UpgradeSchema.safeParse({
        class: 42,
        level_cap: 25,
        population_scaling: [],
        incantation_upgrades: [],
      });
      expect(r.success).toBe(false);
    });

    it("should fail if population_scaling entries are missing level", () => {
      const r = UpgradeSchema.safeParse({
        class: "Conqueror",
        level_cap: 25,
        population_scaling: [{ population_cap: 10 }],
        incantation_upgrades: [],
      });
      expect(r.success).toBe(false);
    });

    it("should accept a valid archetype upgrade with all fields", () => {
      const r = UpgradeSchema.safeParse({
        class: "Enchanter",
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
      });
      expect(r.success).toBe(true);
    });
  });

  // ─── AllDataSchema with extra unknown keys ───────────────────────
  describe("AllDataSchema extra keys resilience", () => {
    it("should strip or ignore extra top-level keys", () => {
      const r = AllDataSchema.safeParse({
        build_info: { version: "1.0", generated_at: "2024-01-01" },
        units: [],
        spells: [],
        spellcasters: [],
        titans: [],
        consumables: [],
        upgrades: [],
        infusions: [],
        EVIL_KEY: "should be ignored",
        __proto__: { admin: true },
      });
      expect(r.success).toBe(true);
    });
  });

  // ─── Category Enum Strictness ────────────────────────────────────
  describe("strict enum enforcement", () => {
    it("UnitSchema should reject category 'Spell'", () => {
      const r = UnitSchema.safeParse({
        entity_id: "bad_cat",
        name: "Wrong",
        category: "Spell",
        health: 100,
        movement_speed: 5,
        magic_school: "Wild",
        tags: [],
        description: "test",
        range: 1,
        damage: 10,
      });
      expect(r.success).toBe(false);
    });

    it("SpellSchema should reject category 'Creature'", () => {
      const r = SpellSchema.safeParse({
        entity_id: "bad_spell",
        name: "Wrong",
        category: "Creature",
        magic_school: "Elemental",
        tags: [],
        description: "test",
      });
      expect(r.success).toBe(false);
    });
  });
});
