import { Active, Over } from "@dnd-kit/core";

import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { DragData, DropData } from "@/types/dnd";
import { EntityCategory, SlotType } from "@/types/enums";

export type DragAction =
  | { type: "NO_OP" }
  | {
      type: "MOVE_SLOT";
      sourceIndex: number;
      targetIndex: number;
      deckId?: string;
      sourceDeckId?: string;
    }
  | {
      type: "SET_SLOT";
      index: number;
      item: Unit | Spell | Titan;
      deckId?: string;
    }
  | { type: "CLEAR_SLOT"; index: number; deckId?: string }
  | {
      type: "SET_SPELLCASTER";
      item: Spellcaster;
      deckId?: string;
      sourceDeckId?: string;
    }
  | { type: "REMOVE_SPELLCASTER"; deckId?: string };

// Helper to check compatibility
const isCompatible = (
  item: Unit | Spell | Titan,
  allowedTypes?: SlotType[] | string[]
): boolean => {
  if (!allowedTypes || allowedTypes.length === 0) return true; // Detailed validation usually happens at UI/Hook level, but we want strict routing too.

  // If "TITAN" is in allowedTypes, item MUST be Titan
  // This depends on how specific the slot types are.
  // Titan Slot: ["TITAN"]
  // Unit Slot: ["UNIT"]

  const isTitan = item.category === EntityCategory.Titan;

  // Check if allowed types include Titan
  const allowsTitan = allowedTypes.includes(SlotType.Titan);
  const allowsUnit = allowedTypes.includes(SlotType.Unit);

  if (isTitan) {
    return allowsTitan;
  } else {
    // Not a Titan (Unit or Spell)
    // If slot ONLY allows Titan, return false
    if (allowsTitan && !allowsUnit) return false;

    return allowsUnit;
  }
};

export const DragRoutingService = {
  determineAction(active: Active, over: Over | null): DragAction {
    if (!active.data.current) {
      return { type: "NO_OP" };
    }

    const dragData = active.data.current as DragData;
    const dropData = over?.data.current as DropData | undefined;

    // 1. Drop into Void (or invalid target)
    if (!over || !dropData) {
      if (
        dragData.type === "DECK_SLOT" &&
        dragData.sourceSlotIndex !== undefined
      ) {
        // Drag-to-Remove
        return {
          type: "CLEAR_SLOT",
          index: dragData.sourceSlotIndex,
          deckId: dragData.sourceDeckId,
        };
      }
      if (dragData.type === "SPELLCASTER_SLOT") {
        return { type: "REMOVE_SPELLCASTER", deckId: dragData.sourceDeckId };
      }
      return { type: "NO_OP" };
    }

    // 2. Browser -> Slot
    if (dragData.type === "BROWSER_CARD" && dropData.type === "DECK_SLOT") {
      if (dropData.slotIndex === undefined) return { type: "NO_OP" };

      // Type Guard
      const item = dragData.item as Unit | Spell | Titan;
      if (!item || "spellcaster_id" in item) return { type: "NO_OP" }; // Safety

      // Validation
      if (!isCompatible(item, dropData.accepts)) {
        return { type: "NO_OP" };
      }

      return {
        type: "SET_SLOT",
        index: dropData.slotIndex,
        item,
        deckId: dropData.deckId,
      };
    }

    // 3. Browser -> Header (Auto-Add)
    if (dragData.type === "BROWSER_CARD" && dropData.type === "DECK_HEADER") {
      const item = dragData.item as Unit | Spell | Titan;
      if (!item || "spellcaster_id" in item) return { type: "NO_OP" };

      return {
        type: "SET_SLOT",
        index: -1, // Signal for "Find first empty"
        item,
        deckId: dropData.deckId,
      };
    }

    // 4. Slot -> Slot (Move/Swap)
    if (dragData.type === "DECK_SLOT" && dropData.type === "DECK_SLOT") {
      if (
        dragData.sourceSlotIndex === undefined ||
        dropData.slotIndex === undefined
      )
        return { type: "NO_OP" };

      const item = dragData.item as Unit | Spell | Titan;

      // Validation check for Move
      if (item && !isCompatible(item, dropData.accepts)) {
        return { type: "NO_OP" };
      }

      return {
        type: "MOVE_SLOT",
        sourceIndex: dragData.sourceSlotIndex,
        targetIndex: dropData.slotIndex,
        sourceDeckId: dragData.sourceDeckId,
        deckId: dropData.deckId,
      };
    }

    // 5. Slot -> Header (Move to another deck, auto-slot)
    if (dragData.type === "DECK_SLOT" && dropData.type === "DECK_HEADER") {
      if (dragData.sourceSlotIndex === undefined) return { type: "NO_OP" };

      // Moving from a slot to a whole deck -> Find first empty slot in target
      return {
        type: "MOVE_SLOT",
        sourceIndex: dragData.sourceSlotIndex,
        targetIndex: -1, // Signal Auto
        sourceDeckId: dragData.sourceDeckId,
        deckId: dropData.deckId,
      };
    }

    // 6. Spellcaster Logic
    if (
      dragData.type === "BROWSER_CARD" &&
      dropData.type === "SPELLCASTER_SLOT"
    ) {
      const item = dragData.item as Spellcaster;
      if (!item || !("spellcaster_id" in item)) return { type: "NO_OP" };

      return {
        type: "SET_SPELLCASTER",
        item,
        deckId: dropData.deckId,
      };
    }

    if (
      dragData.type === "SPELLCASTER_SLOT" &&
      dropData.type === "SPELLCASTER_SLOT"
    ) {
      // Move Spellcaster between decks
      // We need the item to set it? Or just the source deck?
      // The dragging item data has the spellcaster object.
      const item = dragData.item as Spellcaster;
      return {
        type: "SET_SPELLCASTER",
        item,
        deckId: dropData.deckId,
        sourceDeckId: dragData.sourceDeckId,
      };
    }

    // 7. Background Drops (Snap Back)
    if (dropData.type === "DECK_BACKGROUND") {
      return { type: "NO_OP" };
    }

    return { type: "NO_OP" };
  },
};
