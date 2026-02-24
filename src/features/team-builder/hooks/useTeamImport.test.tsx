// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Deck, Team } from "@/types/deck";

import { useTeamImport } from "./useTeamImport";

vi.mock("uuid", () => ({
  v4: () => "mocked-uuid",
}));

// Mock the auto-resolve hook dependencies
vi.mock("./useTeamImportAutoResolve", () => ({
  useTeamImportAutoResolve: vi.fn(({ hasChanges }) => ({
    // If there are changes, we might show a conflict, else false.
    // For this test, we just pass through.
    showConflictModal: hasChanges,
  })),
}));

describe("useTeamImport", () => {
  const baseProps = {
    viewingTeamData: null,
    loadTeamFromData: vi.fn(),
    saveTeam: vi.fn(),
    setViewingTeam: vi.fn(),
    setViewSummary: vi.fn(),
    setActiveSlot: vi.fn(),
    setPendingImport: vi.fn(),
    resolvePendingImport: vi.fn(),
    isEmpty: true,
    hasChanges: false,
    savedTeams: [] as Team[],
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("handleSave", () => {
    it("should open the save modal", () => {
      const { result } = renderHook(() => useTeamImport(baseProps));

      expect(result.current.showSaveModal).toBe(false);

      act(() => {
        result.current.handleSave();
      });

      expect(result.current.showSaveModal).toBe(true);
    });
  });

  describe("performSave (Workspace Mode)", () => {
    it("should save current workspace without overwriting viewData when viewingTeamData is null", () => {
      const { result } = renderHook(() => useTeamImport(baseProps));

      act(() => {
        result.current.performSave("My Cool Team");
      });

      expect(baseProps.setActiveSlot).toHaveBeenCalledWith(0);
      expect(baseProps.setViewSummary).toHaveBeenCalledWith(false);
      expect(baseProps.saveTeam).toHaveBeenCalledWith(
        "mocked-uuid",
        "My Cool Team"
      );
      expect(result.current.showSaveModal).toBe(false);
      expect(baseProps.loadTeamFromData).not.toHaveBeenCalled();
    });

    it("should overwrite existing team if name matches an existing team in workspace mode", () => {
      const existingTeams: Team[] = [
        {
          id: "existing-id",
          name: "Alpha",
          decks: [] as unknown as Team["decks"],
        },
      ];
      const { result } = renderHook(() =>
        useTeamImport({ ...baseProps, savedTeams: existingTeams })
      );

      act(() => {
        result.current.performSave("Alpha");
      });

      // Should use existing ID
      expect(baseProps.saveTeam).toHaveBeenCalledWith("existing-id", "Alpha");
    });
  });

  describe("performSave (Viewing Import Mode)", () => {
    const viewingTeamData = [{ id: "deck1" } as Deck];

    it("should trigger loadTeamFromData and set new active state when saving an imported team", () => {
      const { result } = renderHook(() =>
        useTeamImport({ ...baseProps, viewingTeamData })
      );

      act(() => {
        result.current.performSave("New Team From Import");
      });

      expect(baseProps.setActiveSlot).toHaveBeenCalledWith(null); // clears first

      // Because it maps via length, and uuid returns "mocked-uuid"
      expect(baseProps.loadTeamFromData).toHaveBeenCalledWith(viewingTeamData, [
        "mocked-uuid",
      ]);
      expect(baseProps.saveTeam).toHaveBeenCalledWith(
        "mocked-uuid",
        "New Team From Import"
      );

      expect(baseProps.setViewingTeam).toHaveBeenCalledWith(null);
      expect(baseProps.setViewSummary).toHaveBeenCalledWith(false);
      expect(baseProps.setActiveSlot).toHaveBeenCalledWith(0);
      expect(result.current.showSaveModal).toBe(false);
    });

    it("should overwrite existing team ID if saved with same name as existing while importing", () => {
      const existingTeams: Team[] = [
        {
          id: "beta-team",
          name: "Beta",
          decks: [] as unknown as Team["decks"],
        },
      ];
      const { result } = renderHook(() =>
        useTeamImport({
          ...baseProps,
          viewingTeamData,
          savedTeams: existingTeams,
        })
      );

      act(() => {
        result.current.performSave("Beta");
      });

      expect(baseProps.saveTeam).toHaveBeenCalledWith("beta-team", "Beta");
    });
  });

  describe("Import Resolutions", () => {
    it("should handle handleImportCancel", () => {
      const { result } = renderHook(() => useTeamImport(baseProps));
      act(() => result.current.handleImportCancel());
      expect(baseProps.setPendingImport).toHaveBeenCalledWith(null);
    });

    it("should handle handleImportConfirm (OVERWRITE)", () => {
      const { result } = renderHook(() => useTeamImport(baseProps));
      act(() => result.current.handleImportConfirm());
      expect(baseProps.resolvePendingImport).toHaveBeenCalledWith("OVERWRITE");
    });

    it("should handle handleImportSaveAndOverwrite (SAVE_AND_OVERWRITE)", () => {
      const { result } = renderHook(() => useTeamImport(baseProps));
      act(() => result.current.handleImportSaveAndOverwrite());
      expect(baseProps.resolvePendingImport).toHaveBeenCalledWith(
        "SAVE_AND_OVERWRITE"
      );
    });
  });

  describe("showConflictModal pass-through", () => {
    it("should be true if hasChanges is true via useTeamImportAutoResolve", () => {
      const { result } = renderHook(() =>
        useTeamImport({ ...baseProps, hasChanges: true })
      );

      expect(result.current.showConflictModal).toBe(true);
    });
  });
});
