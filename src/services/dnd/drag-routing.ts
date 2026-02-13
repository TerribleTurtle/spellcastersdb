import { Active, Over, UniqueIdentifier } from "@dnd-kit/core";
import { Unit, Spell, Titan, Spellcaster } from "@/types/api";
export type SlotIndex = 0 | 1 | 2 | 3 | 4;

export type DragAction =
  | { type: 'NO_OP' }
  | { type: 'MOVE_SLOT'; sourceIndex: number; targetIndex: number; deckId?: string; sourceDeckId?: string }
  | { type: 'SET_SLOT'; index: number; item: Unit | Spell | Titan; deckId?: string }
  | { type: 'CLEAR_SLOT'; index: number; deckId?: string }
  | { type: 'SET_SPELLCASTER'; item: Spellcaster; deckId?: string; sourceDeckId?: string }
  | { type: 'REMOVE_SPELLCASTER'; deckId?: string };
import { 
  TITAN_SLOT_INDEX, 
  SLOT_DRAG_PREFIX, 
  SLOT_PREFIX,
  SPELLCASTER_SLOT_DRAG_ID,
  SPELLCASTER_ZONE_ID
} from "@/services/config/constants";

// --- Helpers (Migrated from dropStrategies.ts) ---

export interface ActiveDragData {
  item?: Unit | Spellcaster | Spell | Titan;
  unit?: Unit | Spell | Titan;
  spellcaster?: Spellcaster;
  type?: string;
  deckId?: string; // Added deckId to data
  index?: number;  // Added index to data
}

export function isValidSlotIndex(index: number): index is SlotIndex {
  return index >= 0 && index <= TITAN_SLOT_INDEX;
}

export function extractDragItem(data: unknown): Unit | Spellcaster | Spell | Titan | null {
  if (!data || typeof data !== 'object') return null;
  const typedData = data as ActiveDragData;
  
  if ("item" in typedData) return typedData.item ?? null;
  if ("unit" in typedData) return typedData.unit ?? null;
  if ("spellcaster" in typedData) return typedData.spellcaster ?? null;
  return null; 
}

export function isSlotDrag(activeId: UniqueIdentifier): boolean {
  return activeId.toString().startsWith(SLOT_DRAG_PREFIX);
}

export function isSpellcasterDrag(activeId: UniqueIdentifier): boolean {
    return activeId.toString().includes(SPELLCASTER_SLOT_DRAG_ID);
}

// FORMAT: slot-drag-{deckId}-{index} OR slot-drag-{index} (Legacy/Solo)
export function parseSlotId(id: string, prefix: string): { index: number, deckId?: string } {
    const remainder = id.replace(prefix, "");
    const parts = remainder.split('-');

    // If we have more than 1 part, it's likely deckId-index
    if (parts.length > 1) {
        // The last part is ALWAYS the index
        const indexStr = parts.pop();
        const deckId = parts.join('-'); // Rejoin the rest as ID (in case ID has dashes)
        const index = parseInt(indexStr || "", 10);
        return { index, deckId };
    }

    // Legacy/Simple format
    return { index: parseInt(remainder, 10) };
}

export function getSwapSource(activeId: UniqueIdentifier): { index: SlotIndex, deckId?: string } | null {
  if (!isSlotDrag(activeId)) return null;
  const { index, deckId } = parseSlotId(activeId.toString(), SLOT_DRAG_PREFIX);
  return isValidSlotIndex(index) ? { index, deckId } : null;
}

export function getDropTarget(overId: UniqueIdentifier): { index: SlotIndex, deckId?: string } | null {
  const overIdStr = overId.toString();
  if (!overIdStr.startsWith(SLOT_PREFIX)) return null;
  
  const { index, deckId } = parseSlotId(overIdStr, SLOT_PREFIX);
  return isValidSlotIndex(index) ? { index, deckId } : null;
}

// --- Main Routing Logic ---

export const DragRoutingService = {
  determineAction(active: Active, over: Over | null): DragAction {
    // 1. Drop into Void
    if (!over) {
      if (isSlotDrag(active.id)) {
        const source = getSwapSource(active.id);
        if (source) {
          return { type: 'CLEAR_SLOT', index: source.index, deckId: source.deckId };
        }
      } else if (isSpellcasterDrag(active.id)) {
        // Extract deckId if possible (from ID or data)
        return { type: 'REMOVE_SPELLCASTER' }; 
      }
      return { type: 'NO_OP' };
    }

    const overId = over.id as string;
    const activeData = active.data.current as ActiveDragData | undefined;
    const item = extractDragItem(activeData);

    if (!item) return { type: 'NO_OP' };

    // 2. Global Guards (Snap Back)
    // If dragging current spellcaster, it MUST go to zone
    // CHECK: Does the zone ID need scoping too? "spellcaster-zone-{deckId}"
    if (activeData?.type === "spellcaster-slot" && !overId.includes(SPELLCASTER_ZONE_ID)) {
      return { type: 'NO_OP' };
    }

    // 3. Routing
    if (overId.includes(SPELLCASTER_ZONE_ID)) {
       // Check if we are dropping onto the CORRECT spellcaster zone if multiple exist
       // For now, assuming we might need to parse overId if it's scoped
      if ("spellcaster_id" in item) {
          // Attempt to extract deckId from the zone ID if it exists
          // Format: spellcaster-zone-{deckId}
          const deckId = overId.replace(SPELLCASTER_ZONE_ID, "").replace(/^-/, "") || undefined;
          const sourceDeckId = activeData?.deckId;
          return { type: 'SET_SPELLCASTER', item: item as Spellcaster, deckId, sourceDeckId };
      }
      return { type: 'NO_OP' };
    }

    // Drop into Slot
    const target = getDropTarget(over.id);
    if (target) {
      const source = getSwapSource(active.id);

      if (source) {
        // Mode 1: Reorder/Swap
        // Guard: Only allow swap within SAME deck for now? 
        // Or facilitate cross-deck move? User request implies "Swap mechanic working again", usually means within deck.
        // Let's allow cross-deck if IDs match or if we want that feature. 
        // For safety, let's pass both deckIds to the handler and let the hook decide.
        
        if (source.deckId !== target.deckId) {
             // Cross-deck drag. 
             // allowed now!
             return { type: 'MOVE_SLOT', sourceIndex: source.index, targetIndex: target.index, deckId: target.deckId, sourceDeckId: source.deckId };
        }

        if (source.index !== target.index) {
          return { type: 'MOVE_SLOT', sourceIndex: source.index, targetIndex: target.index, deckId: target.deckId };
        }
      } else {
        // Mode 2: Helper/Sidebar Drop (Browser -> Slot)
        // Guard: Spellcasters cannot go into slots
        if ("spellcaster_id" in item) {
             return { type: 'NO_OP' };
        }
        return { type: 'SET_SLOT', index: target.index, item: item as Unit | Spell | Titan, deckId: target.deckId };
      }
    }

    return { type: 'NO_OP' };
  }
};
