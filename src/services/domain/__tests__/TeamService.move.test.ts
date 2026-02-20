import { describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { TeamMovement } from "@/services/domain/team/TeamMovement";
import { cloneDeck } from "@/services/utils/deck-utils";
import { Unit } from "@/types/api";
import { EntityCategory } from "@/types/enums";

// Mock Data
const MockUnitA: Unit = {
  entity_id: "unit_a",
  name: "Unit A",
  category: EntityCategory.Creature,
  rank: "I",
  description: "Unit A",
  magic_school: "Wild",
  tags: [],
  health: 10,
  range: 1,
  movement_speed: 3,
  damage: 5,
};

const MockUnitB: Unit = {
  entity_id: "unit_b",
  name: "Unit B",
  category: EntityCategory.Creature,
  rank: "I",
  description: "Unit B",
  magic_school: "Elemental",
  tags: [],
  health: 12,
  range: 2,
  movement_speed: 4,
  damage: 6,
};

describe("TeamMovement.moveCardBetweenDecks", () => {
  // Helper to create a fresh team state
  const createTeamDecks = () =>
    [
      cloneDeck(INITIAL_DECK),
      cloneDeck(INITIAL_DECK),
      cloneDeck(INITIAL_DECK),
    ] as [typeof INITIAL_DECK, typeof INITIAL_DECK, typeof INITIAL_DECK];

  it("should move a unit from one deck to another empty slot", () => {
    const decks = createTeamDecks();
    // Setup: Deck 0 has Unit A at slot 0
    decks[0].slots[0].unit = MockUnitA;

    const result = TeamMovement.moveCardBetweenDecks(
      decks,
      0, // Source Deck
      0, // Source Slot
      1, // Target Deck
      0 // Target Slot
    );

    expect(result.success).toBe(true);
    const newDecks = result.data!;

    // Check Target
    expect(newDecks[1].slots[0].unit).toEqual(MockUnitA);
    // Check Source (Should be empty)
    expect(newDecks[0].slots[0].unit).toBeNull();
  });

  it("should swap units if target slot is occupied", () => {
    const decks = createTeamDecks();
    // Setup: Deck 0 has Unit A, Deck 1 has Unit B
    decks[0].slots[0].unit = MockUnitA;
    decks[1].slots[0].unit = MockUnitB;

    const result = TeamMovement.moveCardBetweenDecks(
      decks,
      0, // Source Deck (A)
      0, // Slot 0
      1, // Target Deck (B)
      0 // Slot 0
    );

    expect(result.success).toBe(true);
    const newDecks = result.data!;

    // Deck 1 should now have Unit A
    expect(newDecks[1].slots[0].unit).toEqual(MockUnitA);
    // Deck 0 should now have Unit B
    expect(newDecks[0].slots[0].unit).toEqual(MockUnitB);
  });

  it("should fail if source slot is empty", () => {
    const decks = createTeamDecks();
    const result = TeamMovement.moveCardBetweenDecks(decks, 0, 0, 1, 0);
    expect(result.success).toBe(false);
    expect(result.code).toBe("EMPTY_SOURCE");
  });
});
