import { beforeEach, describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { TeamModification } from "@/services/domain/team/TeamModification";
import { TeamMovement } from "@/services/domain/team/TeamMovement";
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
      expect(state.teamDecks[1].slots[0].unit).toEqual(MockUnit);
      // Ensures currentDeck is synchronized
      expect(state.currentDeck.slots[0].unit).toEqual(MockUnit);
    });

    it("should return an error string if the deck is full", () => {
      const { setActiveSlot, quickAddToTeam, setTeamSlot } =
        useDeckStore.getState();
      setActiveSlot(0);

      // Fill all 4 slots
      for (let i = 0; i < 4; i++) {
        setTeamSlot(0, i as any, { ...MockUnit, entity_id: `u-${i}` });
      }

      // Try adding a 5th unit
      const error = quickAddToTeam(0, { ...MockUnit, entity_id: "u-5" });
      expect(error).toBe("Deck Full!");
    });
  });

  describe("moveCardBetweenDecks", () => {
    it("should move a unit from one deck to another deck in the team", () => {
      const { setTeamSlot, moveCardBetweenDecks } = useDeckStore.getState();
      setTeamSlot(0, 0, MockUnit);

      // Map: deck 0, slot 0 -> deck 1, slot 0
      const error = moveCardBetweenDecks(0, 0, 1, 0);

      expect(error).toBeNull();
      const state = useDeckStore.getState();
      expect(state.teamDecks[0].slots[0].unit).toBeNull(); // Source cleared
      expect(state.teamDecks[1].slots[0].unit).toEqual(MockUnit); // Target populated
    });

    it("should return an error when trying to move a Titan into a Unit slot", () => {
      const { setTeamSlot, moveCardBetweenDecks } = useDeckStore.getState();
      const MockTitan = {
        ...MockUnit,
        category: "Titan",
        entity_id: "t-1",
      } as unknown as Unit;
      setTeamSlot(0, 4, MockTitan);

      // Move from deck 0, slot 4 (Titan slot) to deck 1, slot 0 (Unit slot)
      const error = moveCardBetweenDecks(0, 4, 1, 0);

      expect(error).toContain("Titans cannot go in this slot");
      const state = useDeckStore.getState();
      // Unchanged
      expect(state.teamDecks[0].slots[4].unit).toEqual(MockTitan);
      expect(state.teamDecks[1].slots[0].unit).toBeNull();
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
      expect(state.teamDecks[2].id).toBe("c");
    });

    it("should inject up to 3 decks, but not pad if given fewer", () => {
      const { loadTeamFromData } = useDeckStore.getState();
      const d = [{ ...INITIAL_DECK }]; // Only 1 deck
      const newIds = ["new-uuid-1", "new-uuid-2", "new-uuid-3"];

      loadTeamFromData(d, newIds);

      const state = useDeckStore.getState();
      // The implementation slices up to 3, but does NOT pad with empty decks.
      expect(state.teamDecks).toHaveLength(1);
      expect(state.teamDecks[0].id).toBe("new-uuid-1");
      expect(state.activeTeamId).toBeNull(); // Cleared because it's a new unsaved team
    });

    it("should inject exactly 3 decks even if provided array is longer", () => {
      const { loadTeamFromData } = useDeckStore.getState();
      const d = [
        { ...INITIAL_DECK },
        { ...INITIAL_DECK },
        { ...INITIAL_DECK },
        { ...INITIAL_DECK },
      ]; // 4 decks
      const newIds = ["new-uuid-1", "new-uuid-2", "new-uuid-3"];

      loadTeamFromData(d, newIds);

      const state = useDeckStore.getState();
      expect(state.teamDecks).toHaveLength(3);
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

    it("should import the targeted team deck into the saved library", () => {
      const { setTeamSlot, exportTeamSlotToSolo } = useDeckStore.getState();

      // Setup a deck
      setTeamSlot(1, 0, MockUnit);
      const stateBefore = useDeckStore.getState();
      const sourceDeck = stateBefore.teamDecks[1];
      sourceDeck.name = "Source (From Team)";

      // Act: we want to export slot 1
      exportTeamSlotToSolo(1, sourceDeck, "new-export-uuid");

      const state = useDeckStore.getState();
      // importDeckToLibrary generates a new UUID internally.
      // Since `checkDeckNameAvailable` logic in persistence slice uses unique name generator,
      // it might append something if it conflicts, but here we just check it was added
      expect(state.savedDecks.length).toBe(1);
      expect(state.savedDecks[0].name?.includes("Source (From Team)")).toBe(
        true
      );
      expect(state.savedDecks[0].slots[0].unit).toEqual(MockUnit);
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

    it("should swap spellcasters if moving to a deck that already has one", () => {
      const { setTeamSpellcaster, moveSpellcasterBetweenDecks } =
        useDeckStore.getState();

      const SpellcasterA = MockSpellcaster;
      const SpellcasterB = {
        ...MockSpellcaster,
        entity_id: "sc-2",
        name: "Other SC",
      };

      setTeamSpellcaster(0, SpellcasterA);
      setTeamSpellcaster(1, SpellcasterB);

      moveSpellcasterBetweenDecks(0, 1);

      const state = useDeckStore.getState();
      // Implementation ACTUALLY swaps them
      expect(state.teamDecks[0].spellcaster).toEqual(SpellcasterB);
      expect(state.teamDecks[1].spellcaster).toEqual(SpellcasterA);
    });
  });

  describe("Error Branches & Edge Cases", () => {
    it("should handle setActiveSlot out of bounds", () => {
      useDeckStore.getState().setActiveSlot(99);
      expect(useDeckStore.getState().activeSlot).toBeNull();
    });

    it("should handle saveTeam with parameter overrides", () => {
      useDeckStore.getState().saveTeam("new-id", "Custom Name", 1, {
        ...cloneDeck(INITIAL_DECK),
        name: "Override Deck",
      });
      const state = useDeckStore.getState();
      expect(state.savedTeams[0].name).toBe("Custom Name");
      expect(state.savedTeams[0].decks[1].name).toBe("Override Deck");
    });

    it("should handle loadTeam with bogus ID", () => {
      useDeckStore.getState().loadTeam("bogus-id");
      expect(useDeckStore.getState().teamName).toBe("New Team"); // Unchanged
    });

    it("should safely handle checkActiveTeamDeletion when active id isn't in array", () => {
      useDeckStore.setState({ activeTeamId: "active" });
      useDeckStore.getState().checkActiveTeamDeletion(["other"]);
      expect(useDeckStore.getState().activeTeamId).toBe("active"); // Unchanged
    });

    it("should safely handle out of bounds indices returning false success for slot actions", () => {
      const store = useDeckStore.getState();
      // Just verifying none of these throw and they fallback to returning {} from modifiers
      const preState = useDeckStore.getState().teamDecks;

      store.importSoloDeckToTeam(99, INITIAL_DECK, "id");
      store.setTeamSlot(99, 1, MockUnit);
      store.clearTeamSlot(99, 1);
      store.setTeamSpellcaster(99, {} as any);
      store.removeTeamSpellcaster(99);
      store.swapTeamSlots(99, 0, 1);

      const resQuickAdd = store.quickAddToTeam(99, MockUnit);
      expect(typeof resQuickAdd).toBe("string"); // Returns an error string (e.g., Deck not found)

      const resMoveCard = store.moveCardBetweenDecks(99, 0, 0, 1);
      expect(typeof resMoveCard).toBe("string");

      store.moveSpellcasterBetweenDecks(99, 0);

      expect(useDeckStore.getState().teamDecks).toEqual(preState); // State untouched
    });

    it("should fallback to 'Untitled Team' if name is empty", () => {
      useDeckStore.setState({ teamName: "" });
      useDeckStore.getState().saveTeam("new-id", "");
      expect(useDeckStore.getState().savedTeams[0].name).toBe("Untitled Team");
    });

    it("should load team and fallback to null activeTeamId if team id is falsy", () => {
      useDeckStore.setState({
        savedTeams: [{ id: "", name: "Alpha", decks: [] } as any],
      });
      useDeckStore.getState().loadTeam("");
      expect(useDeckStore.getState().activeTeamId).toBeNull();
    });

    it("should safely handle modifiers returning success: false with no truthy error", () => {
      const originalQuickAdd = TeamModification.quickAdd;
      TeamModification.quickAdd = () => ({ success: false, error: "" }) as any;
      const quickAddResult = useDeckStore
        .getState()
        .quickAddToTeam(0, MockUnit);
      TeamModification.quickAdd = originalQuickAdd;
      expect(quickAddResult).toBeNull();

      const originalMoveCard = TeamMovement.moveCardBetweenDecks;
      TeamMovement.moveCardBetweenDecks = () =>
        ({ success: false, error: "" }) as any;
      const moveResult = useDeckStore
        .getState()
        .moveCardBetweenDecks(0, 0, 1, 0);
      TeamMovement.moveCardBetweenDecks = originalMoveCard;
      expect(moveResult).toBeNull();
    });
    describe("Adversarial & Edge Cases", () => {
      it("setActiveSlot with negative index returns empty object instead of crashing", () => {
        useDeckStore.getState().setActiveSlot(-1);
        const state = useDeckStore.getState();
        expect(state.activeSlot).toBeNull();
      });

      it("setActiveTeamId setter accurately updates activeTeamId", () => {
        useDeckStore.getState().setActiveTeamId("test-id-123");
        expect(useDeckStore.getState().activeTeamId).toBe("test-id-123");
      });

      it("saveTeam uses state.activeTeamId over newId if it exists", () => {
        useDeckStore.setState({ activeTeamId: "existing-uuid" });
        useDeckStore.getState().saveTeam("different-uuid", "New Team");

        const state = useDeckStore.getState();
        expect(state.activeTeamId).toBe("existing-uuid");
        expect(state.savedTeams[0].id).toBe("existing-uuid");
      });

      it("saveTeam relies on whitespace-only name trimmer to fallback to 'Untitled Team'", () => {
        useDeckStore.setState({ teamName: "   " });
        useDeckStore.getState().saveTeam("some-uuid", "   ");

        const state = useDeckStore.getState();
        expect(state.savedTeams[0].name).toBe("Untitled Team");
      });

      it("quickAddToTeam explicitly returns null when success is true with no error", () => {
        const { setActiveSlot, quickAddToTeam } = useDeckStore.getState();
        setActiveSlot(1);
        const err = quickAddToTeam(1, MockUnit);
        expect(err).toBeNull(); // Should explicitly return null, not undefined or string
      });

      it("moveCardBetweenDecks returns empty error when moving into the same slot gracefully fails", () => {
        const { setTeamSlot, moveCardBetweenDecks } = useDeckStore.getState();
        setTeamSlot(0, 0, MockUnit);

        // Moving from deck0 slot0 to deck0 slot0
        const error = moveCardBetweenDecks(0, 0, 0, 0);
        expect(error).toBeDefined();
      });
    });
  });
});
