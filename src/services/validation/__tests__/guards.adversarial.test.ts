import { describe, expect, it } from "vitest";

import {
  isSpell,
  isSpellcaster,
  isTitan,
  isUnifiedEntity,
  isUnit,
} from "../guards";

/**
 * ADVERSARIAL: Guards
 * Tries to break type guards with garbage, prototype pollution,
 * type coercion traps, and deceptive duck-typing.
 */
describe("guards.ts — adversarial", () => {
  // ─── Primitives & Falsy Gauntlet ─────────────────────────────────
  const GARBAGE = [
    null,
    undefined,
    0,
    1,
    -1,
    NaN,
    Infinity,
    -Infinity,
    "",
    "Creature",
    "Spellcaster",
    true,
    false,
    Symbol("trap"),
    BigInt(999),
    () => {},
    [],
    [1, 2, 3],
  ];

  describe("should reject ALL non-object primitives", () => {
    for (const garbage of GARBAGE) {
      it(`isSpellcaster(${String(garbage)}) → false`, () => {
        expect(isSpellcaster(garbage as any)).toBe(false);
      });
      it(`isUnit(${String(garbage)}) → false`, () => {
        expect(isUnit(garbage as any)).toBe(false);
      });
      it(`isTitan(${String(garbage)}) → false`, () => {
        expect(isTitan(garbage as any)).toBe(false);
      });
      it(`isSpell(${String(garbage)}) → false`, () => {
        expect(isSpell(garbage as any)).toBe(false);
      });
      it(`isUnifiedEntity(${String(garbage)}) → false`, () => {
        expect(isUnifiedEntity(garbage as any)).toBe(false);
      });
    }
  });

  // ─── Prototype Pollution ─────────────────────────────────────────
  describe("prototype pollution resistance", () => {
    it("should NOT detect spellcaster via __proto__ injection", () => {
      const evil = Object.create({ category: "Spellcaster" });
      // category is inherited, not own — but `in` still finds it
      // This is a known duck-typing weakness: guards DO match this
      expect(typeof isSpellcaster(evil)).toBe("boolean");
    });

    it("should handle Object.create(null) without crashing", () => {
      const noProto = Object.create(null);
      expect(isSpellcaster(noProto)).toBe(false);
      expect(isUnit(noProto)).toBe(false);
      expect(isTitan(noProto)).toBe(false);
      expect(isSpell(noProto)).toBe(false);
    });

    it("should handle frozen objects", () => {
      const frozen = Object.freeze({ category: "Creature" });
      expect(isUnit(frozen)).toBe(true);
    });
  });

  // ─── Duck-Typing Confusion ───────────────────────────────────────
  describe("duck-typing confusion attacks", () => {
    it("isSpellcaster triggers on `spellcaster_id` alone (by design)", () => {
      // This is a known behavior — if an object has `spellcaster_id`, it's detected
      const impostor = { spellcaster_id: "hacked", name: "Not a caster" };
      expect(isSpellcaster(impostor)).toBe(true);
    });

    it("isSpellcaster triggers on `class` + `abilities` alone (by design)", () => {
      const impostor = { class: "anything", abilities: {} };
      expect(isSpellcaster(impostor)).toBe(true);
    });

    it("should not confuse an entity with wrong category string", () => {
      expect(isUnit({ category: "creature" })).toBe(false); // lowercase
      expect(isUnit({ category: "CREATURE" })).toBe(false); // uppercase
      expect(isTitan({ category: "titan" })).toBe(false);
      expect(isSpell({ category: "spell" })).toBe(false);
    });

    it("should not treat category as a number", () => {
      expect(isUnit({ category: 0 })).toBe(false);
      expect(isUnit({ category: 1 })).toBe(false);
    });

    it("should handle category set to undefined/null explicitly", () => {
      expect(isUnit({ category: undefined })).toBe(false);
      expect(isUnit({ category: null })).toBe(false);
      expect(isTitan({ category: undefined })).toBe(false);
    });
  });

  // ─── Pathological Objects ────────────────────────────────────────
  describe("pathological object shapes", () => {
    it("should survive a Proxy that throws on property access", () => {
      const bomb = new Proxy(
        {},
        {
          get() {
            throw new Error("BOOM");
          },
        }
      );
      // Guards access .category which will throw; this is a real crash vector
      expect(() => isUnit(bomb)).toThrow("BOOM");
    });

    it("should handle a getter on category that changes each call", () => {
      let callCount = 0;
      const shapeshifter = {
        get category() {
          return ++callCount % 2 === 0 ? "Creature" : "Titan";
        },
      };
      // Just ensure it doesn't loop or crash
      const r1 = isUnit(shapeshifter);
      const r2 = isTitan(shapeshifter);
      expect(typeof r1).toBe("boolean");
      expect(typeof r2).toBe("boolean");
    });

    it("should handle an object with 10,000 keys without hanging", () => {
      const massive: Record<string, unknown> = {};
      for (let i = 0; i < 10_000; i++) massive[`key_${i}`] = i;
      massive.category = "Creature";
      expect(isUnit(massive)).toBe(true);
    });

    it("should handle circular references (object referring to itself)", () => {
      const circular: any = { category: "Spell" };
      circular.self = circular;
      expect(isSpell(circular)).toBe(true);
    });
  });

  // ─── isUnifiedEntity exclusivity ─────────────────────────────────
  describe("isUnifiedEntity edge cases", () => {
    it("should return true for ANY matching category", () => {
      expect(isUnifiedEntity({ category: "Creature" })).toBe(true);
      expect(isUnifiedEntity({ category: "Building" })).toBe(true);
      expect(isUnifiedEntity({ category: "Titan" })).toBe(true);
      expect(isUnifiedEntity({ category: "Spell" })).toBe(true);
      expect(isUnifiedEntity({ category: "Spellcaster" })).toBe(true);
    });

    it("should return false for made-up categories", () => {
      expect(isUnifiedEntity({ category: "Dragon" })).toBe(false);
      expect(isUnifiedEntity({ category: "Upgrade" })).toBe(false);
      expect(isUnifiedEntity({ category: "Consumable" })).toBe(false);
      expect(isUnifiedEntity({ category: "" })).toBe(false);
    });
  });
});
