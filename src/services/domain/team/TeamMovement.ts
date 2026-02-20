import { DeckRules } from "@/services/rules/deck-rules";
import { Deck, DeckOperationResult, Team } from "@/types/deck";

export const TeamMovement = {
  /**
   * Moves a card from one deck slot to another, handling swaps if target is occupied.
   */
  moveCardBetweenDecks(
    teamDecks: Team["decks"],
    sourceDeckIndex: number,
    sourceSlotIndex: number,
    targetDeckIndex: number,
    targetSlotIndex: number
  ): DeckOperationResult<Team["decks"]> {
    if (sourceDeckIndex === targetDeckIndex) {
      return moveCardIntraDeck(
        teamDecks,
        sourceDeckIndex,
        sourceSlotIndex,
        targetSlotIndex
      );
    }
    return moveCardInterDeck(
      teamDecks,
      sourceDeckIndex,
      sourceSlotIndex,
      targetDeckIndex,
      targetSlotIndex
    );
  },

  /**
   * Moves a spellcaster from one deck to another, handling swaps if target is occupied.
   */
  moveSpellcasterBetweenDecks(
    teamDecks: Team["decks"],
    sourceDeckIndex: number,
    targetDeckIndex: number
  ): DeckOperationResult<Team["decks"]> {
    const newDecks = [...teamDecks] as Team["decks"];
    const sourceDeck = newDecks[sourceDeckIndex];
    const targetDeck = newDecks[targetDeckIndex];

    if (!sourceDeck || !targetDeck) {
      return {
        success: false,
        error: "Invalid deck index",
        code: "INVALID_DECK",
      };
    }

    const sourceSC = sourceDeck.spellcaster;
    const targetSC = targetDeck.spellcaster;

    if (!sourceSC) {
      return {
        success: false,
        error: "No spellcaster at source",
        code: "EMPTY_SOURCE",
      };
    }

    // 1. Set Target
    const targetResult = DeckRules.setSpellcaster(targetDeck, sourceSC); // Always successful for SC
    newDecks[targetDeckIndex] = targetResult;

    // 2. Handle Source
    if (targetSC) {
      // Swap
      newDecks[sourceDeckIndex] = DeckRules.setSpellcaster(
        sourceDeck,
        targetSC
      );
    } else {
      // Move
      newDecks[sourceDeckIndex] = DeckRules.removeSpellcaster(sourceDeck);
    }

    return { success: true, data: newDecks };
  },
};

/**
 * Helper: Handles moving a card within the same deck.
 */
function moveCardIntraDeck(
  teamDecks: Team["decks"],
  deckIndex: number,
  sourceSlotIndex: number,
  targetSlotIndex: number
): DeckOperationResult<Team["decks"]> {
  const newDecks = [...teamDecks] as Team["decks"];
  const deck = newDecks[deckIndex];

  if (!deck) {
    return {
      success: false,
      error: "Invalid deck index",
      code: "INVALID_DECK",
    };
  }

  // Use swapSlots for intra-deck moves as it handles the logic correctly
  const result = DeckRules.swapSlots(deck, sourceSlotIndex, targetSlotIndex);

  if (result.success && result.data) {
    newDecks[deckIndex] = result.data;
    return { success: true, data: newDecks };
  }

  return {
    success: false,
    error: result.error || "Failed to move card",
    code: result.code || "MOVE_FAILED",
  };
}

/**
 * Helper: Handles moving a card between two different decks.
 */
function moveCardInterDeck(
  teamDecks: Team["decks"],
  sourceDeckIndex: number,
  sourceSlotIndex: number,
  targetDeckIndex: number,
  targetSlotIndex: number
): DeckOperationResult<Team["decks"]> {
  const newDecks = [...teamDecks] as Team["decks"];
  const sourceDeck = newDecks[sourceDeckIndex];
  const targetDeck = newDecks[targetDeckIndex];

  if (!sourceDeck || !targetDeck) {
    return {
      success: false,
      error: "Invalid deck index",
      code: "INVALID_DECK",
    };
  }

  const sourceItem = sourceDeck.slots[sourceSlotIndex]?.unit;
  const targetItem = targetDeck.slots[targetSlotIndex]?.unit;

  if (!sourceItem) {
    return { success: false, error: "No item at source", code: "EMPTY_SOURCE" };
  }

  // 1. Place item in target (handle potential swap or overwrite)
  const targetResult = DeckRules.setSlot(
    targetDeck,
    targetSlotIndex,
    sourceItem
  );
  if (!targetResult.success || !targetResult.data) {
    return {
      success: false,
      error: targetResult.error,
      code: targetResult.code,
    };
  }
  newDecks[targetDeckIndex] = targetResult.data;

  // 2. Resolve source slot (clear or swap with target item)
  const sourceResult = resolveSourceSlot(
    sourceDeck,
    sourceSlotIndex,
    targetItem
  );
  if (!sourceResult.success || !sourceResult.data) {
    return {
      success: false,
      error: sourceResult.error || "Failed to update source",
      code: sourceResult.code || "SOURCE_FAIL",
    };
  }
  newDecks[sourceDeckIndex] = sourceResult.data;

  return { success: true, data: newDecks };
}

/**
 * Helper: Resolves the state of the source slot after a move.
 * If targetItem exists (swap), places it in source.
 * If targetItem is null (move), clears the source slot.
 */
function resolveSourceSlot(
  deck: Deck,
  slotIndex: number,
  targetItem: Team["decks"][number]["slots"][number]["unit"] | null | undefined
): DeckOperationResult<Deck> {
  if (targetItem) {
    return DeckRules.setSlot(deck, slotIndex, targetItem);
  }
  return { success: true, data: DeckRules.clearSlot(deck, slotIndex) };
}
