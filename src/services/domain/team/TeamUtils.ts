import { TEAM_ERRORS } from "@/services/config/errors";
import { Deck, DeckOperationResult, Team } from "@/types/deck";

type DeckModifier = (deck: Deck) => DeckOperationResult<Deck>;

/**
 * Applies a modification to a specific deck within a team, handling cloning and error checking.
 *
 * @param teamDecks The array of team decks.
 * @param deckIndex The index of the deck to modify.
 * @param modifier A function that takes a deck and returns a result with the modified deck.
 * @returns A DeckOperationResult containing the new team decks array or an error.
 */
export function applyDeckTransaction(
  teamDecks: Team["decks"],
  deckIndex: number,
  modifier: DeckModifier
): DeckOperationResult<Team["decks"]> {
  const newDecks = [...teamDecks] as Team["decks"];
  const targetDeck = newDecks[deckIndex];

  if (!targetDeck) {
    return { success: false, error: TEAM_ERRORS.INVALID_DECK_INDEX };
  }

  const result = modifier(targetDeck);

  if (result.success && result.data) {
    newDecks[deckIndex] = result.data;
    return { success: true, data: newDecks };
  }

  return { success: false, error: result.error, code: result.code };
}
