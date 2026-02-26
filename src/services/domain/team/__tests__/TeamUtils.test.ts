import { describe, expect, it } from "vitest";

import { createNewDeck } from "@/services/api/deck-factory";
import { TEAM_ERRORS } from "@/services/config/errors";
import { Deck, Team } from "@/types/deck";

import { applyDeckTransaction } from "../TeamUtils";

describe("TeamUtils.ts - applyDeckTransaction", () => {
  // Helper to create a fresh team
  const createTestTeam = (): Team["decks"] => [
    createNewDeck("Deck 1"),
    createNewDeck("Deck 2"),
    createNewDeck("Deck 3"),
  ];

  it("should return an updated decks array when modifier succeeds", () => {
    const teamDecks = createTestTeam();

    const modifier = (deck: Deck) => {
      const newDeck = { ...deck, name: "Modified Deck" };
      return { success: true as const, data: newDeck };
    };

    const result = applyDeckTransaction(teamDecks, 1, modifier);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    // Deck 1 is modified
    expect(result.data?.[1].name).toBe("Modified Deck");

    // Original decks array is not mutated
    expect(teamDecks[1].name).toBe("Deck 2");
  });

  it("should return an error when using an invalid deckIndex", () => {
    const teamDecks = createTestTeam();

    // Valid modifier
    const modifier = (deck: Deck) => ({ success: true as const, data: deck });

    // Index 5 is out of bounds
    const result = applyDeckTransaction(teamDecks, 5, modifier);

    expect(result.success).toBe(false);
    expect(result.error).toBe(TEAM_ERRORS.INVALID_DECK_INDEX);
  });

  it("should propagate errors returned by the modifier", () => {
    const teamDecks = createTestTeam();

    const modifier = () => ({
      success: false as const,
      error: "Modifier failed",
      code: "MOD_ERR",
    });

    const result = applyDeckTransaction(teamDecks, 0, modifier);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Modifier failed");
    expect(result.code).toBe("MOD_ERR");
    expect(result.data).toBeUndefined();
  });

  it("should treat success: true but undefined data as a failure", () => {
    const teamDecks = createTestTeam();

    const modifier = () => ({
      success: true as const,
      // data is omitted
    });

    const result = applyDeckTransaction(teamDecks, 2, modifier);

    expect(result.success).toBe(false);
    expect(result.error).toBeUndefined(); // Inherits undefined error
    expect(result.data).toBeUndefined();
  });
});
