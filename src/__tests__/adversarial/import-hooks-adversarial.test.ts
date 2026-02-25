// @vitest-environment jsdom
import { useSearchParams } from "next/navigation";

import { act, renderHook, waitFor } from "@testing-library/react";
import { Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { useImportLogic } from "@/features/deck-builder/hooks/domain/useImportLogic";
import { useSoloImport } from "@/features/deck-builder/hooks/useSoloImport";
import { useTeamImport } from "@/features/team-builder/hooks/useTeamImport";
import { useTeamImportAutoResolve } from "@/features/team-builder/hooks/useTeamImportAutoResolve";
import { INITIAL_DECK } from "@/services/api/persistence";
import { decodeDeck } from "@/services/utils/encoding";
import { useDeckStore } from "@/store/index";
import { Team } from "@/types/deck";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

vi.mock("@/services/utils/encoding", () => ({
  decodeDeck: vi.fn(),
}));

describe("Phase 3 — Hook-Level Import Adversarial Tests", () => {
  describe("useSoloImport Adversarial", () => {
    let mockGet: Mock;

    beforeEach(() => {
      mockGet = vi.fn();
      (useSearchParams as Mock).mockReturnValue({ get: mockGet });
      useDeckStore.setState({ currentDeck: INITIAL_DECK });
      vi.clearAllMocks();
    });

    it("ADV-HOOKS-1: hash decodes to null (invalid URL)", async () => {
      mockGet.mockReturnValue("invalid-hash");
      (decodeDeck as Mock).mockReturnValue(null);
      const onErrorMock = vi.fn();

      renderHook(() =>
        useSoloImport({
          units: [],
          spellcasters: [],
          mode: "SOLO",
          onError: onErrorMock,
        })
      );

      // Effect runs, decode returns null. Should not crash, should not mutate store.
      await waitFor(() => {
        expect(decodeDeck).toHaveBeenCalledWith("invalid-hash");
      });
    });

    it("ADV-HOOKS-2: URL contains a script tag bypassing router bounds", async () => {
      const maliciousHash = "<script>alert('xss')</script>";
      mockGet.mockReturnValue(maliciousHash);

      const storedError = new Error("lz-string error");
      (decodeDeck as Mock).mockImplementation(() => {
        throw storedError;
      });
      const onErrorMock = vi.fn();

      renderHook(() =>
        useSoloImport({
          units: [],
          spellcasters: [],
          mode: "SOLO",
          onError: onErrorMock,
        })
      );

      await waitFor(() => {
        expect(onErrorMock).toHaveBeenCalledWith(
          "Failed to load deck from URL"
        );
      });
    });
  });

  describe("useTeamImport Adversarial", () => {
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

    it("ADV-HOOKS-3: performSave with viewingTeamData containing 0 decks", () => {
      const { result } = renderHook(() =>
        useTeamImport({ ...baseProps, viewingTeamData: [] })
      );

      act(() => {
        result.current.performSave("Empty Team");
      });

      // loadTeamFromData expects 3 new IDs. But viewingTeamData maps 0 items.
      // It should call it anyway and not crash.
      expect(baseProps.loadTeamFromData).toHaveBeenCalledWith([], []);
    });

    it("ADV-HOOKS-4: performSave with XSS team name creates collision checks cleanly", () => {
      const existingTeams = [
        { id: "t1", name: "<img src=x onerror=alert(1)>", decks: [] },
      ];
      const { result } = renderHook(() =>
        useTeamImport({ ...baseProps, savedTeams: existingTeams as any })
      );

      act(() => {
        result.current.performSave("<img src=x onerror=alert(1)>");
      });

      // Should find the existing XSS name and overwrite it properly instead of creating a new ID
      expect(baseProps.saveTeam).toHaveBeenCalledWith(
        "t1",
        "<img src=x onerror=alert(1)>"
      );
    });

    it("ADV-HOOKS-5: performSave when savedTeams contains duplicate names", () => {
      // Very weird state: two teams with the same name
      const existingTeams = [
        { id: "t1", name: "Dupe", decks: [] },
        { id: "t2", name: "Dupe", decks: [] },
      ];
      const { result } = renderHook(() =>
        useTeamImport({ ...baseProps, savedTeams: existingTeams as any })
      );

      act(() => {
        result.current.performSave("Dupe");
      });

      // Should pick the FIRST match via `find`
      expect(baseProps.saveTeam).toHaveBeenCalledWith("t1", "Dupe");
    });
  });

  describe("Auto-Resolve Race Conditions Adversarial", () => {
    beforeEach(() => {
      useDeckStore.setState({
        pendingImport: { name: "Pending", slots: [] } as any,
        resolvePendingImport: vi.fn(),
      });
    });

    it("ADV-HOOKS-6: useImportLogic rapid toggle of isEmpty vs hasChanges bypasses resolution", () => {
      const { rerender } = renderHook((props) => useImportLogic(props), {
        initialProps: { isEmpty: false, hasChanges: true },
      });

      const resolveSpy = useDeckStore.getState().resolvePendingImport;
      expect(resolveSpy).not.toHaveBeenCalled();

      // Rapidly flip flags making it clean
      rerender({ isEmpty: false, hasChanges: false });
      expect(resolveSpy).toHaveBeenCalledWith("OVERWRITE");
    });

    it("ADV-HOOKS-7: useTeamImportAutoResolve rapid flag toggle triggers cascade", () => {
      const { rerender } = renderHook(
        (props) => useTeamImportAutoResolve(props),
        { initialProps: { isEmpty: false, hasChanges: true } }
      );

      const resolveSpy = useDeckStore.getState().resolvePendingImport;
      expect(resolveSpy).not.toHaveBeenCalled();

      // Rapidly empty the team
      rerender({ isEmpty: true, hasChanges: true });
      expect(resolveSpy).toHaveBeenCalledWith("OVERWRITE");
    });
  });
});
