import { beforeEach, describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { ENTITY_CATEGORY } from "@/services/config/constants";
import { TEAM_ERRORS } from "@/services/config/errors";
import { cloneDeck } from "@/services/utils/deck-utils";
import { Spellcaster, Titan, Unit } from "@/types/api";
// Assuming this exists or I need to mock it
import { Deck, Team } from "@/types/deck";

import { TeamModification } from "./TeamModification";

// --- Mocks ---
const MockUnit: Unit = {
  entity_id: "unit_1",
  name: "Test Unit",
  category: ENTITY_CATEGORY.Creature,
  rank: "I",
  description: "desc",
  magic_school: "Elemental",
  tags: [],
  health: 10,
  range: 1,
  movement_speed: 1,
  damage: 1,
};

const MockTitan: Titan = {
  entity_id: "titan_1",
  name: "Test Titan",
  category: ENTITY_CATEGORY.Titan,
  rank: "IV",
  description: "desc",
  magic_school: "Titan",
  tags: [],
  health: 1000,
  damage: 100,
  movement_speed: 5,
};

const MockSpellcaster: Spellcaster = {
  entity_id: "caster_1",
  spellcaster_id: "caster_1",
  name: "Test Caster",
  category: ENTITY_CATEGORY.Spellcaster,
  class: "Duelist",
  tags: ["hero"],
  health: 100,
  abilities: {
    passive: [],
    primary: { name: "A", description: "D" },
    defense: { name: "B", description: "D" },
    ultimate: { name: "C", description: "D" },
  },
};

describe("TeamModification", () => {
  let teamDecks: Team["decks"];

  beforeEach(() => {
    // Reset decks before each test.
    // We use functional clones to ensure tests don't pollute each other.
    teamDecks = [
      cloneDeck(INITIAL_DECK),
      cloneDeck(INITIAL_DECK),
      cloneDeck(INITIAL_DECK),
    ];
  });

  describe("setSlot", () => {
    it("should set a unit in a valid slot", () => {
      const result = TeamModification.setSlot(teamDecks, 0, 0, MockUnit);

      expect(result.success).toBe(true);
      expect(result.data![0].slots[0].unit).toEqual(MockUnit);
      // Ensure immutability: original shouldn't change
      expect(teamDecks[0].slots[0].unit).toBeNull();
    });

    it("should return error for invalid deck index", () => {
      const result = TeamModification.setSlot(teamDecks, 99, 0, MockUnit);
      expect(result.success).toBe(false);
      expect(result.error).toBe(TEAM_ERRORS.INVALID_DECK_INDEX);
    });

    it("should clear slot if item is null", () => {
      // Setup: add unit first
      const setup = TeamModification.setSlot(teamDecks, 0, 0, MockUnit);
      const decksWithUnit = setup.data!;

      const result = TeamModification.setSlot(decksWithUnit, 0, 0, null);

      expect(result.success).toBe(true);
      expect(result.data![0].slots[0].unit).toBeNull();
    });

    it("should return error for invalid item type for standard slot", () => {
      // Trying to put a spellcaster in a unit slot
      const result = TeamModification.setSlot(teamDecks, 0, 0, MockSpellcaster);
      expect(result.success).toBe(false);
      expect(result.error).toBe(TEAM_ERRORS.INVALID_TYPE_SLOT);
    });
  });

  describe("clearSlot", () => {
    it("should clear a populated slot", () => {
      // Setup
      teamDecks[0].slots[0].unit = MockUnit;

      const result = TeamModification.clearSlot(teamDecks, 0, 0);
      expect(result.success).toBe(true);
      expect(result.data![0].slots[0].unit).toBeNull();
    });

    it("should return error for invalid deck index", () => {
      const result = TeamModification.clearSlot(teamDecks, 99, 0);
      expect(result.success).toBe(false);
      // Validating CURRENT behavior (Magic String)
      expect(result.error).toBe(TEAM_ERRORS.INVALID_DECK_INDEX);
    });
  });

  describe("setSpellcaster", () => {
    it("should set spellcaster", () => {
      const result = TeamModification.setSpellcaster(
        teamDecks,
        1,
        MockSpellcaster
      );
      expect(result.success).toBe(true);
      expect(result.data![1].spellcaster).toEqual(MockSpellcaster);
    });

    it("should return error for invalid deck index", () => {
      const result = TeamModification.setSpellcaster(
        teamDecks,
        5,
        MockSpellcaster
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe(TEAM_ERRORS.INVALID_DECK_INDEX);
    });
  });

  describe("swapSlots", () => {
    it("should swap two units in the same deck", () => {
      // Setup: slot 0 has Unit 1, slot 1 has Unit 2
      const unit2 = { ...MockUnit, entity_id: "unit_2" };

      let currentDecks = teamDecks;
      currentDecks = TeamModification.setSlot(
        currentDecks,
        0,
        0,
        MockUnit
      ).data!;
      currentDecks = TeamModification.setSlot(currentDecks, 0, 1, unit2).data!;

      const result = TeamModification.swapSlots(currentDecks, 0, 0, 1);

      expect(result.success).toBe(true);
      expect(result.data![0].slots[0].unit).toEqual(unit2);
      expect(result.data![0].slots[1].unit).toEqual(MockUnit);
    });

    it("should return error for invalid deck index", () => {
      const result = TeamModification.swapSlots(teamDecks, 10, 0, 1);
      expect(result.success).toBe(false);
      expect(result.error).toBe(TEAM_ERRORS.INVALID_DECK_INDEX);
    });
  });

  describe("quickAdd", () => {
    it("should auto-add unit to first empty slot", () => {
      const result = TeamModification.quickAdd(teamDecks, 0, MockUnit);
      expect(result.success).toBe(true);
      expect(result.data![0].slots[0].unit).toEqual(MockUnit);
    });

    it("should auto-add titan to titan slot", () => {
      const result = TeamModification.quickAdd(teamDecks, 0, MockTitan);
      expect(result.success).toBe(true);
      // Titan slot is usually index 4 (or similar, depends on constants via DeckRules)
      // We check if *any* slot has the titan
      const hasTitan = result.data![0].slots.some(
        (s) => s.unit?.entity_id === MockTitan.entity_id
      );
      expect(hasTitan).toBe(true);
    });

    it("should return error for invalid deck index", () => {
      const result = TeamModification.quickAdd(teamDecks, 99, MockUnit);
      expect(result.success).toBe(false);
      expect(result.error).toBe(TEAM_ERRORS.INVALID_DECK_INDEX);
    });
  });

  describe("importDeck", () => {
    it("should import a full deck into a slot", () => {
      const sourceDeck: Deck = {
        ...cloneDeck(INITIAL_DECK),
        name: "Imported Deck",
        spellcaster: MockSpellcaster,
      };

      const result = TeamModification.importDeck(
        teamDecks,
        2,
        sourceDeck,
        "new-uuid"
      );

      expect(result.success).toBe(true);
      expect(result.data![2].name).toBe("Imported Deck");
      expect(result.data![2].id).toBe("new-uuid");
      expect(result.data![2].spellcaster).toEqual(MockSpellcaster);
    });

    it("should return error for invalid slot index", () => {
      const result = TeamModification.importDeck(
        teamDecks,
        50,
        INITIAL_DECK,
        "id"
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe(TEAM_ERRORS.INVALID_SLOT_INDEX);
    });
  });
});
