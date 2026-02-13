import { Team, Deck, DeckOperationResult } from "@/types/deck";
import { TEAM_LIMIT } from "@/services/config/constants";
import { cloneDeck } from "@/services/deck-utils";
import { INITIAL_DECK } from "@/services/data/persistence";
import { DeckRules } from "@/services/rules/deck-rules";

import { v4 as uuidv4 } from "uuid";

/**
 * Service to handle business logic for Teams.
 * Isolate complex object construction and data mapping from the Store.
 */
export const TeamService = {
  /**
   * Moves a card from one deck slot to another, handling swaps if target is occupied.
   * Supports both intra-deck and inter-deck moves.
   */
  moveCardBetweenDecks(
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
      return { success: false, error: "Invalid deck index", code: "INVALID_DECK" };
    }

    const sourceItem = sourceDeck.slots[sourceSlotIndex].unit;
    const targetItem = targetDeck.slots[targetSlotIndex].unit;

    if (!sourceItem) {
      return { success: false, error: "No item at source", code: "EMPTY_SOURCE" };
    }

    // 1. Try to set item in target deck
    // Note: setSlot handles type validation and duplicate swapping within target deck
    const targetResult = DeckRules.setSlot(targetDeck, targetSlotIndex, sourceItem);
    
    if (!targetResult.success || !targetResult.data) {
      return { success: false, error: targetResult.error, code: targetResult.code };
    }

    // 2. Handle Source Slot
    // If it was a swap (target had item), put target item in source
    let sourceResult: DeckOperationResult<Deck> | { success: true; data: Deck };
    
    // Check if we are moving within the SAME deck
    if (sourceDeckIndex === targetDeckIndex) {
        // If same deck, DeckRules.setSlot might have already handled everything via its internal swap logic if it was a duplicate?
        // Actually, DeckRules.setSlot is for "Setting a specific slot". It doesn't know "where it came from" unless it was a duplicate.
        // For a pure move within same deck, we should use DeckRules.swapSlots or moveSlot logic.
        // Re-using generic move logic:
        
        // If we just updated targetSlot with sourceItem, sourceSlot still has sourceItem (cloned).
        // We need to put targetItem (if any) into sourceSlot.
        
        // However, since we are in the same deck, `targetResult.data` is the deck with targetSlot updated.
        // But sourceSlot is NOT updated in `targetResult.data` yet (unless it was a duplicate swap).
        
        // It's safer/cleaner to use `DeckRules.swapSlots` for intra-deck moves.
        return { success: false, error: "Use swapSlots for intra-deck moves", code: "USE_SWAP" };
    }

    // Inter-Deck Move
    newDecks[targetDeckIndex] = targetResult.data;

    if (targetItem) {
       // Swap: Put target item into source slot
       sourceResult = DeckRules.setSlot(sourceDeck, sourceSlotIndex, targetItem);
    } else {
       // Move: Clear source slot
       sourceResult = { success: true, data: DeckRules.clearSlot(sourceDeck, sourceSlotIndex) };
    }

    if (!sourceResult.success || !sourceResult.data) {
        const errorResult = sourceResult as { success: false; error?: string; code?: string };
        return { success: false, error: errorResult.error || "Failed to update source", code: errorResult.code || "SOURCE_FAIL" };
    }

    newDecks[sourceDeckIndex] = sourceResult.data;

    return { success: true, data: newDecks };
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
          return { success: false, error: "Invalid deck index", code: "INVALID_DECK" };
      }

      const sourceSC = sourceDeck.spellcaster;
      const targetSC = targetDeck.spellcaster;

      if (!sourceSC) {
          return { success: false, error: "No spellcaster at source", code: "EMPTY_SOURCE" };
      }

      // 1. Set Target
      const targetResult = DeckRules.setSpellcaster(targetDeck, sourceSC); // Always successful for SC
      newDecks[targetDeckIndex] = targetResult;

      // 2. Handle Source
      if (targetSC) {
          // Swap
          newDecks[sourceDeckIndex] = DeckRules.setSpellcaster(sourceDeck, targetSC);
      } else {
          // Move
          newDecks[sourceDeckIndex] = DeckRules.removeSpellcaster(sourceDeck);
      }

      return { success: true, data: newDecks };
  },

  /**
   * Creates a fresh set of empty decks for a new team.
   * Ensures the return type is strictly typed as a Tuple of Decks.
   */
  createInitialTeamDecks(): Team["decks"] {
    return Array.from({ length: TEAM_LIMIT }, () => ({
      ...cloneDeck(INITIAL_DECK),
      id: uuidv4(),
    })) as Team["decks"];
  },
  /**
   * Constructs a Team object with the given parameters.
   * Handles merging current/active decks with the team structure.
   */
  constructTeam(
    id: string,
    nameInput: string,
    currentTeamDecks: Team["decks"],
    activeSlot: number | null,
    activeDeckOverride?: Deck
  ): Team {
    const name = nameInput?.trim() || "Untitled Team";
    
    // Construct current decks state (apply override if needed)
    const activeDecks = [...currentTeamDecks] as Team["decks"];
    if (
      typeof activeSlot === "number" &&
      activeSlot >= 0 &&
      activeSlot < TEAM_LIMIT &&
      activeDeckOverride
    ) {
      activeDecks[activeSlot] = activeDeckOverride;
    }

    return {
      id,
      name,
      decks: activeDecks,
    };
  },

  /**
   * Prepares a duplicate of a team with a new ID and cloning all decks.
   */
  prepareDuplicate(originalTeam: Team, newId: string): Team {
    return {
      ...originalTeam,
      id: newId,
      name: `${originalTeam.name} (Copy)`,
      decks: originalTeam.decks.map((d) => cloneDeck(d)) as Team["decks"],
    };
  },

  /**
   * Prepares a team from imported data (array of decks).
   */
  prepareImportedTeam(
    decks: Deck[],
    newIds: string[],
    baseName: string
  ): { teamDecks: Team["decks"]; teamName: string } {
    const processedDecks = decks
      .slice(0, TEAM_LIMIT)
      .map((deck, i) => ({
        ...cloneDeck(deck),
        id: newIds[i],
      })) as Team["decks"];

    return {
      teamDecks: processedDecks,
      teamName: `${baseName} (Copy)`,
    };
  },

  /**
   * Updates the Saved Teams list with a new or updated team.
   */
  updateSavedTeams(savedTeams: Team[], newTeam: Team): Team[] {
    const existingIndex = savedTeams.findIndex((t) => t.id === newTeam.id);
    const newSavedTeams = [...savedTeams];

    if (existingIndex >= 0) {
      newSavedTeams[existingIndex] = newTeam;
    } else {
      newSavedTeams.push(newTeam);
    }
    return newSavedTeams;
  },
};
