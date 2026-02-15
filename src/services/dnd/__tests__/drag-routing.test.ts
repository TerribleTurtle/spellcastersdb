import { describe, it, expect } from 'vitest';
import { DragRoutingService } from "../drag-routing";
import { Active, Over } from "@dnd-kit/core";
import { DragData, DropData } from "@/types/dnd";
import { EntityCategory, SlotType } from "@/types/enums";
import { Unit, Titan } from "@/types/api";

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

// Helper to create mock Active/Over objects
const createActive = (data: DragData): Active => ({
    id: "active-id",
    data: { current: data },
    rect: { current: { initial: null, translated: null } }
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
                sourceDeckId: "deck-1"
            };
            const active = createActive(dragData);
            
            const result = DragRoutingService.determineAction(active, null);
            
            expect(result).toEqual({
                type: "CLEAR_SLOT",
                index: 2,
                deckId: "deck-1"
            });
        });

        it("should return NO_OP when dropping BROWSER_CARD into void", () => {
             const dragData: DragData = {
                type: "BROWSER_CARD",
                item: mockUnit
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
                sourceDeckId: "d1"
            };
            const dropData: DropData = {
                type: "DECK_BACKGROUND",
                deckId: "d1"
            };
            
            const result = DragRoutingService.determineAction(createActive(dragData), createOver(dropData));
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
                accepts: [SlotType.Unit] 
            };
            
            const result = DragRoutingService.determineAction(createActive(dragData), createOver(dropData));
            expect(result.type).toBe("SET_SLOT");
        });

        it("should allow Titan -> Titan Slot", () => {
            const dragData: DragData = { type: "BROWSER_CARD", item: mockTitan };
            const dropData: DropData = { 
                type: "DECK_SLOT", 
                slotIndex: 0, 
                deckId: "d1", 
                accepts: [SlotType.Titan] 
            };
            
            const result = DragRoutingService.determineAction(createActive(dragData), createOver(dropData));
            expect(result.type).toBe("SET_SLOT");
        });

        it("should REJECT Unit -> Titan Slot", () => {
            const dragData: DragData = { type: "BROWSER_CARD", item: mockUnit };
            const dropData: DropData = { 
                type: "DECK_SLOT", 
                slotIndex: 0, 
                deckId: "d1", 
                accepts: [SlotType.Titan] 
            };
            
            const result = DragRoutingService.determineAction(createActive(dragData), createOver(dropData));
            expect(result.type).toBe("NO_OP");
        });

        it("should REJECT Titan -> Unit Slot", () => {
            const dragData: DragData = { type: "BROWSER_CARD", item: mockTitan };
            const dropData: DropData = { 
                type: "DECK_SLOT", 
                slotIndex: 1, 
                deckId: "d1", 
                accepts: [SlotType.Unit] 
            };
            
            const result = DragRoutingService.determineAction(createActive(dragData), createOver(dropData));
            expect(result.type).toBe("NO_OP");
        });

         it("should REJECT Unit -> Titan Slot (Move)", () => {
            const dragData: DragData = { 
                type: "DECK_SLOT", 
                item: mockUnit,
                sourceSlotIndex: 3,
                sourceDeckId: "d1"
            };
            const dropData: DropData = { 
                type: "DECK_SLOT", 
                slotIndex: 0, 
                deckId: "d1", 
                accepts: [SlotType.Titan] 
            };
            
            const result = DragRoutingService.determineAction(createActive(dragData), createOver(dropData));
            expect(result.type).toBe("NO_OP");
        });
    });
});
