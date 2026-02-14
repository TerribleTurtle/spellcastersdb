import { Team, DeckOperationResult } from "@/types/deck";
import { DECK_ERRORS } from "@/services/config/errors";
import { UnifiedEntity, Spellcaster, Unit, Spell, Titan } from "@/types/api";
import { DeckRules } from "@/services/rules/deck-rules";
import { isUnit, isSpell, isTitan, isSpellcaster } from "@/services/validation/guards";

export const TeamModification = {
  /**
   * Sets a card in a specific slot of a specific deck within the team.
   */
  setSlot(
    teamDecks: Team["decks"],
    deckIndex: number,
    slotIndex: number,
    item: UnifiedEntity | null
  ): DeckOperationResult<Team["decks"]> {
    const newDecks = [...teamDecks] as Team["decks"];
    const targetDeck = newDecks[deckIndex];
    
    if (!targetDeck) {
        return { success: false, error: DECK_ERRORS.INVALID_DECK_INDEX };
    }


    
    if (!item) {
        return TeamModification.clearSlot(teamDecks, deckIndex, slotIndex);
    }

    if (isUnit(item) || isSpell(item) || isTitan(item)) {
        const result = DeckRules.setSlot(targetDeck, slotIndex, item as Unit | Spell | Titan);
        
        if (result.success && result.data) {
            newDecks[deckIndex] = result.data;
            return { success: true, data: newDecks };
        }
        return { success: false, error: result.error, code: result.code };
    }

    return { success: false, error: DECK_ERRORS.INVALID_TYPE_SLOT, code: "INVALID_TYPE" };
  },

  /**
   * Clears a specific slot in a specific deck.
   */
  clearSlot(
    teamDecks: Team["decks"],
    deckIndex: number,
    slotIndex: number
  ): DeckOperationResult<Team["decks"]> {
     const newDecks = [...teamDecks] as Team["decks"];
     const targetDeck = newDecks[deckIndex];

     if (!targetDeck) {
         return { success: false, error: "Invalid deck index" };
     }

     const newDeck = DeckRules.clearSlot(targetDeck, slotIndex);
     newDecks[deckIndex] = newDeck;
     
     return { success: true, data: newDecks };
  },

  /**
   * Sets the spellcaster for a specific deck.
   */
  setSpellcaster(
      teamDecks: Team["decks"],
      deckIndex: number,
      item: Spellcaster
  ): DeckOperationResult<Team["decks"]> {
      const newDecks = [...teamDecks] as Team["decks"];
      const targetDeck = newDecks[deckIndex];

      if (!targetDeck) {
          return { success: false, error: "Invalid deck index" };
      }

      const newDeck = DeckRules.setSpellcaster(targetDeck, item);
      newDecks[deckIndex] = newDeck;

      return { success: true, data: newDecks };
  },

  /**
   * Removes the spellcaster from a specific deck.
   */
  removeSpellcaster(
      teamDecks: Team["decks"],
      deckIndex: number
  ): DeckOperationResult<Team["decks"]> {
      const newDecks = [...teamDecks] as Team["decks"];
      const targetDeck = newDecks[deckIndex];

      if (!targetDeck) {
          return { success: false, error: "Invalid deck index" };
      }

      const newDeck = DeckRules.removeSpellcaster(targetDeck);
      newDecks[deckIndex] = newDeck;

      return { success: true, data: newDecks };
  },

  /**
   * Swaps two slots within the same deck.
   */
  swapSlots(
      teamDecks: Team["decks"],
      deckIndex: number,
      indexA: number,
      indexB: number
  ): DeckOperationResult<Team["decks"]> {
      const newDecks = [...teamDecks] as Team["decks"];
      const targetDeck = newDecks[deckIndex];

      if (!targetDeck) {
          return { success: false, error: "Invalid deck index" };
      }

      const result = DeckRules.swapSlots(targetDeck, indexA, indexB);
      
      if (result.success && result.data) {
          newDecks[deckIndex] = result.data;
          return { success: true, data: newDecks };
      }

      return { success: false, error: result.error, code: result.code };
  },

  /**
   * Attempts to quick-add an item to a deck.
   */
  quickAdd(
      teamDecks: Team["decks"],
      deckIndex: number,
      item: UnifiedEntity
  ): DeckOperationResult<Team["decks"]> {
      const newDecks = [...teamDecks] as Team["decks"];
      const targetDeck = newDecks[deckIndex];

      if (!targetDeck) {
          return { success: false, error: "Invalid deck index" };
      }

      // Type Guard for Quick Add (Unit | Spell | Titan | Spellcaster)
      if (isUnit(item) || isSpell(item) || isTitan(item) || isSpellcaster(item)) {
          const result = DeckRules.quickAdd(targetDeck, item as Unit | Spell | Titan | Spellcaster);

          if (result.success && result.data) {
               newDecks[deckIndex] = result.data;
               return { success: true, data: newDecks };
          }
          return { success: false, error: result.error, code: result.code };
      }

      return { success: false, error: DECK_ERRORS.INVALID_TYPE_QUICK_ADD, code: "INVALID_TYPE" };
  }
};
