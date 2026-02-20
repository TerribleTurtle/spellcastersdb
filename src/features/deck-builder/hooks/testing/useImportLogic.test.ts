/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeckStore } from "@/store/index";

import { useImportLogic } from "../domain/useImportLogic";

describe("useImportLogic", () => {
  beforeEach(() => {
    useDeckStore.setState({
      pendingImport: null,
      // Mock resolvePendingImport (it's an action, but we can't easily spy on the store action implementation directly without more work,
      // so we'll inspect the state if it updates, or spy on the store if possible.
      // Actually, verify side effects via the store state or mocks if we injected them.
      // The hook uses `useDeckStore()`. We can spy on the hook if we mock the module,
      // but standard zustand testing relies on state changes.
    });

    // Mock the resolve action in the store to track calls
    useDeckStore.setState({
      resolvePendingImport: vi.fn(),
    });
  });

  it("should auto-resolve import if deck is empty", () => {
    useDeckStore.setState({ pendingImport: { id: "new" } as any });

    renderHook(() => useImportLogic({ isEmpty: true, hasChanges: false }));

    const resolveSpy = useDeckStore.getState().resolvePendingImport;
    expect(resolveSpy).toHaveBeenCalledWith("OVERWRITE");
  });

  it("should auto-resolve import if deck is clean (no changes)", () => {
    useDeckStore.setState({ pendingImport: { id: "new" } as any });

    renderHook(() => useImportLogic({ isEmpty: false, hasChanges: false }));

    const resolveSpy = useDeckStore.getState().resolvePendingImport;
    expect(resolveSpy).toHaveBeenCalledWith("OVERWRITE");
  });

  it("should NOT auto-resolve if deck has changes", () => {
    useDeckStore.setState({ pendingImport: { id: "new" } as any });

    const { result } = renderHook(() =>
      useImportLogic({ isEmpty: false, hasChanges: true })
    );

    const resolveSpy = useDeckStore.getState().resolvePendingImport;
    expect(resolveSpy).not.toHaveBeenCalled();
    expect(result.current.showConflictModal).toBe(true);
  });

  it("should show conflict modal pending import exists and unsafe to overwrite", () => {
    useDeckStore.setState({ pendingImport: { id: "new" } as any });
    const { result } = renderHook(() =>
      useImportLogic({ isEmpty: false, hasChanges: true })
    );
    expect(result.current.showConflictModal).toBe(true);
  });

  it("should not show conflict modal if no pending import", () => {
    useDeckStore.setState({ pendingImport: null });
    const { result } = renderHook(() =>
      useImportLogic({ isEmpty: false, hasChanges: true })
    );
    expect(result.current.showConflictModal).toBe(false);
  });
});
