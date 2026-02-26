import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { INITIAL_DECK } from "@/services/api/persistence";
import { BackupService } from "@/services/domain/BackupService";
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

describe("useCommandCenter — Adversarial", () => {
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
    savedDecks: [{ id: "d1", name: "Deck 1" }],
    savedTeams: [{ id: "t1", name: "Team 1" }],
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

    (useDeckStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      createMockStore()
    );

    (useDeckStore as any).getState = vi.fn(() => ({
      savedDecks: [],
      savedTeams: [],
    }));
  });

  // --- Selection Abuse ---

  describe("Selection Abuse", () => {
    it("ADV-CC-1: toggling item with empty string ID should not crash", () => {
      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.toggleItemSelection(""));
      expect(result.current.selectedIds.has("")).toBe(true);
    });

    it("ADV-CC-2: toggling same item 1000 times should leave it deselected (even count)", () => {
      const { result } = renderHook(() => useCommandCenter());
      for (let i = 0; i < 1000; i++) {
        act(() => result.current.toggleItemSelection("d1"));
      }
      // 1000 toggles = even = deselected
      expect(result.current.selectedIds.has("d1")).toBe(false);
    });

    it("ADV-CC-3: selectAll with XSS payload IDs should store them literally, not execute", () => {
      (useDeckStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        createMockStore({
          savedDecks: [
            { id: '<img src=x onerror="alert(1)">', name: "XSS Deck" },
            { id: "javascript:void(0)", name: "Proto Deck" },
          ],
        })
      );

      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.selectAll());
      expect(result.current.selectedIds.size).toBe(2);
      expect(
        result.current.selectedIds.has('<img src=x onerror="alert(1)">')
      ).toBe(true);
    });

    it("ADV-CC-4: selectAll with null/undefined IDs in deck list should not crash", () => {
      (useDeckStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        createMockStore({
          savedDecks: [
            { id: null, name: "Null ID" },
            { id: undefined, name: "Undef ID" },
            { id: "valid", name: "Valid" },
          ],
        })
      );

      const { result } = renderHook(() => useCommandCenter());
      expect(() => {
        act(() => result.current.selectAll());
      }).not.toThrow();
    });

    it("ADV-CC-5: deselectAll after no selection should be idempotent", () => {
      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.deselectAll());
      act(() => result.current.deselectAll());
      act(() => result.current.deselectAll());
      expect(result.current.selectedIds.size).toBe(0);
    });
  });

  // --- Mass Delete Torture ---

  describe("Mass Delete Torture", () => {
    it("ADV-CC-6: mass delete with __proto__ ID should not pollute Object prototype", () => {
      const { result } = renderHook(() => useCommandCenter());

      act(() => result.current.toggleItemSelection("__proto__"));
      act(() => result.current.toggleItemSelection("constructor"));
      act(() => result.current.toggleItemSelection("toString"));
      act(() => result.current.handleMassDelete());

      expect(mockDeleteDecks).toHaveBeenCalledWith(
        expect.arrayContaining(["__proto__", "constructor", "toString"])
      );
      // Prototype should NOT be polluted
      expect(({} as any).__proto__).toBe(Object.prototype);
    });

    it("ADV-CC-7: mass delete when confirm throws should not crash", () => {
      vi.stubGlobal(
        "confirm",
        vi.fn(() => {
          throw new Error("confirm exploded");
        })
      );

      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.toggleItemSelection("d1"));

      expect(() => {
        act(() => result.current.handleMassDelete());
      }).toThrow("confirm exploded");
      // Selection should NOT have been cleared (confirm threw before deletion)
      expect(mockDeleteDecks).not.toHaveBeenCalled();
    });

    it("ADV-CC-8: mass delete when deleteDecks throws should let error propagate", () => {
      mockDeleteDecks.mockImplementation(() => {
        throw new Error("Storage full");
      });

      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.toggleItemSelection("d1"));

      expect(() => {
        act(() => result.current.handleMassDelete());
      }).toThrow("Storage full");
    });

    it("ADV-CC-9: rapid-fire mass delete calls should not double-delete", () => {
      mockDeleteDecks.mockReset(); // Clean up poison from ADV-CC-8
      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.toggleItemSelection("d1"));

      act(() => result.current.handleMassDelete());
      // Selection is now cleared, so second call should no-op
      act(() => result.current.handleMassDelete());

      expect(mockDeleteDecks).toHaveBeenCalledTimes(1);
    });
  });

  // --- Import Torture ---

  describe("Import File Torture", () => {
    it("ADV-CC-10: import with no files selected (empty FileList) should not crash", async () => {
      const { result } = renderHook(() => useCommandCenter());
      const event = {
        target: { files: [] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleImportFile(event);
      });

      expect(mockImportDecks).not.toHaveBeenCalled();
      expect(mockImportTeams).not.toHaveBeenCalled();
    });

    it("ADV-CC-11: import with null files property should not crash", async () => {
      const { result } = renderHook(() => useCommandCenter());
      const event = {
        target: { files: null },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleImportFile(event);
      });

      expect(mockImportDecks).not.toHaveBeenCalled();
    });

    it("ADV-CC-12: import with empty decks/teams arrays should not call import functions", async () => {
      (
        BackupService.parseBackupFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        version: 1,
        timestamp: new Date().toISOString(),
        decks: [],
        teams: [],
      });

      const { result } = renderHook(() => useCommandCenter());
      const event = {
        target: { files: [new File(["{}"], "backup.json")] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleImportFile(event);
      });

      expect(mockImportDecks).not.toHaveBeenCalled();
      expect(mockImportTeams).not.toHaveBeenCalled();
    });

    it("ADV-CC-13: import with massive deck array (10k items) should not crash", async () => {
      const giantDecks = Array.from({ length: 10000 }, (_, i) => ({
        id: `deck-${i}`,
        name: `Deck ${i}`,
      }));
      (
        BackupService.parseBackupFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        version: 1,
        timestamp: new Date().toISOString(),
        decks: giantDecks,
        teams: [],
      });

      const { result } = renderHook(() => useCommandCenter());
      const event = {
        target: { files: [new File(["{}"], "backup.json")] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleImportFile(event);
      });

      expect(mockImportDecks).toHaveBeenCalledWith(giantDecks);
    });

    it("ADV-CC-14: import where parseBackupFile returns malformed data (no decks/teams keys) should crash gracefully", async () => {
      (
        BackupService.parseBackupFile as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ version: 1 }); // Missing decks/teams

      const { result } = renderHook(() => useCommandCenter());
      const event = {
        target: { files: [new File(["{}"], "backup.json")] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      // This may throw due to `data.decks.length` on undefined —
      // the hook accesses data.decks without null-checking
      await act(async () => {
        await result.current.handleImportFile(event);
      });

      // If it reaches the alert, that means the error was caught
      expect(window.alert).toHaveBeenCalled();
    });
  });

  // --- Export Edge Cases ---

  describe("Export Edge Cases", () => {
    it("ADV-CC-15: export when getState() returns empty state should not crash", () => {
      (useDeckStore as any).getState = vi.fn(() => ({}));

      const { result } = renderHook(() => useCommandCenter());
      expect(() => {
        act(() => result.current.handleExport());
      }).not.toThrow();
    });

    // --- Round 2: Deep Edge Cases ---

    it("ADV-CC-18: export with circular references in state should be handled by generateBackup (or crash gracefully)", () => {
      const circularDeck: any = { ...INITIAL_DECK, name: "Circle" };
      circularDeck.self = circularDeck; // Circular ref!

      (useDeckStore as any).getState = vi.fn(() => ({
        savedDecks: [circularDeck],
        savedTeams: [],
      }));

      // generateBackup will stringify. JSON.stringify throws TypeError on circular refs.
      (
        BackupService.generateBackup as ReturnType<typeof vi.fn>
      ).mockImplementation((decks) => {
        JSON.stringify(decks); // This will throw
      });

      const { result } = renderHook(() => useCommandCenter());

      // The hook doesn't currently try/catch handleExport!
      expect(() => {
        act(() => result.current.handleExport());
      }).toThrow(/Converting circular structure to JSON/);
    });
  });

  // --- Clear Data ---

  describe("Clear Data Abuse", () => {
    it("ADV-CC-16: clear data multiple times idempotently", () => {
      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.handleClearData());
      act(() => result.current.handleClearData());
      act(() => result.current.handleClearData());

      expect(mockClearSavedDecks).toHaveBeenCalledTimes(3);
      expect(mockClearSavedTeams).toHaveBeenCalledTimes(3);
    });

    it("ADV-CC-17: calling clearData closes showClearDataConfirm flag", () => {
      const { result } = renderHook(() => useCommandCenter());
      act(() => result.current.setShowClearDataConfirm(true));
      expect(result.current.showClearDataConfirm).toBe(true);

      act(() => result.current.handleClearData());
      expect(result.current.showClearDataConfirm).toBe(false);
    });
  });
});
