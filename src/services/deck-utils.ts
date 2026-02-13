import { Deck, DeckSlot } from "@/types/deck";

/**
 * Creates a deep copy of deck slots to ensure immutability.
 */
export function cloneSlots(slots: DeckSlot[]): DeckSlot[] {
  return slots.map((s) => ({ ...s }));
}

/**
 * Creates a deep copy of a Deck.
 * Uses JSON parse/stringify for a true deep clone if needed, 
 * but for our structure, a shallow copy with cloned slots is usually sufficient and more performant.
 * However, the store was using a specific pattern of spreading the deck and mapping slots.
 * We will standardize on that for now.
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
