import { beforeEach, describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { cloneDeck } from "@/services/utils/deck-utils";
import { Spellcaster, Unit } from "@/types/api";
import { Team } from "@/types/deck";
import { EntityCategory } from "@/types/enums";

import { useDeckStore } from "../index";

// --- Mocks ---
const MockUnit: Unit = {
  entity_id: "u1",
  name: "Test Unit",
  category: EntityCategory.Creature,
  rank: "I",
  description: "desc",
  magic_school: "Wild",
  tags: [],
  health: 10,
  damage: 10,
  movement_speed: 10,
  range: 1,
};

const MockSpellcaster: Spellcaster = {
  entity_id: "sc1",
  spellcaster_id: "sc1",
  name: "Test Caster",
  category: EntityCategory.Spellcaster,
  class: "Enchanter",
  tags: [],
  health: 100,
  abilities: {
    passive: [],
    primary: { name: "P", description: "" },
    defense: { name: "D", description: "" },
    ultimate: { name: "U", description: "" },
  },
};

describe("createTeamSlice", () => {
  beforeEach(() => {
    useDeckStore.setState({
      currentDeck: cloneDeck(INITIAL_DECK),
      savedDecks: [],
      teamName: "New Team",
      activeTeamId: null,
      teamDecks: [
        cloneDeck(INITIAL_DECK),
        cloneDeck(INITIAL_DECK),
        cloneDeck(INITIAL_DECK),
      ],
      savedTeams: [],
      activeSlot: null,
      commandCenterOpen: false,
    });
  });

  describe("setActiveSlot", () => {
    it("should load deck from team slot into currentDeck", () => {
      const { setActiveSlot, setTeamDecks } = useDeckStore.getState();

      // Setup team deck 0
      const decks = [
        cloneDeck(INITIAL_DECK),
        cloneDeck(INITIAL_DECK),
        cloneDeck(INITIAL_DECK),
      ] as Team["decks"];
      decks[0].name = "Team Deck 0";
      setTeamDecks(decks);

      setActiveSlot(0);

      const state = useDeckStore.getState();
      expect(state.activeSlot).toBe(0);
      expect(state.currentDeck.name).toBe("Team Deck 0");
      // Should be a Clone, not reference
      expect(state.currentDeck).not.toBe(decks[0]);
    });
  });

  describe("saveTeam", () => {
    it("should save a new team", () => {
      const { saveTeam, setTeamName } = useDeckStore.getState();
      setTeamName("Champions");

      saveTeam("t1");

      const state = useDeckStore.getState();
      expect(state.savedTeams).toHaveLength(1);
      expect(state.savedTeams[0].name).toBe("Champions");
      expect(state.savedTeams[0].id).toBe("t1");
      expect(state.activeTeamId).toBe("t1");
    });

    it("should update existing team", () => {
      const { saveTeam, setTeamName } = useDeckStore.getState();
      setTeamName("Original");
      saveTeam("t1");

      setTeamName("Updated");
      saveTeam("t1"); // Save same ID

      const state = useDeckStore.getState();
      expect(state.savedTeams).toHaveLength(1);
      expect(state.savedTeams[0].name).toBe("Updated");
    });
  });

  describe("loadTeam", () => {
    it("should load a saved team", () => {
      const { saveTeam, setTeamName, loadTeam, clearTeam, setTeamSpellcaster } =
        useDeckStore.getState();

      setTeamName("To Load");
      // Use team-aware action (solo setSpellcaster only updates currentDeck, not teamDecks)
      setTeamSpellcaster(0, MockSpellcaster);

      saveTeam("load-id");

      clearTeam();
      expect(useDeckStore.getState().teamName).toBe("New Team");
      expect(useDeckStore.getState().teamDecks[0].spellcaster).toBeNull();

      loadTeam("load-id");
      const state = useDeckStore.getState();
      expect(state.teamName).toBe("To Load");
      expect(state.teamDecks[0].spellcaster).toEqual(MockSpellcaster);
      expect(state.activeTeamId).toBe("load-id");
    });
  });

  describe("quickAddToTeam", () => {
    it("should add unit to active team slot", () => {
      const { setActiveSlot, quickAddToTeam } = useDeckStore.getState();

      setActiveSlot(1);
      quickAddToTeam(1, MockUnit);

      const state = useDeckStore.getState();
      // Should update teamDecks[1] AND currentDeck
      expect(state.teamDecks[1].slots[0].unit).toEqual(MockUnit);
      expect(state.currentDeck.slots[0].unit).toEqual(MockUnit);
    });

    it("should work even if slot is not active (just updates teamDecks)", () => {
      const { quickAddToTeam } = useDeckStore.getState();
      // activeSlot is null

      quickAddToTeam(2, MockUnit);

      const state = useDeckStore.getState();
      expect(state.teamDecks[2].slots[0].unit).toEqual(MockUnit);
      // currentDeck should be untouched (it was initial deck)
      expect(state.currentDeck.slots[0].unit).toBeNull();
    });
  });

  describe("moveCardBetweenDecks", () => {
    it("should move card from Deck 0 to Deck 1", () => {
      const { setTeamSlot, moveCardBetweenDecks } = useDeckStore.getState();

      // Setup: Deck 0 Slot 0 has unit
      setTeamSlot(0, 0, MockUnit);

      moveCardBetweenDecks(0, 0, 1, 0);

      const state = useDeckStore.getState();
      expect(state.teamDecks[0].slots[0].unit).toBeNull(); // Source cleared
      expect(state.teamDecks[1].slots[0].unit).toEqual(MockUnit); // Target populated
    });
  });
});
