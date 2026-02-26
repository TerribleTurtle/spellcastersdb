import { beforeEach, describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { cloneDeck } from "@/services/utils/deck-utils";
import { Unit } from "@/types/api";
import { Deck } from "@/types/deck";
import { EntityCategory } from "@/types/enums";

import { useDeckStore } from "../index";

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

describe("createPersistenceSlice", () => {
  beforeEach(() => {
    useDeckStore.setState({
      currentDeck: cloneDeck(INITIAL_DECK),
      savedDecks: [],
      savedTeams: [],
      teamName: "New Team",
      activeTeamId: null,
      teamDecks: [
        cloneDeck(INITIAL_DECK),
        cloneDeck(INITIAL_DECK),
        cloneDeck(INITIAL_DECK),
      ],
    });
  });

  describe("saveDeck", () => {
    it("should save current deck", () => {
      const { saveDeck, setDeckName } = useDeckStore.getState();
      setDeckName("My Deck");

      saveDeck();

      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(1);
      expect(state.savedDecks[0].name).toBe("My Deck");
      expect(state.savedDecks[0].id).toBeDefined();
      // Current deck should now have ID equal to saved ID
      expect(state.currentDeck.id).toBe(state.savedDecks[0].id);
    });

    it("should update existing deck if already saved", () => {
      const { saveDeck, setDeckName } = useDeckStore.getState();
      setDeckName("V1");
      saveDeck();
      const stateAfterFirstSave = useDeckStore.getState();
      const id = stateAfterFirstSave.currentDeck.id;

      setDeckName("V2");
      saveDeck();

      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(1);
      expect(state.savedDecks[0].id).toBe(id);
      expect(state.savedDecks[0].name).toBe("V2");
    });

    it("should fallback to 'Untitled Deck' if no name and no spellcaster", () => {
      const { saveDeck, setDeckName } = useDeckStore.getState();
      setDeckName(""); // Empty name
      saveDeck();

      const state = useDeckStore.getState();
      expect(state.savedDecks[0].name).toBe("Untitled Deck");
    });

    it("should fallback to spellcaster name + ' Deck' if no name is provided", () => {
      const { saveDeck, setDeckName } = useDeckStore.getState();
      setDeckName("");
      // Inject spellcaster directly for test coverage purposes
      useDeckStore.setState({
        currentDeck: {
          ...useDeckStore.getState().currentDeck,
          spellcaster: { name: "Gandalf" } as any,
        },
      });
      saveDeck();

      const state = useDeckStore.getState();
      expect(state.savedDecks[0].name).toBe("Gandalf Deck");
    });

    it("should prioritize nameInput over currentDeck.name", () => {
      const { saveDeck, setDeckName } = useDeckStore.getState();
      setDeckName("Ignored Name");
      saveDeck("Custom Override");
      expect(useDeckStore.getState().savedDecks[0].name).toBe(
        "Custom Override"
      );
    });
  });

  describe("saveAsCopy", () => {
    it("should save current deck as a new copy with a unique name", () => {
      const { saveDeck, saveAsCopy, setDeckName } = useDeckStore.getState();
      setDeckName("Base Deck");
      saveDeck();
      const originalId = useDeckStore.getState().currentDeck.id!;

      saveAsCopy("Base Deck");

      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(2);

      const newDeck = state.savedDecks.find((d) => d.id !== originalId);
      expect(newDeck).toBeDefined();
      // Should append (Copy) or similar number based on getUniqueName
      expect(newDeck?.name).not.toBe("Base Deck");
      expect(state.currentDeck.id).toBe(newDeck?.id);
    });

    it("should fallback to 'Untitled Deck' base if name is empty", () => {
      const { saveAsCopy, setDeckName } = useDeckStore.getState();
      setDeckName("");
      saveAsCopy("");
      expect(useDeckStore.getState().savedDecks[0].name).toContain(
        "Untitled Deck"
      );
    });

    it("should handle existing decks without names when generating unique name", () => {
      const { saveAsCopy } = useDeckStore.getState();
      useDeckStore.setState({
        savedDecks: [{ ...cloneDeck(INITIAL_DECK), id: "d1" } as any],
      });
      saveAsCopy("Copy Me");
      expect(useDeckStore.getState().savedDecks[1].name).toBe("Copy Me");
    });
  });

  describe("duplicateDeck", () => {
    it("should duplicate a saved deck", () => {
      const { saveDeck, duplicateDeck, setDeckName } = useDeckStore.getState();
      setDeckName("Original");
      saveDeck();
      const originalId = useDeckStore.getState().currentDeck.id!;

      duplicateDeck(originalId);

      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(2);

      const copy = state.savedDecks.find((d) => d.id !== originalId);
      expect(copy).toBeDefined();
      expect(copy?.name).toContain("(Copy)");
      // Should load the copy as current
      expect(state.currentDeck.id).toBe(copy?.id);
    });

    it("should do nothing if target deck ID is not found", () => {
      const { duplicateDeck } = useDeckStore.getState();
      duplicateDeck("bogus-id");
      expect(useDeckStore.getState().savedDecks).toHaveLength(0); // Nothing changed
    });

    it("should duplicate a saved deck without a name using 'Untitled'", () => {
      const { duplicateDeck } = useDeckStore.getState();
      useDeckStore.setState({
        savedDecks: [{ ...cloneDeck(INITIAL_DECK), id: "d1", name: "" }],
      });
      duplicateDeck("d1");
      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(2);
      expect(state.savedDecks[1].name).toContain("Untitled");
    });
  });

  describe("renameSavedDeck", () => {
    it("should update a deck's name without enforcing uniqueness", () => {
      const { saveDeck, setDeckName, renameSavedDeck } =
        useDeckStore.getState();
      setDeckName("Old Name");
      saveDeck();
      const id = useDeckStore.getState().currentDeck.id!;

      renameSavedDeck(id, "New Name");

      const state = useDeckStore.getState();
      expect(state.savedDecks[0].name).toBe("New Name");
    });

    it("should ignore decks with non-matching IDs", () => {
      useDeckStore.setState({
        savedDecks: [{ ...cloneDeck(INITIAL_DECK), id: "d1", name: "Old" }],
      });
      useDeckStore.getState().renameSavedDeck("d2", "New");
      expect(useDeckStore.getState().savedDecks[0].name).toBe("Old");
    });
  });

  describe("deleteDecks", () => {
    it("should batch delete decks and reset currentDeck if included", () => {
      const { saveDeck, setDeckName, deleteDecks } = useDeckStore.getState();

      setDeckName("D1");
      saveDeck();
      const id1 = useDeckStore.getState().currentDeck.id!;

      // Save second as a new deck
      useDeckStore.setState({
        currentDeck: { ...cloneDeck(INITIAL_DECK), id: undefined, name: "D2" },
      });
      saveDeck();
      const id2 = useDeckStore.getState().currentDeck.id!;

      expect(useDeckStore.getState().savedDecks).toHaveLength(2);

      // Delete id2 (which happens to be currentDeck right now)
      deleteDecks([id2]);

      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(1);
      expect(state.savedDecks).toHaveLength(1);
      expect(state.savedDecks[0].id).toBe(id1);
      // currentDeck was deleted, should be reset
      expect(state.currentDeck.id).toBeUndefined();
    });

    it("should not reset currentDeck if it is not in the deleted set", () => {
      const { saveDeck, setDeckName, deleteDecks } = useDeckStore.getState();

      setDeckName("Current");
      saveDeck();
      const currentId = useDeckStore.getState().currentDeck.id!;

      // Manually add another deck to saved list
      useDeckStore.setState({
        savedDecks: [
          ...useDeckStore.getState().savedDecks,
          { ...cloneDeck(INITIAL_DECK), id: "other-id", name: "Other" },
        ],
      });

      deleteDecks(["other-id"]);

      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(1);
      expect(state.currentDeck.id).toBe(currentId); // Unchanged
    });

    it("should delete gracefully even if id doesn't match currentDeck for deleteDeck", () => {
      const { deleteDeck } = useDeckStore.getState();
      useDeckStore.setState({
        savedDecks: [
          { ...cloneDeck(INITIAL_DECK), id: "other", name: "Other" },
        ],
        currentDeck: {
          ...cloneDeck(INITIAL_DECK),
          id: "current",
          name: "Current",
        },
      });
      deleteDeck("other");
      expect(useDeckStore.getState().savedDecks).toHaveLength(0);
      expect(useDeckStore.getState().currentDeck.id).toBe("current");
    });

    it("should delete currentDeck and reset it", () => {
      const { deleteDeck } = useDeckStore.getState();
      useDeckStore.setState({
        savedDecks: [
          { ...cloneDeck(INITIAL_DECK), id: "current", name: "Current" },
        ],
        currentDeck: {
          ...cloneDeck(INITIAL_DECK),
          id: "current",
          name: "Current",
        },
      });
      deleteDeck("current");
      expect(useDeckStore.getState().savedDecks).toHaveLength(0);
      expect(useDeckStore.getState().currentDeck.id).toBeUndefined();
    });
  });

  describe("importDecks", () => {
    it("should import decks with new IDs", () => {
      const { importDecks } = useDeckStore.getState();
      const toImport: Deck[] = [
        { ...cloneDeck(INITIAL_DECK), name: "Import 1", id: "old1" },
        { ...cloneDeck(INITIAL_DECK), name: "Import 2", id: "old2" },
      ];

      importDecks(toImport);

      const state = useDeckStore.getState();
      expect(state.savedDecks).toHaveLength(2);
      expect(state.savedDecks[0].id).not.toBe("old1"); // UUID regenerated
      expect(state.savedDecks[1].id).not.toBe("old2");
      expect(state.savedDecks[0].name).toBe("Import 1");
    });

    it("should fallback to 'Imported Deck' if name is missing", () => {
      const { importDecks } = useDeckStore.getState();
      importDecks([{ ...cloneDeck(INITIAL_DECK), id: "old", name: "" }]);
      expect(useDeckStore.getState().savedDecks[0].name).toBe("Imported Deck");
    });
  });

  describe("importTeams", () => {
    it("should import teams with new IDs", () => {
      const { importTeams } = useDeckStore.getState();
      const toImport: any[] = [{ name: "Team 1", decks: [], id: "old-t1" }];

      importTeams(toImport);

      const state = useDeckStore.getState();
      expect(state.savedTeams).toHaveLength(1);
      expect(state.savedTeams[0].id).toBeDefined();
      expect(state.savedTeams[0].id).not.toBe("old-t1");
      expect(state.savedTeams[0].name).toBe("Team 1");
    });

    it("should fallback to 'Imported Team' if name is missing", () => {
      const { importTeams } = useDeckStore.getState();
      importTeams([{ decks: [], id: "old", name: "" } as any]);
      expect(useDeckStore.getState().savedTeams[0].name).toBe("Imported Team");
    });
  });

  describe("clearSavedDecks", () => {
    it("should wipe savedDecks array", () => {
      const { setSavedDecks, clearSavedDecks } = useDeckStore.getState();
      setSavedDecks([cloneDeck(INITIAL_DECK)]);
      clearSavedDecks();
      expect(useDeckStore.getState().savedDecks).toHaveLength(0);
    });
  });

  describe("importDeckToLibrary", () => {
    it("should import deck with missing name as 'Imported Deck'", () => {
      useDeckStore
        .getState()
        .importDeckToLibrary({ ...cloneDeck(INITIAL_DECK), name: "" });
      expect(useDeckStore.getState().savedDecks[0].name).toBe("Imported Deck");
    });
  });

  describe("checkDeckNameAvailable", () => {
    it("should return false if name exists", () => {
      useDeckStore.setState({
        savedDecks: [{ ...cloneDeck(INITIAL_DECK), id: "d1", name: "Taken" }],
      });
      expect(useDeckStore.getState().checkDeckNameAvailable("Taken")).toBe(
        false
      );
    });
    it("should return true if name exists but ID is excluded", () => {
      useDeckStore.setState({
        savedDecks: [{ ...cloneDeck(INITIAL_DECK), id: "d1", name: "Taken" }],
      });
      expect(
        useDeckStore.getState().checkDeckNameAvailable("Taken", "d1")
      ).toBe(true);
    });
    it("should return true for empty saved deck names", () => {
      useDeckStore.setState({
        savedDecks: [{ ...cloneDeck(INITIAL_DECK), id: "d1", name: "" }],
      });
      expect(useDeckStore.getState().checkDeckNameAvailable("Valid")).toBe(
        true
      );
    });
  });

  describe("saveTeamAsCopy", () => {
    it("should save team as a new copy", () => {
      // We need to properly initialize a team first
      const { saveTeam, saveTeamAsCopy, setTeamName, setTeamSlot } =
        useDeckStore.getState();

      setTeamName("Original Team");
      // Add data to verify deep clone
      const deck0 = useDeckStore.getState().teamDecks[0];
      deck0.slots[0].unit = MockUnit;
      // We must trigger update to teamDecks in store if we mutate it directly? no, Zustand proxied?
      // Ideally use setTeamSlot.
      setTeamSlot(0, 0, MockUnit);

      saveTeam("test-team-id"); // Save Original
      const originalId = useDeckStore.getState().activeTeamId!;

      saveTeamAsCopy("Copy Team");

      const state = useDeckStore.getState();
      expect(state.savedTeams).toHaveLength(2);

      const copyId = state.activeTeamId;
      expect(copyId).not.toBe(originalId);
      expect(state.teamName).toBe("Copy Team");

      // Check deep data capability
      expect(state.teamDecks[0].slots[0].unit).toEqual(MockUnit);
    });

    it("should fallback to 'Untitled Team' if base names are empty", () => {
      useDeckStore.setState({ teamName: "" });
      useDeckStore.getState().saveTeamAsCopy("");
      expect(useDeckStore.getState().savedTeams[0].name).toContain(
        "Untitled Team"
      );
    });

    it("should prefer nameInput over state.teamName", () => {
      useDeckStore.setState({ teamName: "Old" });
      useDeckStore.getState().saveTeamAsCopy("New Copy");
      expect(useDeckStore.getState().savedTeams[0].name).toBe("New Copy");
    });

    it("should handle existing teams without names when generating unique names", () => {
      useDeckStore.setState({ savedTeams: [{ id: "t1", decks: [] } as any] });
      useDeckStore.getState().saveTeamAsCopy("New Copy");
      expect(useDeckStore.getState().savedTeams[1].name).toBe("New Copy");
    });
  });

  describe("upsertSavedTeam", () => {
    it("should insert a team if not present, and update if present", () => {
      const { upsertSavedTeam } = useDeckStore.getState();
      const team = { id: "t-1", name: "Alpha", decks: [] };

      upsertSavedTeam(team as any);
      expect(useDeckStore.getState().savedTeams).toHaveLength(1);

      upsertSavedTeam({ ...team, name: "Beta" } as any);
      expect(useDeckStore.getState().savedTeams).toHaveLength(1);
      expect(useDeckStore.getState().savedTeams[0].name).toBe("Beta");
    });
  });

  describe("Team Deletion Actions", () => {
    it("should delete Team and trigger cascade if active", () => {
      const { upsertSavedTeam, deleteTeam } = useDeckStore.getState();
      upsertSavedTeam({ id: "t-1", name: "Alpha", decks: [] } as any);

      // Make active
      useDeckStore.setState({ activeTeamId: "t-1" });

      deleteTeam("t-1");

      const state = useDeckStore.getState();
      expect(state.savedTeams).toHaveLength(0);
      // Cascaded
      expect(state.activeTeamId).toBeNull();
    });

    it("should batch deleteTeams and cascade if active included", () => {
      const { upsertSavedTeam, deleteTeams } = useDeckStore.getState();
      upsertSavedTeam({ id: "t-1", name: "Alpha", decks: [] } as any);
      upsertSavedTeam({ id: "t-2", name: "Beta", decks: [] } as any);

      useDeckStore.setState({ activeTeamId: "t-2" });

      deleteTeams(["t-1", "t-2"]);

      const state = useDeckStore.getState();
      expect(state.savedTeams).toHaveLength(0);
      // Cascaded
      expect(state.activeTeamId).toBeNull();
    });
  });

  describe("duplicateTeam", () => {
    it("should duplicate a saved team", () => {
      const { upsertSavedTeam, duplicateTeam } = useDeckStore.getState();
      upsertSavedTeam({ id: "t-1", name: "Alpha", decks: [] } as any);

      duplicateTeam("t-1", "Duplicate Team");

      const state = useDeckStore.getState();
      expect(state.savedTeams).toHaveLength(2);
      const copy = state.savedTeams.find((t) => t.id !== "t-1");
      expect(copy).toBeDefined();
      expect(copy?.name).toContain("(Copy)");
    });

    it("should do nothing if target team ID is not found", () => {
      const { duplicateTeam } = useDeckStore.getState();
      duplicateTeam("bogus-id", "Bogus Team");
      expect(useDeckStore.getState().savedTeams).toHaveLength(0); // Nothing changed
    });

    it("should fallback to empty string for team existing names when generating unique name", () => {
      useDeckStore.setState({
        savedTeams: [{ id: "t1", name: "", decks: [] } as any],
      });
      useDeckStore.getState().duplicateTeam("t1", "t2");
      expect(useDeckStore.getState().savedTeams).toHaveLength(2);
    });
  });

  describe("renameSavedTeam", () => {
    it("should ignore teams with non-matching IDs", () => {
      useDeckStore.setState({
        savedTeams: [{ id: "t1", name: "Old", decks: [] } as any],
      });
      useDeckStore.getState().renameSavedTeam("t2", "New");
      expect(useDeckStore.getState().savedTeams[0].name).toBe("Old");
    });

    it("should update a team's name upon match", () => {
      useDeckStore.setState({
        savedTeams: [{ id: "t1", name: "Old", decks: [] } as any],
      });
      useDeckStore.getState().renameSavedTeam("t1", "New");
      expect(useDeckStore.getState().savedTeams[0].name).toBe("New");
    });
  });

  describe("clearSavedTeams", () => {
    it("should wipe savedTeams array", () => {
      const { upsertSavedTeam, clearSavedTeams } = useDeckStore.getState();
      upsertSavedTeam({ id: "t-1", name: "Alpha", decks: [] } as any);
      clearSavedTeams();
      expect(useDeckStore.getState().savedTeams).toHaveLength(0);
    });
  });

  describe("loadDeck", () => {
    it("should load deck and set as current", () => {
      const { saveDeck, setDeckName, loadDeck, clearDeck } =
        useDeckStore.getState();
      setDeckName("To Load");
      saveDeck();
      const id = useDeckStore.getState().currentDeck.id!;

      clearDeck();
      expect(useDeckStore.getState().currentDeck.name).not.toBe("To Load");

      loadDeck(id);
      expect(useDeckStore.getState().currentDeck.name).toBe("To Load");
      expect(useDeckStore.getState().currentDeck.id).toBe(id);
    });

    it("should do nothing if target deck ID is not found", () => {
      const { setDeckName, loadDeck } = useDeckStore.getState();
      setDeckName("Current Name");

      loadDeck("bogus-id");

      expect(useDeckStore.getState().currentDeck.name).toBe("Current Name");
    });
    describe("Adversarial & Edge Cases", () => {
      it("saveDeck: should handle names with only whitespace and fallback to spellcaster", () => {
        const { saveDeck, setDeckName } = useDeckStore.getState();
        setDeckName("   ");
        useDeckStore.setState({
          currentDeck: {
            ...useDeckStore.getState().currentDeck,
            spellcaster: { name: "Whitespace Hero" } as any,
          },
        });
        saveDeck();

        const state = useDeckStore.getState();
        expect(state.savedDecks[0].name).toBe("Whitespace Hero Deck");
      });

      it("deleteDecks: should safely handle empty array", () => {
        const stateBefore = useDeckStore.getState();
        useDeckStore.getState().deleteDecks([]);
        expect(useDeckStore.getState()).toEqual(stateBefore);
      });

      it("checkDeckNameAvailable: string padding matches stripped strings (case-insensitive)", () => {
        useDeckStore.setState({
          savedDecks: [{ ...cloneDeck(INITIAL_DECK), id: "d1", name: "TaKen" }],
        });
        // "  taken  " -> trim() -> "taken" -> lower() -> matches "taken"
        expect(
          useDeckStore.getState().checkDeckNameAvailable("  taken  ")
        ).toBe(false);
      });

      it("importDecks: empty array does nothing", () => {
        const { importDecks } = useDeckStore.getState();
        importDecks([]);
        expect(useDeckStore.getState().savedDecks).toHaveLength(0);
      });

      it("saveAsCopy: generates correctly incremented (Copy N) strings for identically named base decks", () => {
        useDeckStore.setState({
          savedDecks: [
            { ...cloneDeck(INITIAL_DECK), id: "d1", name: "Base" },
            { ...cloneDeck(INITIAL_DECK), id: "d2", name: "Base (Copy)" },
          ],
          currentDeck: { ...cloneDeck(INITIAL_DECK), id: "d1", name: "Base" },
        });

        const { saveAsCopy } = useDeckStore.getState();
        saveAsCopy(); // Should generate "Base (Copy 2)"

        const names = useDeckStore.getState().savedDecks.map((d) => d.name);
        expect(names).toContain("Base (Copy 2)");
      });
    });
  });
});
