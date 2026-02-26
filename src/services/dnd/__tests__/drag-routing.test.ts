import { Active, Over } from "@dnd-kit/core";
import { describe, expect, it } from "vitest";

import { Spellcaster, Titan, Unit } from "@/types/api";
import { DragData, DropData } from "@/types/dnd";
import { EntityCategory, SlotType } from "@/types/enums";

import { DragRoutingService } from "../drag-routing";

const mockUnit: Unit = {
  entity_id: "unit-1",
  name: "Archer",
  category: EntityCategory.Unit,
  // Add other required fields if strictly needed by types, but casting usually suffices for tests if interface is loose
} as unknown as Unit;

const mockTitan: Titan = {
  entity_id: "titan-1",
  name: "Colossus",
  category: EntityCategory.Titan,
} as unknown as Titan;

const mockSpellcaster: Spellcaster = {
  entity_id: "sc-1",
  spellcaster_id: "sc-1",
  name: "Test Caster",
  category: EntityCategory.Spellcaster,
} as unknown as Spellcaster;

// Helper to create mock Active/Over objects
const createActive = (data: DragData): Active => ({
  id: "active-id",
  data: { current: data },
  rect: { current: { initial: null, translated: null } },
});

const createOver = (data: DropData): Over => ({
  id: "over-id",
  data: { current: data },
  rect: { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 },
  disabled: false,
});

