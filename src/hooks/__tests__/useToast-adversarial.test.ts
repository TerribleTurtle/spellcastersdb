import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useToast, useToastStore } from "../useToast";

describe("useToast — Adversarial", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  // ─── Flood Attack ──────────────────────────────────────────────────
  it("should survive 100 toasts fired synchronously without crashing", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.showToast(`Flood ${i}`);
      }
    });

    expect(result.current.toasts).toHaveLength(100);
    // All unique IDs
    const ids = new Set(result.current.toasts.map((t) => t.id));
    expect(ids.size).toBe(100);
  });

  it("should auto-dismiss ALL 100 flooded toasts after 3000ms", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.showToast(`Flood ${i}`);
      }
    });

    expect(result.current.toasts).toHaveLength(100);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  // ─── Double Dismiss ────────────────────────────────────────────────
  it("should not crash when dismissing an already-dismissed toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Ephemeral");
    });

    const id = result.current.toasts[0].id;

    act(() => {
      result.current.dismissToast(id);
    });
    expect(result.current.toasts).toHaveLength(0);

    // Dismiss again — should be a no-op, no crash
    act(() => {
      result.current.dismissToast(id);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("should not crash when dismissing a non-existent toast ID", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Real");
    });

    // Dismiss a completely fabricated ID
    act(() => {
      result.current.dismissToast("does-not-exist-at-all");
    });

    // The real toast should still be there
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Real");
  });

  // ─── Race: dismiss before auto-dismiss timer fires ─────────────────
  it("should handle manual dismiss before auto-dismiss fires without duplication", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Racing");
    });

    const id = result.current.toasts[0].id;

    // Manually dismiss at 1s
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.dismissToast(id);
    });

    expect(result.current.toasts).toHaveLength(0);

    // Now let the original 3s timer fire — should NOT crash or re-add
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  // ─── Empty / Whitespace Messages ───────────────────────────────────
  it("should accept an empty string message", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("");
  });

  it("should accept a message with only whitespace", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("   \n\t  ");
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  // ─── XSS Payload ──────────────────────────────────────────────────
  it("should store XSS payloads verbatim without executing", () => {
    const { result } = renderHook(() => useToast());
    const xss = '<script>alert("pwned")</script>';

    act(() => {
      result.current.showToast(xss);
    });

    expect(result.current.toasts[0].message).toBe(xss);
  });

  // ─── Extremely Long Message ────────────────────────────────────────
  it("should handle a 10KB message without crashing", () => {
    const { result } = renderHook(() => useToast());
    const longMsg = "A".repeat(10_000);

    act(() => {
      result.current.showToast(longMsg);
    });

    expect(result.current.toasts[0].message).toHaveLength(10_000);
  });

  // ─── Interleaved Add/Dismiss ───────────────────────────────────────
  it("should handle interleaved add and dismiss operations", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("A");
      result.current.showToast("B");
    });

    const idA = result.current.toasts[0].id;

    act(() => {
      result.current.dismissToast(idA);
      result.current.showToast("C");
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts.map((t) => t.message)).toEqual(["B", "C"]);
  });

  // ─── All Toast Types ──────────────────────────────────────────────
  it("should accept all valid toast types", () => {
    const { result } = renderHook(() => useToast());
    const types = [
      "success",
      "error",
      "info",
      "destructive",
      "warning",
      "default",
    ] as const;

    act(() => {
      types.forEach((t) => result.current.showToast(`Msg ${t}`, t));
    });

    expect(result.current.toasts).toHaveLength(types.length);
    types.forEach((t, i) => {
      expect(result.current.toasts[i].type).toBe(t);
    });
  });
});
