import { Active, Over } from "@dnd-kit/core";
import { describe, expect, it } from "vitest";

import { Unit } from "@/types/api";
import { SlotType } from "@/types/deck";
import { EntityCategory } from "@/types/enums";

import { DragRoutingService } from "../drag-routing";

const mockUnit: Unit = {
  entity_id: "u-1",
  name: "Adversarial Unit",
  category: EntityCategory.Creature,
  rank: "I",
  magic_school: "Elemental",
  tags: [],
  description: "Test",
  health: 10,
  range: 10,
  movement_speed: 10,
  damage: 10,
};

// Helper functions to create minimal Drag/Drop objects
const createActive = (data: any): Active => ({
  id: "active-1",
  data: { current: data },
  rect: { current: { initial: null, translated: null } },
});

const createOver = (data: any): Over => ({
  id: "over-1",
  data: { current: data },
  rect: {} as any,
  disabled: false,
});

describe("drag-routing.ts - Adversarial Tests", () => {
  describe("determineAction - Attack Surface", () => {
    it("should safely reject drag events where item is null but type says BROWSER_CARD", () => {
      // Type is valid, but the item payload is null
      // Current implementation does `"spellcaster_id" in dragData.item` which crashes on null
      const active = createActive({ type: "BROWSER_CARD", item: null });
      const over = createOver({
        type: "DECK_SLOT",
        deckId: "d1",
        slotIndex: 1,
        accepts: [SlotType.Unit],
      });

      expect(() =>
        DragRoutingService.determineAction(active, over)
      ).not.toThrow();
      const result = DragRoutingService.determineAction(active, over);
      expect(result.type).toBe("NO_OP");
    });

    it("should safely reject NaN slot indices", () => {
      // NaN !== undefined passes the simple guard, but propagates a poison index
      const active = createActive({ type: "BROWSER_CARD", item: mockUnit });
      const over = createOver({
        type: "DECK_SLOT",
        deckId: "d1",
        slotIndex: NaN,
      });

      const result = DragRoutingService.determineAction(active, over);
      // It should ideally be NO_OP, because NaN is not a valid slot
      expect(result.type).toBe("NO_OP");
    });

    it("should safely reject negative sourceSlotIndex", () => {
      // from Slot to Slot
      const active = createActive({
        type: "DECK_SLOT",
        sourceDeckId: "d1",
        sourceSlotIndex: -1,
        item: mockUnit,
      });
      const over = createOver({
        type: "DECK_SLOT",
        deckId: "d1",
        slotIndex: 2,
        accepts: [SlotType.Unit],
      });

      const result = DragRoutingService.determineAction(active, over);
      expect(result.type).toBe("NO_OP");
    });

    it("should gracefully handle prototype pollution in dropData.type", () => {
      // Drop target shouldn't be matched by switch statements
      const active = createActive({ type: "BROWSER_CARD", item: mockUnit });
      const over = createOver({ type: "__proto__" });

      expect(() =>
        DragRoutingService.determineAction(active, over)
      ).not.toThrow();
      const result = DragRoutingService.determineAction(active, over);
      expect(result.type).toBe("NO_OP");
    });

    it("should not crash when dragging an item with empty entity_id/spellcaster_id string", () => {
      const activeItem = { ...mockUnit, spellcaster_id: "" };
      const active = createActive({ type: "BROWSER_CARD", item: activeItem });
      const over = createOver({ type: "DECK_HEADER", deckId: "d1" });

      expect(() =>
        DragRoutingService.determineAction(active, over)
      ).not.toThrow();
    });

    it("should gracefully handle invalid enums in 'accepts' array", () => {
      const active = createActive({ type: "BROWSER_CARD", item: mockUnit });
      const over = createOver({
        type: "DECK_SLOT",
        deckId: "d1",
        slotIndex: 1,
        accepts: ["INVALID_TYPE"],
      });

      const result = DragRoutingService.determineAction(active, over);
      expect(result.type).toBe("NO_OP"); // Should fail isCompatible check
    });
  });
});
