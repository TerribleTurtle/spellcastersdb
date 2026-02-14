import { Active, Over } from "@dnd-kit/core";
import { Unit, Spell, Titan, Spellcaster } from "@/types/api";
import { DragData, DropData } from "@/types/dnd";

export type DragAction =
  | { type: 'NO_OP' }
  | { type: 'MOVE_SLOT'; sourceIndex: number; targetIndex: number; deckId?: string; sourceDeckId?: string }
  | { type: 'SET_SLOT'; index: number; item: Unit | Spell | Titan; deckId?: string }
  | { type: 'CLEAR_SLOT'; index: number; deckId?: string }
  | { type: 'SET_SPELLCASTER'; item: Spellcaster; deckId?: string; sourceDeckId?: string }
  | { type: 'REMOVE_SPELLCASTER'; deckId?: string };

export const DragRoutingService = {
  determineAction(active: Active, over: Over | null): DragAction {
    if (!active.data.current || !over?.data.current) {
        return { type: 'NO_OP' };
    }

    const dragData = active.data.current as DragData;
    const dropData = over.data.current as DropData;

    // 1. Drop into Void (or invalid target)
    if (!over) {
        if (dragData.type === "DECK_SLOT" && dragData.sourceSlotIndex !== undefined) {
             return { type: 'CLEAR_SLOT', index: dragData.sourceSlotIndex, deckId: dragData.sourceDeckId };
        }
        if (dragData.type === "SPELLCASTER_SLOT") {
            return { type: 'REMOVE_SPELLCASTER', deckId: dragData.sourceDeckId };
        }
        return { type: 'NO_OP' };
    }

    // 2. Browser -> Slot
    if (dragData.type === "BROWSER_CARD" && dropData.type === "DECK_SLOT") {
        if (dropData.slotIndex === undefined) return { type: 'NO_OP' };
        
        // Type Guard
        const item = dragData.item as Unit | Spell | Titan;
        if (!item || "spellcaster_id" in item) return { type: 'NO_OP' }; // Safety

        return { 
            type: 'SET_SLOT', 
            index: dropData.slotIndex, 
            item, 
            deckId: dropData.deckId 
        };
    }

    // 3. Browser -> Header (Auto-Add)
    if (dragData.type === "BROWSER_CARD" && dropData.type === "DECK_HEADER") {
        // We return a special SET_SLOT with index -1 or let the hook handle finding the first empty slot?
        // Let's keep the action generic and let useDragDrop handle the "Find Slot" logic?
        // OR: We define a new Action 'ADD_TO_DECK'
        // For now, let's reuse SET_SLOT but we need to know WHICH slot. 
        // Logic: Routing Service shouldn't know about Deck State (filled slots).
        // LIMITATION: UseDragDrop needs to find the slot. 
        // So we return a specialized action or just handle it there.
        // Let's return a "SET_SLOT" with index -1 to signal "Auto"
        const item = dragData.item as Unit | Spell | Titan;
        if (!item || "spellcaster_id" in item) return { type: 'NO_OP' };

        return {
            type: 'SET_SLOT',
            index: -1, // Signal for "Find first empty"
            item,
            deckId: dropData.deckId
        };
    }

    // 4. Slot -> Slot (Move/Swap)
    if (dragData.type === "DECK_SLOT" && dropData.type === "DECK_SLOT") {
         if (dragData.sourceSlotIndex === undefined || dropData.slotIndex === undefined) return { type: 'NO_OP' };

         return {
             type: 'MOVE_SLOT',
             sourceIndex: dragData.sourceSlotIndex,
             targetIndex: dropData.slotIndex,
             sourceDeckId: dragData.sourceDeckId,
             deckId: dropData.deckId
         };
    }
    
    // 5. Slot -> Header (Move to another deck, auto-slot)
    if (dragData.type === "DECK_SLOT" && dropData.type === "DECK_HEADER") {
        if (dragData.sourceSlotIndex === undefined) return { type: 'NO_OP' };
        
        // Moving from a slot to a whole deck -> Find first empty slot in target
        return {
            type: 'MOVE_SLOT',
            sourceIndex: dragData.sourceSlotIndex,
            targetIndex: -1, // Signal Auto
            sourceDeckId: dragData.sourceDeckId,
            deckId: dropData.deckId
        };
    }

    // 6. Spellcaster Logic
    if (dragData.type === "BROWSER_CARD" && dropData.type === "SPELLCASTER_SLOT") {
        const item = dragData.item as Spellcaster;
        if (!item || !("spellcaster_id" in item)) return { type: 'NO_OP' };
        
        return {
            type: 'SET_SPELLCASTER',
            item,
            deckId: dropData.deckId
        };
    }
    
    if (dragData.type === "SPELLCASTER_SLOT" && dropData.type === "SPELLCASTER_SLOT") {
        // Move Spellcaster between decks
        // We need the item to set it? Or just the source deck?
        // The dragging item data has the spellcaster object.
        const item = dragData.item as Spellcaster;
         return {
            type: 'SET_SPELLCASTER',
            item,
            deckId: dropData.deckId,
            sourceDeckId: dragData.sourceDeckId
        };
    }

    return { type: 'NO_OP' };
  }
};
