import { describe, expect, it } from "vitest";

import { EntityDisplayItem } from "../types";
import { getDamageDisplay } from "../utils";

describe("getDamageDisplay — Adversarial", () => {
  // ─── Negative Damage ──────────────────────────────────────────────
  it("should handle negative damage values", () => {
    const item = { name: "Cursed", damage: -5 } as unknown as EntityDisplayItem;
    // Negative damage should still pass the truthy check (it's non-zero)
    expect(getDamageDisplay(item)).toBe(-5);
  });

  it("should format negative damage with waves", () => {
    const item = {
      name: "Cursed Spell",
      damage: -10,
      mechanics: { waves: 3 },
    } as unknown as EntityDisplayItem;
    expect(getDamageDisplay(item)).toBe("-10x3");
  });

  // ─── NaN / Infinity / Exotic Numbers ──────────────────────────────
  it("should handle NaN damage", () => {
    const item = {
      name: "Broken",
      damage: NaN,
    } as unknown as EntityDisplayItem;
    // NaN is falsy, so should return undefined
    expect(getDamageDisplay(item)).toBeUndefined();
  });

  it("should handle Infinity damage", () => {
    const item = {
      name: "God Mode",
      damage: Infinity,
    } as unknown as EntityDisplayItem;
    expect(getDamageDisplay(item)).toBe(Infinity);
  });

  it("should handle Infinity damage with waves", () => {
    const item = {
      name: "God Spell",
      damage: Infinity,
      mechanics: { waves: 2 },
    } as unknown as EntityDisplayItem;
    expect(getDamageDisplay(item)).toBe("Infinityx2");
  });

  // ─── Fractional / Decimal Damage ──────────────────────────────────
  it("should handle fractional damage values", () => {
    const item = {
      name: "Precise",
      damage: 3.5,
    } as unknown as EntityDisplayItem;
    expect(getDamageDisplay(item)).toBe(3.5);
  });

  it("should display fractional damage with waves", () => {
    const item = {
      name: "Precise Spell",
      damage: 1.5,
      mechanics: { waves: 4 },
    } as unknown as EntityDisplayItem;
    expect(getDamageDisplay(item)).toBe("1.5x4");
  });

  // ─── Zero Waves ───────────────────────────────────────────────────
  it("should handle waves = 0 (falsy)", () => {
    const item = {
      name: "Zero Wave",
      damage: 10,
      mechanics: { waves: 0 },
    } as unknown as EntityDisplayItem;
    // waves is 0, which is falsy → mechanics.waves check fails → returns base damage
    expect(getDamageDisplay(item)).toBe(10);
  });

  it("should handle negative waves", () => {
    const item = {
      name: "Glitched",
      damage: 10,
      mechanics: { waves: -2 },
    } as unknown as EntityDisplayItem;
    // -2 > 1 is false → should return base damage
    expect(getDamageDisplay(item)).toBe(10);
  });

  // ─── String Damage (Type Coercion Trap) ────────────────────────────
  it("should handle string damage passed in (type coercion)", () => {
    const item = {
      name: "String Damage",
      damage: "15",
    } as unknown as EntityDisplayItem;
    // "15" is truthy and "in" operator will find it
    expect(getDamageDisplay(item)).toBe("15");
  });

  it("should handle string damage with waves (concatenation trap)", () => {
    const item = {
      name: "String Spell",
      damage: "15",
      mechanics: { waves: 3 },
    } as unknown as EntityDisplayItem;
    // Template literal: `${"15"}x${3}` = "15x3" — this actually works correctly
    expect(getDamageDisplay(item)).toBe("15x3");
  });

  // ─── Null / Undefined in Mechanics ─────────────────────────────────
  it("should handle mechanics with null waves", () => {
    const item = {
      name: "Null Waves",
      damage: 20,
      mechanics: { waves: null },
    } as unknown as EntityDisplayItem;
    expect(getDamageDisplay(item)).toBe(20);
  });

  it("should handle mechanics with undefined waves", () => {
    const item = {
      name: "Undef Waves",
      damage: 20,
      mechanics: { waves: undefined },
    } as unknown as EntityDisplayItem;
    expect(getDamageDisplay(item)).toBe(20);
  });

  // ─── Extremely Large Values ────────────────────────────────────────
  it("should handle MAX_SAFE_INTEGER damage with huge waves", () => {
    const item = {
      name: "Overflow",
      damage: Number.MAX_SAFE_INTEGER,
      mechanics: { waves: 999 },
    } as unknown as EntityDisplayItem;
    expect(getDamageDisplay(item)).toBe(`${Number.MAX_SAFE_INTEGER}x999`);
  });
});
