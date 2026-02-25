import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useResponsiveGrid } from "../useResponsiveGrid";

// ── ResizeObserver mock ──────────────────────────────────────────────
let observerCallback: ResizeObserverCallback;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

class MockResizeObserver {
  constructor(cb: ResizeObserverCallback) {
    observerCallback = cb;
  }
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = vi.fn();
}

vi.stubGlobal("ResizeObserver", MockResizeObserver);

/** Helper: simulate a container resize to the given width */
function simulateWidth(width: number) {
  act(() => {
    observerCallback(
      [{ contentRect: { width } } as ResizeObserverEntry],
      {} as ResizeObserver
    );
  });
}

// ── Tests ────────────────────────────────────────────────────────────

describe("useResponsiveGrid", () => {
  it("returns default columns and isReady=false before ref callback", () => {
    const { result } = renderHook(() => useResponsiveGrid(4));
    expect(result.current.columns).toBe(4);
    expect(result.current.isReady).toBe(false);
  });

  // Current constants: MIN_CARD_WIDTH=120, MIN_COLUMNS=4, MAX_COLUMNS=10, padding=16
  // formula: clamp(4, floor((width - 16) / 120), 10)
  it.each([
    // [containerWidth, expectedCols]
    [320, 4], // (320-16)/120 = 2.5 → clamped to MIN=4
    [650, 5], // (650-16)/120 = 5.28 → 5
    [800, 6], // (800-16)/120 = 6.53 → 6
    [1000, 8], // (1000-16)/120 = 8.2 → 8
    [1216, 10], // (1216-16)/120 = 10 → 10
    [2000, 10], // (2000-16)/120 = 16.5 → clamped to MAX=10
  ])("width %ipx → %i columns", (width, expected) => {
    const { result } = renderHook(() => useResponsiveGrid());

    // Attach to a fake node
    const fakeNode = {
      getBoundingClientRect: () => ({ width }) as DOMRect,
    } as HTMLElement;

    act(() => {
      result.current.containerRef(fakeNode);
    });

    expect(result.current.columns).toBe(expected);
    expect(result.current.isReady).toBe(true);
  });

  it("updates columns when ResizeObserver fires", () => {
    const { result } = renderHook(() => useResponsiveGrid());

    const fakeNode = {
      getBoundingClientRect: () => ({ width: 400 }) as DOMRect,
    } as HTMLElement;

    act(() => {
      result.current.containerRef(fakeNode);
    });
    expect(result.current.columns).toBe(4);

    // Simulate resize to wider
    simulateWidth(700);
    // (700-16)/120 = 5.7 -> 5
    expect(result.current.columns).toBe(5);
  });

  it("disconnects old observer when ref switches nodes", () => {
    const { result } = renderHook(() => useResponsiveGrid());

    const node1 = {
      getBoundingClientRect: () => ({ width: 400 }) as DOMRect,
    } as HTMLElement;
    const node2 = {
      getBoundingClientRect: () => ({ width: 600 }) as DOMRect,
    } as HTMLElement;

    act(() => result.current.containerRef(node1));
    act(() => result.current.containerRef(node2));

    expect(mockDisconnect).toHaveBeenCalled();
  });
});
