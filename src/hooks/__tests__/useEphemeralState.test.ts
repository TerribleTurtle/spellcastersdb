import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useEphemeralState } from "../useEphemeralState";

describe("useEphemeralState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("should start inactive", () => {
    const { result } = renderHook(() => useEphemeralState(2000));
    expect(result.current.isActive).toBe(false);
  });

  it("should become active on trigger", () => {
    const { result } = renderHook(() => useEphemeralState(2000));

    act(() => {
      result.current.trigger();
    });

    expect(result.current.isActive).toBe(true);
  });

  it("should auto-reset after the specified duration", () => {
    const { result } = renderHook(() => useEphemeralState(1000));

    act(() => {
      result.current.trigger();
    });
    expect(result.current.isActive).toBe(true);

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current.isActive).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isActive).toBe(false);
  });

  it("should reset the timer when triggered again while active", () => {
    const { result } = renderHook(() => useEphemeralState(1000));

    act(() => {
      result.current.trigger();
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(result.current.isActive).toBe(true);

    // Re-trigger resets the timer
    act(() => {
      result.current.trigger();
    });

    act(() => {
      vi.advanceTimersByTime(800);
    });
    // Would have expired at 1000ms from first trigger, but re-trigger reset it
    expect(result.current.isActive).toBe(true);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.isActive).toBe(false);
  });

  it("should immediately deactivate on manual reset", () => {
    const { result } = renderHook(() => useEphemeralState(5000));

    act(() => {
      result.current.trigger();
    });
    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.isActive).toBe(false);

    // The timeout should also be cleared — advancing time should not flip it
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(result.current.isActive).toBe(false);
  });

  it("should use default duration of 2000ms", () => {
    const { result } = renderHook(() => useEphemeralState());

    act(() => {
      result.current.trigger();
    });

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(result.current.isActive).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isActive).toBe(false);
  });
});
