import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeckStore } from "@/store/index";
import { UnifiedEntity } from "@/types/api";
import { EntityCategory } from "@/types/enums";

import { useDeckSelection } from "../useDeckSelection";

// Mock dependencies
const mockSetMobileTab = vi.fn();

// Mock Data
const mockItem: UnifiedEntity = {
  entity_id: "unit-123",
  name: "Test Unit",
  category: EntityCategory.Creature,
  tags: [],
  description: "Test Desc",
  magic_school: "Wild",
  health: 100,
} as UnifiedEntity;

describe("useDeckSelection", () => {
  beforeEach(() => {
    // Reset store state
    useDeckStore.setState({
      inspectedCard: null,
      inspectorOpen: false,
    });
    vi.clearAllMocks();
  });

  it("should update global store when handleSelectItem is called", () => {
    // 1. Arrange
    const { result } = renderHook(() => useDeckSelection(mockSetMobileTab));

    // 2. Act
    act(() => {
      result.current.handleSelectItem(mockItem);
    });

    // 3. Assert
    // Current behavior (Bug): Updates local state, not global store
    // Desired behavior (Fix): Updates global store

    // We expect this to FAIL initially until we fix the implementation
    const globalState = useDeckStore.getState();
    expect(globalState.inspectedCard).toEqual(mockItem);
    expect(globalState.inspectorOpen).toBe(true);
  });

  it("should clear global store when closeInspector is called", () => {
    // 1. Arrange
    useDeckStore.setState({
      inspectedCard: mockItem,
      inspectorOpen: true,
    });
    const { result } = renderHook(() => useDeckSelection(mockSetMobileTab));

    // 2. Act
    act(() => {
      result.current.closeInspector();
    });

    // 3. Assert
    const globalState = useDeckStore.getState();
    expect(globalState.inspectedCard).toBeNull();
    expect(globalState.inspectorOpen).toBe(false);
  });
});
