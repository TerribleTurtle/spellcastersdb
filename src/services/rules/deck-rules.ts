import { Deck, SlotIndex, DeckOperationResult, SlotType } from "@/types/deck";
import { DECK_ERRORS } from "@/services/config/errors";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { EntityCategory } from "@/types/enums";
import { isSpellcaster } from "@/services/validation/guards";
import { MAX_UNIT_SLOTS, TITAN_SLOT_INDEX } from "@/services/config/constants";
import { cloneDeck } from "@/services/utils/deck-utils";

// --- Helpers ---

// Add helper for slot validation
function canAcceptUnit(
  slot: { allowedTypes: SlotType[] },
  unit: Unit | Spell | Titan
): string | null {
  const isTitan = unit.category === EntityCategory.Titan;
  
  if (slot.allowedTypes.includes(SlotType.Titan) && !isTitan) {
    return DECK_ERRORS.EXPECTS_TITAN;
  }
  if (slot.allowedTypes.includes(SlotType.Unit) && isTitan) {
    return DECK_ERRORS.EXPECTS_UNIT;
  }
  return null;
}


function addTitan(deck: Deck, entity: Titan): DeckOperationResult<Deck> {
  const newDeck = cloneDeck(deck);
  const titanSlotIndex = newDeck.slots.findIndex(s => s.allowedTypes.includes(SlotType.Titan));
  
  if (titanSlotIndex !== -1) {
      newDeck.slots[titanSlotIndex].unit = entity;
      return { 
          success: true, 
          data: newDeck, 
          message: `Added ${entity.name} to Titan Slot` 
      };
  }
  return { success: false, error: DECK_ERRORS.NO_TITAN_SLOT, code: "NO_TITAN_SLOT" };
}

function addUnit(deck: Deck, entity: Unit | Spell): DeckOperationResult<Deck> {
  const newDeck = cloneDeck(deck);
  
  // Check Duplicates
  const isDuplicate = newDeck.slots.some((s, i) => i < MAX_UNIT_SLOTS && s.unit?.entity_id === entity.entity_id);
  if (isDuplicate) {
       return { success: false, error: DECK_ERRORS.DUPLICATE_UNIT, code: "DUPLICATE_UNIT" };
  }

  const emptyIndex = newDeck.slots.findIndex((s) => s.index < MAX_UNIT_SLOTS && !s.unit);
  if (emptyIndex !== -1) {
       newDeck.slots[emptyIndex].unit = entity;
       return { 
           success: true, 
           data: newDeck, 
           message: `Added ${entity.name}` 
       };
  }

  return { success: false, error: DECK_ERRORS.DECK_FULL, code: "DECK_FULL" };
}

export const DeckRules = {
  /**
   * Assigns a Spellcaster to the deck and updates the deck name if needed.
   */
  setSpellcaster(deck: Deck, spellcaster: Spellcaster): Deck {
    const isDefaultName = !deck.name || deck.name === "New Deck";
    return {
      ...deck,
      spellcaster,
      name: isDefaultName ? `${spellcaster.name} Deck` : deck.name,
    };
  },

  removeSpellcaster(deck: Deck): Deck {
    return { ...deck, spellcaster: null };
  },

  /**
   * Sets a card (Unit, Spell, or Titan) to a specific slot index.
   * Enforces singleton rule for units and checks slot compatibility.
   */
  setSlot(
    deck: Deck,
    index: SlotIndex,
    card: Unit | Spell | Titan
  ): DeckOperationResult<Deck> {
    if (isSpellcaster(card)) {
      return { success: false, error: DECK_ERRORS.SPELLCASTER_IN_NORMAL_SLOT, code: "INVALID_TYPE" };
    }

    const newDeck = cloneDeck(deck);
    
    // Enforce Singleton: If card is already in the deck (within unit slots), swap it with the target slot's content.
    if (index < MAX_UNIT_SLOTS) {
      const existingIndex = newDeck.slots.findIndex(
        (s, i) => i < MAX_UNIT_SLOTS && i !== index && s.unit?.entity_id === card.entity_id
      );

      if (existingIndex !== -1) {
        newDeck.slots[existingIndex] = {
           ...newDeck.slots[existingIndex],
           unit: newDeck.slots[index].unit
        };
      }
    }

    const slot = newDeck.slots[index];
    const isTitan = card.category === EntityCategory.Titan;

    if (slot.allowedTypes.includes(SlotType.Titan) && !isTitan) {
        return { success: false, error: DECK_ERRORS.TITAN_SLOT_MISMATCH, code: "SLOT_MISMATCH" };
    }
    if (slot.allowedTypes.includes(SlotType.Unit) && isTitan) {
        return { success: false, error: DECK_ERRORS.UNIT_SLOT_MISMATCH, code: "SLOT_MISMATCH" };
    }

    newDeck.slots[index] = { ...slot, unit: card };
    return { success: true, data: newDeck };
  },

  /**
   * Clears the unit/content from a specific slot.
   */
  clearSlot(deck: Deck, index: SlotIndex): Deck {
    const newDeck = cloneDeck(deck);
    newDeck.slots[index].unit = null;
    return newDeck;
  },

  /**
   * Swaps the contents of two slots, validating that both slots can accept each other's content.
   */
  swapSlots(deck: Deck, indexA: number, indexB: number): DeckOperationResult<Deck> {
      // Bounds check
      if (indexA < 0 || indexA > TITAN_SLOT_INDEX || indexB < 0 || indexB > TITAN_SLOT_INDEX) {
          return { success: false, error: DECK_ERRORS.INVALID_SLOT_INDEX, code: "INVALID_INDEX" };
      }

      const newDeck = cloneDeck(deck);
      const slotA = newDeck.slots[indexA];
      const slotB = newDeck.slots[indexB];
      
      const unitA = slotA.unit;
      const unitB = slotB.unit;

      // Validate Slot A accepting Unit B
      if (unitB) {
          const error = canAcceptUnit(slotA, unitB);
          if (error) return { success: false, error: `Taking ${error.toLowerCase()}`, code: "SWAP_INVALID" };
      }

      // Validate Slot B accepting Unit A
      if (unitA) {
          const error = canAcceptUnit(slotB, unitA);
          if (error) return { success: false, error: `Target ${error.toLowerCase()}`, code: "SWAP_INVALID" };
      }

      // Perform Swap
      newDeck.slots[indexA] = { ...slotA, unit: unitB };
      newDeck.slots[indexB] = { ...slotB, unit: unitA };

      return { success: true, data: newDeck };
  },

  /**
   * Smartly adds a card to the deck.
   * - Spellcasters set the deck hero.
   * - Titans find the Titan slot.
   * - Units/Spells find the first empty slot.
   */
  quickAdd(
    deck: Deck, 
    card: Unit | Spell | Titan | Spellcaster
  ): DeckOperationResult<Deck> {
      // 1. Spellcaster
      if (isSpellcaster(card)) {
           return { 
               success: true, 
               data: DeckRules.setSpellcaster(deck, card), 
               message: `${card.name} set as Spellcaster` 
           };
      }

      const entity = card as Unit | Spell | Titan;
      const isTitan = entity.category === EntityCategory.Titan;

      // 2. Titan -> Find Titan Slot
      if (isTitan) {
          return addTitan(deck, entity as Titan);
      }

      // 3. Unit/Spell -> First Empty Slot (0-3)
      return addUnit(deck, entity as Unit | Spell);
  }
};
