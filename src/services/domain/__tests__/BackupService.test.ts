import { describe, it, expect, vi } from "vitest";
import { BackupService, BackupData } from "../BackupService";
import { DeckBuilderState } from "@/store/types";
import { Deck, Team } from "@/types/deck";

// --- Minimal mock state for generateBackup ---

const mockState = (
  overrides: Partial<Pick<DeckBuilderState, "savedDecks" | "savedTeams">> = {}
): DeckBuilderState =>
  ({
    savedDecks: [],
    savedTeams: [],
    ...overrides,
  } as unknown as DeckBuilderState);

// --- Tests ---

describe("BackupService", () => {
  describe("generateBackup", () => {
    it("should return correct shape with version, timestamp, decks, teams", () => {
      const mockDecks = [{ id: "d1", name: "Deck 1" }] as unknown as Deck[];
      const mockTeams = [{ id: "t1", name: "Team 1" }] as unknown as Team[];

      const backup = BackupService.generateBackup(
        mockState({ savedDecks: mockDecks, savedTeams: mockTeams })
      );

      expect(backup.version).toBe(1);
      expect(backup.timestamp).toBeDefined();
      expect(backup.decks).toEqual(mockDecks);
      expect(backup.teams).toEqual(mockTeams);
    });

    it("should set version to 1", () => {
      const backup = BackupService.generateBackup(mockState());
      expect(backup.version).toBe(1);
    });

    it("should produce an ISO timestamp", () => {
      const backup = BackupService.generateBackup(mockState());
      expect(backup.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe("validateBackup", () => {
    it("should reject null", () => {
      expect(BackupService.validateBackup(null)).toBe(false);
    });

    it("should reject missing decks", () => {
      expect(BackupService.validateBackup({ teams: [] })).toBe(false);
    });

    it("should reject non-array teams", () => {
      expect(BackupService.validateBackup({ decks: [], teams: "bad" })).toBe(false);
    });

    it("should accept valid shape", () => {
      const valid: BackupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        decks: [],
        teams: [],
      };
      expect(BackupService.validateBackup(valid)).toBe(true);
    });
  });

  describe("parseBackupFile", () => {
    it("should reject invalid JSON", async () => {
      const file = new File(["not { json"], "bad.json", { type: "application/json" });
      await expect(BackupService.parseBackupFile(file)).rejects.toThrow();
    });

    it("should reject invalid structure", async () => {
      const file = new File(
        [JSON.stringify({ version: 1 })], // missing decks/teams
        "invalid.json",
        { type: "application/json" }
      );
      await expect(BackupService.parseBackupFile(file)).rejects.toThrow(
        "Invalid backup file format"
      );
    });

    it("should accept valid JSON file", async () => {
      const validData: BackupData = {
        version: 1,
        timestamp: "2026-01-01T00:00:00.000Z",
        decks: [],
        teams: [],
      };
      const file = new File([JSON.stringify(validData)], "backup.json", {
        type: "application/json",
      });

      const result = await BackupService.parseBackupFile(file);

      expect(result.version).toBe(1);
      expect(result.decks).toEqual([]);
      expect(result.teams).toEqual([]);
    });
  });
});
