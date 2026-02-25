// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeckStore } from "@/store/index";

import { useTeamImportAutoResolve } from "./useTeamImportAutoResolve";

describe("useTeamImportAutoResolve", () => {
  let resolvePendingImportSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    useDeckStore.setState({
      pendingImport: null,
    });

    resolvePendingImportSpy = vi.spyOn(
      useDeckStore.getState(),
      "resolvePendingImport"
    );
  });

  describe("Auto Resolution (useEffect)", () => {
    it("should NOT resolve if pendingImport is falsy", () => {
      renderHook(() =>
        useTeamImportAutoResolve({ isEmpty: true, hasChanges: false })
      );

      expect(resolvePendingImportSpy).not.toHaveBeenCalled();
    });

    it("should dispatch OVERWRITE if pendingImport exists and deck is empty", () => {
      useDeckStore.setState({ pendingImport: {} as any });

      renderHook(() =>
        useTeamImportAutoResolve({ isEmpty: true, hasChanges: true })
      );

      expect(resolvePendingImportSpy).toHaveBeenCalledWith("OVERWRITE");
    });

    it("should dispatch OVERWRITE if pendingImport exists and NO changes are present", () => {
      useDeckStore.setState({ pendingImport: {} as any });

      renderHook(() =>
        useTeamImportAutoResolve({ isEmpty: false, hasChanges: false })
      );

      expect(resolvePendingImportSpy).toHaveBeenCalledWith("OVERWRITE");
    });

    it("should NOT resolve if pendingImport exists, deck is NOT empty, and HAS changes", () => {
      useDeckStore.setState({ pendingImport: {} as any });

      renderHook(() =>
        useTeamImportAutoResolve({ isEmpty: false, hasChanges: true })
      );

      expect(resolvePendingImportSpy).not.toHaveBeenCalled();
    });
  });

  describe("Computed showConflictModal", () => {
    it("should return false if pendingImport is falsy", () => {
      useDeckStore.setState({ pendingImport: null });

      const { result } = renderHook(() =>
        useTeamImportAutoResolve({ isEmpty: false, hasChanges: true })
      );

      expect(result.current.showConflictModal).toBeFalsy();
    });

    it("should return true ONLY when pendingImport exists, is not empty, and has changes", () => {
      useDeckStore.setState({ pendingImport: {} as any });

      const { result } = renderHook(() =>
        useTeamImportAutoResolve({ isEmpty: false, hasChanges: true })
      );

      expect(result.current.showConflictModal).toBeTruthy();
    });

    it("should return false if empty", () => {
      useDeckStore.setState({ pendingImport: {} as any });

      const { result } = renderHook(() =>
        useTeamImportAutoResolve({ isEmpty: true, hasChanges: true })
      );

      // In reality, the useEffect will trigger and eventually clear pendingImport,
      // but synchronously it computes false.
      expect(result.current.showConflictModal).toBeFalsy();
    });

    it("should return false if no changes", () => {
      useDeckStore.setState({ pendingImport: {} as any });

      const { result } = renderHook(() =>
        useTeamImportAutoResolve({ isEmpty: false, hasChanges: false })
      );

      expect(result.current.showConflictModal).toBeFalsy();
    });
  });
});
