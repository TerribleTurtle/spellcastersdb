import { cloneDeck } from "@/services/utils/deck-utils";
import { DeckBuilderState, TeamState } from "@/store/types";
import { Team } from "@/types/deck";

/**
 * Service to handle synchronization between Team State and the main Deck Editor State.
 * This decouples the Zustand store from the specific logic of "what happens when I edit a team slot".
 */
export const EditorSyncService = {
  /**
   * Generates a partial state update to sync the Team's decks with the Editor's `currentDeck`.
   *
   * @param activeSlot - The currently active team slot index (or null if none).
   * @param newDecks - The updated list of team decks.
   * @returns A partial state object containing the updated `teamDecks` and optionally `currentDeck`.
   */
  getSyncUpdate(
    activeSlot: number | null,
    newDecks: Team["decks"]
  ): Partial<TeamState & DeckBuilderState> {
    // 1. Always update the Team Decks
    const update: Partial<TeamState & DeckBuilderState> = {
      teamDecks: newDecks,
    };

    // 2. If the user is currently "editing" a specific slot (Team Mode),
    // we must update the global 'currentDeck' so the editor UI reflects the change.
    if (activeSlot !== null && newDecks[activeSlot]) {
      update.currentDeck = cloneDeck(newDecks[activeSlot]);
    }

    return update;
  },
};
