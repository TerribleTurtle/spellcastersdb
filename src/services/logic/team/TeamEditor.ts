import { DeckRules } from "@/services/rules/deck-rules";
import { Spell, Spellcaster, Titan, Unit } from "@/types/api";
import { DeckOperationResult, SlotIndex, Team } from "@/types/deck";

/**
 * Pure business logic for Team Deck operations.
 *
 * This service handles all state transitions for team decks,
 * ensuring the store remains a simple state container.
 */
export const TeamEditor = {
  /**
   * Sets a card (Unit, Spell, Titan) to a specific slot in a specific deck.
   */
  setSlot(
    teamDecks: Team["decks"],
    deckIndex: number,
    slotIndex: SlotIndex,
    item: Unit | Spell | Titan
  ): DeckOperationResult<Team["decks"]> {
    const targetDeck = teamDecks[deckIndex];
    if (!targetDeck) {
      return {
        success: false,
        error: "Invalid deck index",
        code: "INVALID_DECK",
      };
    }

    const result = DeckRules.setSlot(targetDeck, slotIndex, item);

    if (!result.success || !result.data) {
      return { success: false, error: result.error, code: result.code };
    }

    const newDecks = [...teamDecks] as Team["decks"];
    newDecks[deckIndex] = result.data;

    return { success: true, data: newDecks };
  },

  /**
   * Clears a slot in a specific deck.
   */
  clearSlot(
    teamDecks: Team["decks"],
    deckIndex: number,
    slotIndex: SlotIndex
  ): Team["decks"] {
    const targetDeck = teamDecks[deckIndex];
    if (!targetDeck) return teamDecks; // No change

    const newDeck = DeckRules.clearSlot(targetDeck, slotIndex);

    if (newDeck === targetDeck) return teamDecks; // No change if DeckRules didn't change anything (unlikely for clearSlot but good practice)

    const newDecks = [...teamDecks] as Team["decks"];
    newDecks[deckIndex] = newDeck;
    return newDecks;
  },

  /**
   * Sets the spellcaster for a specific deck.
   */
  setSpellcaster(
    teamDecks: Team["decks"],
    deckIndex: number,
    spellcaster: Spellcaster
  ): Team["decks"] {
    const targetDeck = teamDecks[deckIndex];
    if (!targetDeck) return teamDecks;

    const newDeck = DeckRules.setSpellcaster(targetDeck, spellcaster);

    const newDecks = [...teamDecks] as Team["decks"];
    newDecks[deckIndex] = newDeck;
    return newDecks;
  },

  /**
   * Removes the spellcaster from a specific deck.
   */
  removeSpellcaster(
    teamDecks: Team["decks"],
    deckIndex: number
  ): Team["decks"] {
    const targetDeck = teamDecks[deckIndex];
    if (!targetDeck) return teamDecks;

    const newDeck = DeckRules.removeSpellcaster(targetDeck);

    const newDecks = [...teamDecks] as Team["decks"];
    newDecks[deckIndex] = newDeck;
    return newDecks;
  },

  /**
   * Swaps two slots within a specific deck.
   */
  swapSlots(
    teamDecks: Team["decks"],
    deckIndex: number,
    indexA: number,
    indexB: number
  ): DeckOperationResult<Team["decks"]> {
    const targetDeck = teamDecks[deckIndex];
    if (!targetDeck) {
      return {
        success: false,
        error: "Invalid deck index",
        code: "INVALID_DECK",
      };
    }

    const result = DeckRules.swapSlots(targetDeck, indexA, indexB);

    if (!result.success || !result.data) {
      return { success: false, error: result.error, code: result.code };
    }

    const newDecks = [...teamDecks] as Team["decks"];
    newDecks[deckIndex] = result.data;

    return { success: true, data: newDecks };
  },

  /**
   * Smartly adds an item to a specific deck.
   */
  quickAdd(
    teamDecks: Team["decks"],
    deckIndex: number,
    item: Unit | Spell | Titan | Spellcaster
  ): DeckOperationResult<Team["decks"]> {
    const targetDeck = teamDecks[deckIndex];
    if (!targetDeck) {
      return {
        success: false,
        error: "Invalid deck index",
        code: "INVALID_DECK",
      };
    }

    const result = DeckRules.quickAdd(targetDeck, item);

    if (!result.success || !result.data) {
      return { success: false, error: result.error, code: result.code };
    }

    const newDecks = [...teamDecks] as Team["decks"];
    newDecks[deckIndex] = result.data;

    return { success: true, data: newDecks, message: result.message };
  },
};
