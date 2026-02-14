import { Deck, DeckSlot } from "@/types/deck";
import { UnifiedEntity, Unit, Spell, Titan, Spellcaster } from "@/types/api";
import { ENTITY_CATEGORY, TITAN_SLOT_INDEX, MAX_UNIT_SLOTS } from "@/services/config/constants";

/**
 * Creates a deep copy of deck slots to ensure immutability.
 */
export function cloneSlots(slots: DeckSlot[]): DeckSlot[] {
  return slots.map((s) => ({ ...s }));
}

/**
 * Creates a deep copy of a Deck.
 */
export function cloneDeck(deck: Deck): Deck {
  return structuredClone(deck);
}

/**
 * Checks if a deck is completely empty (no spellcaster, no units in slots).
 */
export function isDeckEmpty(deck: Deck): boolean {
    if (deck.spellcaster) return false;
    return deck.slots.every(s => !s.unit);
}

/**
 * Finds the appropriate slot index for auto-filling an item into a deck.
 * - Titans -> Titan Slot (4)
 * - Units/Spells -> First Empty Slot (0-3)
 * @returns Slot index or -1 if no valid slot found.
 */
export function findAutoFillSlot(deck: Deck, item: UnifiedEntity | Unit | Spell | Titan | Spellcaster): number {
    // 1. Titan -> Always Slot 4
    if ("category" in item && item.category === ENTITY_CATEGORY.Titan) {
        return TITAN_SLOT_INDEX;
    }

    // 2. Unit/Spell -> First Empty Slot (0-3)
    if ("category" in item && item.category === ENTITY_CATEGORY.Spellcaster) {
        return -1; 
    }
    
    // Find first empty unit slot
    const firstEmpty = deck.slots.find(s => !s.unit && s.index < MAX_UNIT_SLOTS);
    return firstEmpty ? firstEmpty.index : -1;
}
