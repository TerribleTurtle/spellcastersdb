import { beforeEach, describe, expect, it } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { BackupService } from "@/services/domain/BackupService";

import { useDeckStore } from "./index";

describe("Mass Delete & Backup", () => {
  beforeEach(() => {
    useDeckStore.setState({
      savedDecks: [],
      savedTeams: [],
      currentDeck: INITIAL_DECK,
      activeTeamId: null,
      teamDecks: [INITIAL_DECK, INITIAL_DECK, INITIAL_DECK],
    });
  });

  describe("Mass Delete", () => {
    it("should delete multiple decks", () => {
      const { saveDeck, setDeckName, deleteDecks } = useDeckStore.getState();

      // Create 3 decks
      setDeckName("Deck 1");
      saveDeck();
      useDeckStore.setState({
        currentDeck: { ...INITIAL_DECK, id: undefined, name: "" },
      });
      setDeckName("Deck 2");
      saveDeck();
      useDeckStore.setState({
        currentDeck: { ...INITIAL_DECK, id: undefined, name: "" },
      });
      setDeckName("Deck 3");
      saveDeck();

      const { savedDecks } = useDeckStore.getState();
      expect(savedDecks.length).toBe(3);

      const idsToDelete = [savedDecks[0].id!, savedDecks[1].id!];

      deleteDecks(idsToDelete);

      const { savedDecks: remaining } = useDeckStore.getState();
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe(savedDecks[2].id);
    });

    it("should delete multiple teams", () => {
      const { saveTeam, setTeamName, deleteTeams } = useDeckStore.getState();

      setTeamName("Team 1");
      saveTeam("id-1");
      useDeckStore.setState({ activeTeamId: null });
      setTeamName("Team 2");
      saveTeam("id-2");
      useDeckStore.setState({ activeTeamId: null });
      setTeamName("Team 3");
      saveTeam("id-3");
      useDeckStore.setState({ activeTeamId: null });

      const { savedTeams } = useDeckStore.getState();
      expect(savedTeams.length).toBe(3);

      deleteTeams(["id-1", "id-3"]);

      const { savedTeams: remaining } = useDeckStore.getState();
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe("id-2");
    });
  });

  describe("Backup Service", () => {
    it("should generate valid backup data", () => {
      const { saveDeck, setDeckName, saveTeam, setTeamName } =
        useDeckStore.getState();

      setDeckName("Backup Deck");
      saveDeck();
      setTeamName("Backup Team");
      saveTeam("team-id");

      const state = useDeckStore.getState();
      const backup = BackupService.generateBackup(state);

      expect(backup.version).toBe(1);
      expect(backup.decks.length).toBe(1);
      expect(backup.teams.length).toBe(1);
      expect(backup.decks[0].name).toBe("Backup Deck");
      expect(backup.teams[0].name).toBe("Backup Team");
    });

    it("should validate correct data structure", () => {
      const validData = {
        version: 1,
        timestamp: "2024-01-01",
        decks: [],
        teams: [],
      };
      expect(BackupService.validateBackup(validData)).toBe(true);

      const invalidData = {
        version: 1,
        decks: "not-an-array",
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(BackupService.validateBackup(invalidData as any)).toBe(false);
    });
  });
});
