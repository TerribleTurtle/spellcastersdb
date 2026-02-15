import { Unit, Spell, Titan, Spellcaster } from "./api";

export type SlotIndex = 0 | 1 | 2 | 3 | 4;


export type DragSourceType =
    | "BROWSER_CARD"
    | "DECK_SLOT"
    | "SPELLCASTER_SLOT"
    | "DECK_HEADER"; // For reordering decks (future/solo)

export type DropTargetType =
    | "DECK_SLOT"
    | "SPELLCASTER_SLOT"
    | "DECK_HEADER" // For auto-expand or "add to deck"
    | "DECK_BACKGROUND" // For snap-back (blocking void drops)
    | "VOID"; // Dropped outside valid area

export type DraggableEntity = Unit | Spell | Titan | Spellcaster;

export interface DragData<T = DraggableEntity> {
    type: DragSourceType;
    item: T; // Typed strictly
    
    // Source Information
    sourceDeckId?: string;
    sourceSlotIndex?: number;
    
    // For visual feedback
    previewUrl?: string;
}

export interface DropData {
    type: DropTargetType;
    
    // Target Information
    deckId?: string;
    slotIndex?: number;
    
    // Metadata
    accepts?: string[]; // e.g. ["Unit", "Titan"]
}

export const DND_TYPES = {
    DRAG_DATA: "current", // key in dnd-kit `active.data.current`
    DROP_DATA: "current", // key in dnd-kit `over.data.current`
};
