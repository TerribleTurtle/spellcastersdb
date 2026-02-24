import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAccordionState } from "../useAccordionState";

describe("useAccordionState", () => {
  it("should initialize with the first item open by default", () => {
    const { result } = renderHook(() => useAccordionState(3));
    expect(result.current.expandedState).toEqual([true, false, false]);
  });

  it("should initialize with a custom initialOpenIndex", () => {
    const { result } = renderHook(() => useAccordionState(3, 2));
    expect(result.current.expandedState).toEqual([false, false, true]);
  });

  it("should initialize all closed if initialOpenIndex is out of range", () => {
    const { result } = renderHook(() => useAccordionState(3, 10));
    expect(result.current.expandedState).toEqual([false, false, false]);
  });

  describe("single-select mode (allowMultiple=false)", () => {
    it("should close other items when opening one", () => {
      const { result } = renderHook(() => useAccordionState(3, 0, false));
      expect(result.current.expandedState).toEqual([true, false, false]);

      act(() => {
        result.current.toggle(2, true);
      });

      expect(result.current.expandedState).toEqual([false, false, true]);
    });

    it("should close an item when toggling it closed", () => {
      const { result } = renderHook(() => useAccordionState(3, 0, false));

      act(() => {
        result.current.toggle(0, false);
      });

      expect(result.current.expandedState).toEqual([false, false, false]);
    });
  });

  describe("multi-select mode (allowMultiple=true)", () => {
    it("should allow multiple items to be open simultaneously", () => {
      const { result } = renderHook(() => useAccordionState(3, 0, true));

      act(() => {
        result.current.toggle(1, true);
      });

      expect(result.current.expandedState).toEqual([true, true, false]);

      act(() => {
        result.current.toggle(2, true);
      });

      expect(result.current.expandedState).toEqual([true, true, true]);
    });
  });

  it("should collapse all items", () => {
    const { result } = renderHook(() => useAccordionState(3, 0, true));

    act(() => {
      result.current.toggle(1, true);
      result.current.toggle(2, true);
    });

    act(() => {
      result.current.collapseAll();
    });

    expect(result.current.expandedState).toEqual([false, false, false]);
  });

  it("should expand all items", () => {
    const { result } = renderHook(() => useAccordionState(3));

    act(() => {
      result.current.expandAll();
    });

    expect(result.current.expandedState).toEqual([true, true, true]);
  });

  it("should report areAllCollapsed correctly", () => {
    const { result } = renderHook(() => useAccordionState(3, 0));
    expect(result.current.areAllCollapsed).toBe(false);

    act(() => {
      result.current.collapseAll();
    });

    expect(result.current.areAllCollapsed).toBe(true);
  });
});
