import { describe, expect, it } from "vitest";

import { EntityDisplayItem } from "../types";
import { getDamageDisplay } from "../utils";

describe("entity-card utils", () => {
  describe("getDamageDisplay", () => {
    it("should return undefined if item has no damage property", () => {
      const item = { name: "Test Item" } as unknown as EntityDisplayItem;
      expect(getDamageDisplay(item)).toBeUndefined();
    });

    it("should return undefined if item damage is falsy", () => {
      const item = {
        name: "Test Item",
        damage: 0,
      } as unknown as EntityDisplayItem;
      expect(getDamageDisplay(item)).toBeUndefined();
    });

    it("should return base damage if item has no mechanics", () => {
      const item = {
        name: "Test Unit",
        damage: 15,
      } as unknown as EntityDisplayItem;
      expect(getDamageDisplay(item)).toBe(15);
    });

    it("should return base damage if item has mechanics but no waves", () => {
      const item = {
        name: "Test Spell",
        damage: 20,
        mechanics: { some_other_prop: true },
      } as unknown as EntityDisplayItem;
      expect(getDamageDisplay(item)).toBe(20);
    });

    it("should return base damage if waves is 1", () => {
      const item = {
        name: "Test Spell",
        damage: 25,
        mechanics: { waves: 1 },
      } as unknown as EntityDisplayItem;
      expect(getDamageDisplay(item)).toBe(25);
    });

    it("should return 'damage x waves' string if waves > 1", () => {
      const item = {
        name: "Test Spell",
        damage: 10,
        mechanics: { waves: 3 },
      } as unknown as EntityDisplayItem;
      expect(getDamageDisplay(item)).toBe("10x3");
    });
  });
});
