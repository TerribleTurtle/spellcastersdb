import { TEAM_ERRORS } from "@/services/config/errors";
import { applyDeckTransaction } from "@/services/domain/team/TeamUtils";
import { DeckRules } from "@/services/rules/deck-rules";
import { cloneDeck } from "@/services/utils/deck-utils";
import {
  isSpell,
  isSpellcaster,
  isTitan,
  isUnit,
} from "@/services/validation/guards";
import { Spell, Spellcaster, Titan, UnifiedEntity, Unit } from "@/types/api";
import { Deck, DeckOperationResult, Team } from "@/types/deck";

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
    return applyDeckTransaction(teamDecks, deckIndex, (deck) => {
      if (!item) {
        return { success: true, data: DeckRules.clearSlot(deck, slotIndex) };
      }

      if (isUnit(item) || isSpell(item) || isTitan(item)) {
        return DeckRules.setSlot(deck, slotIndex, item as Unit | Spell | Titan);
      }

      return {
        success: false,
        error: TEAM_ERRORS.INVALID_TYPE_SLOT,
        code: "INVALID_TYPE",
      };
    });
  },

  /**
   * Clears a specific slot in a specific deck.
   */
  clearSlot(
    teamDecks: Team["decks"],
    deckIndex: number,
    slotIndex: number
  ): DeckOperationResult<Team["decks"]> {
    return applyDeckTransaction(teamDecks, deckIndex, (deck) => ({
      success: true,
      data: DeckRules.clearSlot(deck, slotIndex),
    }));
  },

  /**
   * Sets the spellcaster for a specific deck.
   */
  setSpellcaster(
    teamDecks: Team["decks"],
    deckIndex: number,
    item: Spellcaster
  ): DeckOperationResult<Team["decks"]> {
    return applyDeckTransaction(teamDecks, deckIndex, (deck) => ({
      success: true,
      data: DeckRules.setSpellcaster(deck, item),
    }));
  },

  /**
   * Removes the spellcaster from a specific deck.
   */
  removeSpellcaster(
    teamDecks: Team["decks"],
    deckIndex: number
  ): DeckOperationResult<Team["decks"]> {
    return applyDeckTransaction(teamDecks, deckIndex, (deck) => ({
      success: true,
      data: DeckRules.removeSpellcaster(deck),
    }));
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
    return applyDeckTransaction(teamDecks, deckIndex, (deck) =>
      DeckRules.swapSlots(deck, indexA, indexB)
    );
  },

  /**
   * Attempts to quick-add an item to a deck.
   */
  quickAdd(
    teamDecks: Team["decks"],
    deckIndex: number,
    item: UnifiedEntity
  ): DeckOperationResult<Team["decks"]> {
    return applyDeckTransaction(teamDecks, deckIndex, (deck) => {
      // Type Guard for Quick Add (Unit | Spell | Titan | Spellcaster)
      if (
        isUnit(item) ||
        isSpell(item) ||
        isTitan(item) ||
        isSpellcaster(item)
      ) {
        return DeckRules.quickAdd(
          deck,
          item as Unit | Spell | Titan | Spellcaster
        );
      }
      return {
        success: false,
        error: TEAM_ERRORS.INVALID_TYPE_QUICK_ADD,
        code: "INVALID_TYPE",
      };
    });
  },

  /**
   * Imports a solo deck into a specific team slot.
   */
  importDeck(
    teamDecks: Team["decks"],
    slotIndex: number,
    deck: Deck,
    newId: string
  ): DeckOperationResult<Team["decks"]> {
    const newDecks = [...teamDecks] as Team["decks"];

    if (slotIndex < 0 || slotIndex >= newDecks.length) {
      return { success: false, error: TEAM_ERRORS.INVALID_SLOT_INDEX };
    }

    newDecks[slotIndex] = {
      ...cloneDeck(deck),
      id: newId,
    };

    return { success: true, data: newDecks };
  },

  /**
   * Prepares a team deck for export to the solo library.
   */
  exportDeck(deck: Deck, newId: string): Deck {
    return {
      ...cloneDeck(deck),
      id: newId,
      name: `${deck.name} (From Team)`,
    };
  },
};
