import { describe, expect, it } from "vitest";

import {
  STATS,
  STAT_STRATEGIES,
  getStatsStrategy,
} from "@/components/entity-card/stats-strategies";
import { EntityDisplayItem } from "@/components/entity-card/types";

describe("stats-strategies: knowledge_cost", () => {
  describe("STATS.knowledge_cost definition", () => {
    it("exists and has correct metadata", () => {
      expect(STATS.knowledge_cost).toBeDefined();
      expect(STATS.knowledge_cost.id).toBe("knowledge_cost");
      expect(STATS.knowledge_cost.label).toBe("Knowledge Cost");
      expect(STATS.knowledge_cost.colorClass).toBe("text-amber-400");
    });

    it("getValue returns the knowledge_cost when present", () => {
      const item = { knowledge_cost: 500 } as unknown as EntityDisplayItem;
      expect(STATS.knowledge_cost.getValue(item)).toBe(500);
    });

    it("getValue returns 0 when knowledge_cost is 0", () => {
      const item = { knowledge_cost: 0 } as unknown as EntityDisplayItem;
      expect(STATS.knowledge_cost.getValue(item)).toBe(0);
    });

    it("getValue returns undefined when knowledge_cost is absent", () => {
      const item = { name: "test" } as unknown as EntityDisplayItem;
      expect(STATS.knowledge_cost.getValue(item)).toBeUndefined();
    });
  });

  describe("STATS.knowledge_cost condition", () => {
    const condition = STATS.knowledge_cost.condition!;

    it("returns true when knowledge_cost > 0", () => {
      const item = { knowledge_cost: 500 } as unknown as EntityDisplayItem;
      expect(condition(item)).toBe(true);
    });

    it("returns false when knowledge_cost is 0 (free entity)", () => {
      const item = { knowledge_cost: 0 } as unknown as EntityDisplayItem;
      expect(condition(item)).toBe(false);
    });

    it("returns false when knowledge_cost is absent", () => {
      const item = { name: "test" } as unknown as EntityDisplayItem;
      expect(condition(item)).toBe(false);
    });

    it("returns false for negative knowledge_cost (defensive)", () => {
      const item = { knowledge_cost: -1 } as unknown as EntityDisplayItem;
      expect(condition(item)).toBe(false);
    });
  });

  describe("STAT_STRATEGIES arrays include knowledge_cost", () => {
    it("Unit strategy includes knowledge_cost", () => {
      const ids = STAT_STRATEGIES.Unit.map((s) => s.id);
      expect(ids).toContain("knowledge_cost");
    });

    it("Spell strategy includes knowledge_cost", () => {
      const ids = STAT_STRATEGIES.Spell.map((s) => s.id);
      expect(ids).toContain("knowledge_cost");
    });

    it("Titan strategy does NOT include knowledge_cost", () => {
      const ids = STAT_STRATEGIES.Titan.map((s) => s.id);
      expect(ids).not.toContain("knowledge_cost");
    });

    it("Spellcaster strategy does NOT include knowledge_cost", () => {
      const ids = STAT_STRATEGIES.Spellcaster.map((s) => s.id);
      expect(ids).not.toContain("knowledge_cost");
    });
  });

  describe("getStatsStrategy returns correct strategy", () => {
    it("returns Unit strategy (with knowledge_cost) for Creature", () => {
      const item = { category: "Creature" } as unknown as EntityDisplayItem;
      const strategy = getStatsStrategy(item);
      const ids = strategy.map((s) => s.id);
      expect(ids).toContain("knowledge_cost");
    });

    it("returns Unit strategy (with knowledge_cost) for Building", () => {
      const item = { category: "Building" } as unknown as EntityDisplayItem;
      const strategy = getStatsStrategy(item);
      const ids = strategy.map((s) => s.id);
      expect(ids).toContain("knowledge_cost");
    });

    it("returns Spell strategy (with knowledge_cost) for Spell", () => {
      const item = { category: "Spell" } as unknown as EntityDisplayItem;
      const strategy = getStatsStrategy(item);
      const ids = strategy.map((s) => s.id);
      expect(ids).toContain("knowledge_cost");
    });
  });
});
