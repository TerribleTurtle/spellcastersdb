import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BackupData, BackupService } from "@/services/domain/BackupService";
import { useDeckStore } from "@/store/index";

import { useCommandCenter } from "../useCommandCenter";

// --- Mocks ---

vi.mock("@/store/index", () => ({
  useDeckStore: vi.fn(),
}));

vi.mock("@/services/domain/BackupService", () => ({
  BackupService: {
    generateBackup: vi.fn(),
    downloadBackup: vi.fn(),
    parseBackupFile: vi.fn(),
  },
}));

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
  },
}));

describe("useCommandCenter", () => {
  const mockDeleteDecks = vi.fn();
  const mockDeleteTeams = vi.fn();
  const mockImportDecks = vi.fn();
  const mockImportTeams = vi.fn();
  const mockClearSavedDecks = vi.fn();
  const mockClearSavedTeams = vi.fn();
  const mockCloseCommandCenter = vi.fn();

  const createMockStore = (overrides: Record<string, unknown> = {}) => ({
    commandCenterOpen: false,
    closeCommandCenter: mockCloseCommandCenter,
    mode: "SOLO" as const,
    isImporting: false,
    savedDecks: [
      { id: "d1", name: "Deck 1" },
      { id: "d2", name: "Deck 2" },
    ],
    savedTeams: [
      { id: "t1", name: "Team 1" },
      { id: "t2", name: "Team 2" },
    ],
    deleteDecks: mockDeleteDecks,
    deleteTeams: mockDeleteTeams,
    importDecks: mockImportDecks,
    importTeams: mockImportTeams,
    clearSavedDecks: mockClearSavedDecks,
    clearSavedTeams: mockClearSavedTeams,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true)
    );
    vi.stubGlobal("alert", vi.fn());

    // Default mock: SOLO mode with 2 decks, 2 teams
    (useDeckStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      createMockStore()
    );

    // Mock getState for handleExport
    (useDeckStore as any).getState = vi.fn(() => ({
      savedDecks: [],
      savedTeams: [],
    }));
  });

  // --- Selection Mode Tests ---

  describe("toggleSelectionMode", () => {
    it("should toggle selection mode on", () => {
      const { result } = renderHook(() => useCommandCenter());
      expect(result.current.selectionMode).toBe(false);

      act(() => result.current.toggleSelectionMode());
      expect(result.current.selectionMode).toBe(true);
    });

    it("should clear selectedIds when toggling off", () => {
      const { result } = renderHook(() => useCommandCenter());

      // Toggle on, select an item, then toggle off
      act(() => result.current.toggleSelectionMode());
      act(() => result.current.toggleItemSelection("d1"));
      expect(result.current.selectedIds.size).toBe(1);

      act(() => result.current.toggleSelectionMode());
      expect(result.current.selectionMode).toBe(false);
      expect(result.current.selectedIds.size).toBe(0);
    });
  });

  describe("toggleItemSelection", () => {
    it("should add an ID to the selection", () => {
      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.toggleItemSelection("d1"));
      expect(result.current.selectedIds.has("d1")).toBe(true);
    });

    it("should remove an ID on re-toggle", () => {
      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.toggleItemSelection("d1"));
      act(() => result.current.toggleItemSelection("d1"));
      expect(result.current.selectedIds.has("d1")).toBe(false);
    });
  });

  describe("selectAll / deselectAll", () => {
    it("should select all deck IDs in SOLO mode", () => {
      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.selectAll());
      expect(result.current.selectedIds).toEqual(new Set(["d1", "d2"]));
    });

    it("should select all team IDs in TEAM mode", () => {
      (useDeckStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        createMockStore({ mode: "TEAM" })
      );

      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.selectAll());
      expect(result.current.selectedIds).toEqual(new Set(["t1", "t2"]));
    });

    it("should empty the selection set on deselectAll", () => {
      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.selectAll());
      act(() => result.current.deselectAll());
      expect(result.current.selectedIds.size).toBe(0);
    });
  });

  // --- Mass Delete ---

  describe("handleMassDelete", () => {
    it("should call deleteDecks in SOLO mode and clear selection", () => {
      const { result } = renderHook(() => useCommandCenter());

      act(() => result.current.toggleItemSelection("d1"));
      act(() => result.current.toggleItemSelection("d2"));
      act(() => result.current.handleMassDelete());

      expect(mockDeleteDecks).toHaveBeenCalledWith(
        expect.arrayContaining(["d1", "d2"])
      );
      expect(result.current.selectedIds.size).toBe(0);
    });

    it("should call deleteTeams in TEAM mode", () => {
      (useDeckStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        createMockStore({ mode: "TEAM" })
      );

      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.toggleItemSelection("t1"));
      act(() => result.current.handleMassDelete());

      expect(mockDeleteTeams).toHaveBeenCalledWith(["t1"]);
    });

    it("should no-op when selectedIds is empty", () => {
      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.handleMassDelete());

      expect(mockDeleteDecks).not.toHaveBeenCalled();
      expect(mockDeleteTeams).not.toHaveBeenCalled();
    });

    it("should no-op when user cancels confirm dialog", () => {
      vi.stubGlobal(
        "confirm",
        vi.fn(() => false)
      );

      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.toggleItemSelection("d1"));
      act(() => result.current.handleMassDelete());

      expect(mockDeleteDecks).not.toHaveBeenCalled();
    });
  });

  // --- Export ---

  describe("handleExport", () => {
    it("should call BackupService.generateBackup and downloadBackup", () => {
      const mockBackup = { version: 1, decks: [], teams: [] };
      (
        BackupService.generateBackup as ReturnType<typeof vi.fn>
      ).mockReturnValue(mockBackup);

      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.handleExport());

      expect(BackupService.generateBackup).toHaveBeenCalled();
      expect(BackupService.downloadBackup).toHaveBeenCalledWith(
        mockBackup,
        expect.stringMatching(/^spellcasters_backup_\d{4}-\d{2}-\d{2}\.json$/)
      );
    });
  });

  // --- Import ---

  describe("handleImportClick", () => {
    it("should set showImportConfirm to true", () => {
      const { result } = renderHook(() => useCommandCenter());
      expect(result.current.showImportConfirm).toBe(false);

      act(() => result.current.handleImportClick());
      expect(result.current.showImportConfirm).toBe(true);
    });
  });

  describe("handleImportFile", () => {
    it("should parse a valid file and call importDecks + importTeams", async () => {
      const mockData: BackupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        decks: [{ id: "imported-d1" }] as any,
        teams: [{ id: "imported-t1" }] as any,
      };
      (
        BackupService.parseBackupFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockData);

      const { result } = renderHook(() => useCommandCenter());
      const event = {
        target: { files: [new File(["{}"], "backup.json")] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleImportFile(event);
      });

      expect(mockImportDecks).toHaveBeenCalledWith(mockData.decks);
      expect(mockImportTeams).toHaveBeenCalledWith(mockData.teams);
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining("1 decks")
      );
    });

    it("should alert on invalid/corrupt file", async () => {
      (
        BackupService.parseBackupFile as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("Invalid backup"));

      const { result } = renderHook(() => useCommandCenter());
      const event = {
        target: { files: [new File(["bad"], "bad.json")] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleImportFile(event);
      });

      expect(mockImportDecks).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Failed to parse backup file.");
    });
  });

  // --- Clear Data ---

  describe("handleClearData", () => {
    it("should call clearSavedDecks and clearSavedTeams", () => {
      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.handleClearData());

      expect(mockClearSavedDecks).toHaveBeenCalled();
      expect(mockClearSavedTeams).toHaveBeenCalled();
    });
  });
});
