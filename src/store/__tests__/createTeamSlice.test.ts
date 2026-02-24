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

    it("should handle null activeSlot by exiting edit mode without changing currentDeck", () => {
      const { setActiveSlot } = useDeckStore.getState();

      setActiveSlot(0); // Sets to team deck
      const originalDeck = useDeckStore.getState().currentDeck;

      setActiveSlot(null); // Deselects

      const state = useDeckStore.getState();
      expect(state.activeSlot).toBeNull();
      // Keeps the last deck loaded instead of wiping it immediately
      expect(state.currentDeck).toEqual(originalDeck);
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

    it("should append correctly alongside other state (delegate team limits to persistence)", () => {
      const teams: Team[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `id-${i}`,
        name: `Team ${i}`,
        decks: [...useDeckStore.getState().teamDecks] as Team["decks"],
      }));
      useDeckStore.setState({ savedTeams: teams });

      const { saveTeam } = useDeckStore.getState();
      saveTeam("new-id", "New Team");

      const state = useDeckStore.getState();
      // It uses upsertSavedTeam under the hood which comes from persistence slice
      // Since persistence slice isn't fully mocked to limit here, we just check it added
      expect(state.savedTeams.length).toBeGreaterThan(0);
      expect(state.savedTeams.find((t) => t.id === "new-id")).toBeDefined();
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

  describe("clearTeam", () => {
    it("should wipe teamName, teamDecks, and activeTeamId", () => {
      const { clearTeam, setTeamName } = useDeckStore.getState();
      setTeamName("Old");
      useDeckStore.setState({
        activeTeamId: "old-id",
        teamDecks: [
          { ...INITIAL_DECK, name: "D1" },
          { ...INITIAL_DECK },
          { ...INITIAL_DECK },
        ],
      });
      clearTeam();
      const state = useDeckStore.getState();
      expect(state.teamName).toBe("New Team");
      expect(state.activeTeamId).toBeNull();
      // teamDecks resets to initial clones
      expect(state.teamDecks[0].spellcaster).toBeNull();
    });
  });

  describe("importSoloDeckToTeam", () => {
    it("should sync properly to the currentDeck when the slot is active", () => {
      const { importSoloDeckToTeam, setActiveSlot } = useDeckStore.getState();
      const testDeck = { ...INITIAL_DECK, name: "Imported", id: "old-id" };
      setActiveSlot(1);

      importSoloDeckToTeam(1, testDeck, "new-uuid");

      const state = useDeckStore.getState();
      // Current deck is updated seamlessly via EditorSyncService
      expect(state.currentDeck.id).toBe("new-uuid");
      expect(state.teamDecks[1].id).toBe("new-uuid");
    });
  });

  describe("loadTeamFromData", () => {
    it("should inject whole array of decks", () => {
      const { loadTeamFromData } = useDeckStore.getState();
      const d = [{ ...INITIAL_DECK }, { ...INITIAL_DECK }, { ...INITIAL_DECK }];
      const newIds = ["a", "b", "c"];
      loadTeamFromData(d, newIds);

      const state = useDeckStore.getState();
      expect(state.teamDecks[0].id).toBe("a");
      expect(state.teamDecks[1].id).toBe("b");
    });
  });

  describe("exportTeamSlotToSolo", () => {
    it("should export deck using importDeckToLibrary persistence wrapper", () => {
      const { exportTeamSlotToSolo } = useDeckStore.getState();
      const testDeck = { ...INITIAL_DECK, name: "Source" };

      exportTeamSlotToSolo(0, testDeck, "new-solo-id");

      const state = useDeckStore.getState();
      // importDeckToLibrary generates a new UUID internally, so we check by name and length
      expect(state.savedDecks.length).toBe(1);
      expect(state.savedDecks[0].name).toBe("Source (From Team)");
    });
  });

  describe("checkActiveTeamDeletion", () => {
    it("should clear team if activeTeamId is in deleted array", () => {
      useDeckStore.setState({
        activeTeamId: "target",
        teamName: "Going Away",
      });
      const { checkActiveTeamDeletion } = useDeckStore.getState();
      checkActiveTeamDeletion(["other", "target"]);

      const state = useDeckStore.getState();
      expect(state.activeTeamId).toBeNull();
      expect(state.teamName).toBe("New Team");
    });
  });

  describe("Slot Operations (setTeamSlot, clearTeamSlot, swapTeamSlots)", () => {
    it("should set and clear a team slot", () => {
      const { setTeamSlot, clearTeamSlot } = useDeckStore.getState();
      setTeamSlot(1, 2, MockUnit);

      expect(useDeckStore.getState().teamDecks[1].slots[2].unit).toEqual(
        MockUnit
      );

      clearTeamSlot(1, 2);
      expect(useDeckStore.getState().teamDecks[1].slots[2].unit).toBeNull();
    });

    it("should swap team slots", () => {
      const { setTeamSlot, swapTeamSlots } = useDeckStore.getState();
      setTeamSlot(0, 0, MockUnit);

      swapTeamSlots(0, 0, 1);

      const state = useDeckStore.getState();
      expect(state.teamDecks[0].slots[0].unit).toBeNull();
      expect(state.teamDecks[0].slots[1].unit).toEqual(MockUnit);
    });
  });

  describe("Spellcaster Operations", () => {
    it("should set, remove, and move spellcasters", () => {
      const {
        setTeamSpellcaster,
        removeTeamSpellcaster,
        moveSpellcasterBetweenDecks,
      } = useDeckStore.getState();

      setTeamSpellcaster(0, MockSpellcaster);
      expect(useDeckStore.getState().teamDecks[0].spellcaster).toEqual(
        MockSpellcaster
      );
      expect(useDeckStore.getState().teamDecks[1].spellcaster).toBeNull();

      moveSpellcasterBetweenDecks(0, 1);
      expect(useDeckStore.getState().teamDecks[0].spellcaster).toBeNull();
      expect(useDeckStore.getState().teamDecks[1].spellcaster).toEqual(
        MockSpellcaster
      );

      removeTeamSpellcaster(1);
      expect(useDeckStore.getState().teamDecks[1].spellcaster).toBeNull();
    });
  });
});
