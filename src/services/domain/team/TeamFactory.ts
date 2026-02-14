import { Team, Deck } from "@/types/deck";
import { TEAM_LIMIT } from "@/services/config/constants";
import { cloneDeck } from "@/services/utils/deck-utils";
import { INITIAL_DECK } from "@/services/api/persistence";
import { getUniqueName } from "@/services/utils/naming-utils";
import { v4 as uuidv4 } from "uuid";

export const TeamFactory = {
  /**
   * Creates a fresh set of empty decks for a new team.
   */
  createInitialTeamDecks(): Team["decks"] {
    return Array.from({ length: TEAM_LIMIT }, () => ({
      ...cloneDeck(INITIAL_DECK),
      id: uuidv4(),
    })) as Team["decks"];
  },

  /**
   * Constructs a Team object.
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
   * Creates a duplicate of a team with a smart unique name.
   */
  duplicateTeam(originalTeam: Team, newId: string, existingNames: string[]): Team {
    const finalName = getUniqueName(originalTeam.name || "Untitled Team", existingNames);
    return {
        ...TeamFactory.prepareDuplicate(originalTeam, newId),
        name: finalName
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
};
