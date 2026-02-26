import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useToast, useToastStore } from "../useToast";

describe("useToast store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("should add a toast with default type", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Test message");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Test message");
    expect(result.current.toasts[0].type).toBe("default");
    expect(result.current.toasts[0].id).toBeDefined();
  });

  it("should add a toast with specific type", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Error message", "error");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("error");
  });

  it("should dismiss a specific toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Message 1");
      result.current.showToast("Message 2");
    });

    expect(result.current.toasts).toHaveLength(2);
    const idToRemove = result.current.toasts[0].id;

    act(() => {
      result.current.dismissToast(idToRemove);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Message 2");
  });

  it("should auto-dismiss toast after 3000ms", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Temp message");
    });

    expect(result.current.toasts).toHaveLength(1);

    // Fast-forward 2900ms - should still be there
    act(() => {
      vi.advanceTimersByTime(2900);
    });
    expect(result.current.toasts).toHaveLength(1);

    // Fast-forward another 100ms - should be removed
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.toasts).toHaveLength(0);
  });
});