describe("DragRoutingService", () => {
  describe("Void Drops", () => {
    it("should return CLEAR_SLOT when dropping a DECK_SLOT into void", () => {
      const dragData: DragData = {
        type: "DECK_SLOT",
        item: mockUnit,
        sourceSlotIndex: 2,
        sourceDeckId: "deck-1",
      };
      const active = createActive(dragData);

      const result = DragRoutingService.determineAction(active, null);

      expect(result).toEqual({
        type: "CLEAR_SLOT",
        index: 2,
        deckId: "deck-1",
      });
    });

    it("should return NO_OP when dropping BROWSER_CARD into void", () => {
      const dragData: DragData = {
        type: "BROWSER_CARD",
        item: mockUnit,
      };
      const active = createActive(dragData);

      const result = DragRoutingService.determineAction(active, null);
      expect(result).toEqual({ type: "NO_OP" });
    });

    it("should return NO_OP when dropping DECK_SLOT into DECK_BACKGROUND", () => {
      const dragData: DragData = {
        type: "DECK_SLOT",
        item: mockUnit,
        sourceSlotIndex: 1,
        sourceDeckId: "d1",
      };
      const dropData: DropData = {
        type: "DECK_BACKGROUND",
        deckId: "d1",
      };

      const result = DragRoutingService.determineAction(
        createActive(dragData),
        createOver(dropData)
      );
      expect(result).toEqual({ type: "NO_OP" });
    });
  });

  describe("Slot Validation", () => {
    it("should allow Unit -> Unit Slot", () => {
      const dragData: DragData = { type: "BROWSER_CARD", item: mockUnit };
      const dropData: DropData = {
        type: "DECK_SLOT",
        slotIndex: 1,
        deckId: "d1",
        accepts: [SlotType.Unit],
      };

      const result = DragRoutingService.determineAction(
        createActive(dragData),
        createOver(dropData)
      );
      expect(result.type).toBe("SET_SLOT");
    });

    it("should allow Titan -> Titan Slot", () => {
      const dragData: DragData = { type: "BROWSER_CARD", item: mockTitan };
      const dropData: DropData = {
        type: "DECK_SLOT",
        slotIndex: 0,
        deckId: "d1",
        accepts: [SlotType.Titan],
      };

      const result = DragRoutingService.determineAction(
        createActive(dragData),
        createOver(dropData)
      );
      expect(result.type).toBe("SET_SLOT");
    });

    it("should REJECT Unit -> Titan Slot", () => {
      const dragData: DragData = { type: "BROWSER_CARD", item: mockUnit };
      const dropData: DropData = {
        type: "DECK_SLOT",
        slotIndex: 0,
        deckId: "d1",
        accepts: [SlotType.Titan],
      };

      const result = DragRoutingService.determineAction(
        createActive(dragData),
        createOver(dropData)
      );
      expect(result.type).toBe("NO_OP");
    });

    it("should REJECT Titan -> Unit Slot", () => {
      const dragData: DragData = { type: "BROWSER_CARD", item: mockTitan };
      const dropData: DropData = {
        type: "DECK_SLOT",
        slotIndex: 1,
        deckId: "d1",
        accepts: [SlotType.Unit],
      };

      const result = DragRoutingService.determineAction(
        createActive(dragData),
        createOver(dropData)
      );
      expect(result.type).toBe("NO_OP");
    });

    it("should REJECT Unit -> Titan Slot (Move)", () => {
      const dragData: DragData = {
        type: "DECK_SLOT",
        item: mockUnit,
        sourceSlotIndex: 3,
        sourceDeckId: "d1",
      };
      const dropData: DropData = {
        type: "DECK_SLOT",
        slotIndex: 0,
        deckId: "d1",
        accepts: [SlotType.Titan],
      };

      const result = DragRoutingService.determineAction(
        createActive(dragData),
        createOver(dropData)
      );
      expect(result.type).toBe("NO_OP");
    });
  });

  // --- New Branch Tests ---

  describe("Additional Void Drop Branches", () => {
    it("should return REMOVE_SPELLCASTER when dropping SPELLCASTER_SLOT into void", () => {
      const active = createActive({
        type: "SPELLCASTER_SLOT",
        sourceDeckId: "d1",
      } as any);
      const result = DragRoutingService.determineAction(active, null);
      expect(result).toEqual({ type: "REMOVE_SPELLCASTER", deckId: "d1" });
    });

    it("should return NO_OP when dropping DECK_SLOT without sourceSlotIndex into void", () => {
      const active = createActive({
        type: "DECK_SLOT",
        item: mockUnit,
        sourceDeckId: "d1",
      } as any);
      const result = DragRoutingService.determineAction(active, null);
      expect(result).toEqual({ type: "NO_OP" });
    });

    it("should return NO_OP when active.data.current is missing", () => {
      const active: Active = {
        id: "a",
        data: { current: undefined },
        rect: { current: { initial: null, translated: null } },
      };
      const result = DragRoutingService.determineAction(active, null);
      expect(result).toEqual({ type: "NO_OP" });
    });
  });

  describe("Browser -> Slot Logic", () => {
    it("should return NO_OP if target slotIndex is missing", () => {
      const result = DragRoutingService.determineAction(
        createActive({ type: "BROWSER_CARD", item: mockUnit }),
        createOver({ type: "DECK_SLOT", deckId: "d1" } as any)
      );
      expect(result).toEqual({ type: "NO_OP" });
    });

    it("should return NO_OP if item is a Spellcaster (safety guard)", () => {
      const result = DragRoutingService.determineAction(
        createActive({ type: "BROWSER_CARD", item: mockSpellcaster }),
        createOver({
          type: "DECK_SLOT",
          slotIndex: 1,
          deckId: "d1",
          accepts: [SlotType.Unit],
        })
      );
      expect(result).toEqual({ type: "NO_OP" });
    });

    it("should allow placement if slot has no 'accepts' constraint", () => {
      const result = DragRoutingService.determineAction(
        createActive({ type: "BROWSER_CARD", item: mockUnit }),
        createOver({ type: "DECK_SLOT", slotIndex: 1, deckId: "d1" })
      );
      expect(result).toEqual({
        type: "SET_SLOT",
        index: 1,
        item: mockUnit,
        deckId: "d1",
      });
    });
  });

  describe("Browser -> Header (Auto-Add)", () => {
    it("should return SET_SLOT with index -1 for valid unit", () => {
      const result = DragRoutingService.determineAction(
        createActive({ type: "BROWSER_CARD", item: mockUnit }),
        createOver({ type: "DECK_HEADER", deckId: "d1" })
      );
      expect(result).toEqual({
        type: "SET_SLOT",
        index: -1,
        item: mockUnit,
        deckId: "d1",
      });
    });

    it("should return NO_OP for spellcaster item", () => {
      const result = DragRoutingService.determineAction(
        createActive({ type: "BROWSER_CARD", item: mockSpellcaster }),
        createOver({ type: "DECK_HEADER", deckId: "d1" })
      );
      expect(result).toEqual({ type: "NO_OP" });
    });
  });

  describe("Slot -> Slot (Move)", () => {
    it("should return NO_OP if sourceSlotIndex is missing", () => {
      const result = DragRoutingService.determineAction(
        createActive({ type: "DECK_SLOT", item: mockUnit, sourceDeckId: "d1" }),
        createOver({
          type: "DECK_SLOT",
          slotIndex: 2,
          deckId: "d1",
          accepts: [SlotType.Unit],
        })
      );
      expect(result).toEqual({ type: "NO_OP" });
    });

    it("should return NO_OP if target slotIndex is missing", () => {
      const result = DragRoutingService.determineAction(
        createActive({
          type: "DECK_SLOT",
          item: mockUnit,
          sourceSlotIndex: 1,
          sourceDeckId: "d1",
        }),
        createOver({
          type: "DECK_SLOT",
          deckId: "d1",
          accepts: [SlotType.Unit],
        })
      );
      expect(result).toEqual({ type: "NO_OP" });
    });

    it("should return MOVE_SLOT for valid move", () => {
      const result = DragRoutingService.determineAction(
        createActive({
          type: "DECK_SLOT",
          item: mockUnit,
          sourceSlotIndex: 1,
          sourceDeckId: "d1",
        }),
        createOver({
          type: "DECK_SLOT",
          slotIndex: 2,
          deckId: "d1",
          accepts: [SlotType.Unit],
        })
      );
      expect(result).toEqual({
        type: "MOVE_SLOT",
        sourceIndex: 1,
        targetIndex: 2,
        sourceDeckId: "d1",
        deckId: "d1",
      });
    });
  });

  describe("Slot -> Header (Auto-Slot Cross-Deck)", () => {
    it("should return MOVE_SLOT with targetIndex -1 for valid cross-deck move", () => {
      const result = DragRoutingService.determineAction(
        createActive({
          type: "DECK_SLOT",
          item: mockUnit,
          sourceSlotIndex: 1,
          sourceDeckId: "d1",
        }),
        createOver({ type: "DECK_HEADER", deckId: "d2" })
      );
      expect(result).toEqual({
        type: "MOVE_SLOT",
        sourceIndex: 1,
        targetIndex: -1,
        sourceDeckId: "d1",
        deckId: "d2",
      });
    });

    it("should return NO_OP if sourceSlotIndex is missing", () => {
      const result = DragRoutingService.determineAction(
        createActive({ type: "DECK_SLOT", item: mockUnit, sourceDeckId: "d1" }),
        createOver({ type: "DECK_HEADER", deckId: "d2" })
      );
      expect(result).toEqual({ type: "NO_OP" });
    });
  });

  describe("Spellcaster Logic", () => {
    it("should return SET_SPELLCASTER when dropping Spellcaster from Browser to Spellcaster Slot", () => {
      const result = DragRoutingService.determineAction(
        createActive({ type: "BROWSER_CARD", item: mockSpellcaster }),
        createOver({ type: "SPELLCASTER_SLOT", deckId: "d1" })
      );
      expect(result).toEqual({
        type: "SET_SPELLCASTER",
        item: mockSpellcaster,
        deckId: "d1",
      });
    });

    it("should return NO_OP when dropping non-Spellcaster from Browser to Spellcaster Slot", () => {
      const result = DragRoutingService.determineAction(
        createActive({ type: "BROWSER_CARD", item: mockUnit }),
        createOver({ type: "SPELLCASTER_SLOT", deckId: "d1" })
      );
      expect(result).toEqual({ type: "NO_OP" });
    });

    it("should return SET_SPELLCASTER for cross-deck Spellcaster move", () => {
      const result = DragRoutingService.determineAction(
        createActive({
          type: "SPELLCASTER_SLOT",
          item: mockSpellcaster,
          sourceDeckId: "d1",
        }),
        createOver({ type: "SPELLCASTER_SLOT", deckId: "d2" })
      );
      expect(result).toEqual({
        type: "SET_SPELLCASTER",
        item: mockSpellcaster,
        sourceDeckId: "d1",
        deckId: "d2",
      });
    });
  });
});
