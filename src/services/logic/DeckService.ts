import { Deck } from "@/types/deck";
import { cloneDeck } from "@/services/deck-utils";
import { validateDeck } from "@/services/validation/deck-validation";

/**
 * Service to handle business logic for Decks.
 * Centralizes deck creation, cloning, and validation.
 */
export const DeckService = {
  /**
   * Creates a deep copy of a deck.
   * Wrapper around lower-level utils to provide a consistent service API.
   */
  clone(deck: Deck): Deck {
    return cloneDeck(deck);
  },

  /**
   * Validates a deck and returns status and errors.
   */
  validate(deck: Deck) {
    return validateDeck(deck);
  },
};
