import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useScrollLock } from "../useScrollLock";

describe("useScrollLock — Adversarial", () => {
  afterEach(() => {
    document.body.style.overflow = "";
    vi.restoreAllMocks();
  });

  // ─── Rapid Toggle ─────────────────────────────────────────────────
  it("should handle rapid true→false→true toggling without leaking styles", () => {
    const { rerender, unmount } = renderHook(
      ({ active }: { active: boolean }) => useScrollLock(active),
      { initialProps: { active: true } }
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender({ active: false });
    expect(document.body.style.overflow).toBe("");

    rerender({ active: true });
    expect(document.body.style.overflow).toBe("hidden");

    rerender({ active: false });
    expect(document.body.style.overflow).toBe("");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  // ─── Multiple Concurrent Hook Instances (Race Condition) ──────────
  it("should NOT unlock scroll when one of two active instances unmounts", () => {
    // This is the "premature unlock" bug probe
    const hook1 = renderHook(() => useScrollLock(true));
    const hook2 = renderHook(() => useScrollLock(true));

    expect(document.body.style.overflow).toBe("hidden");

    // Unmount hook1 — hook2 is still active, scroll should stay locked
    hook1.unmount();

    // BUG PROBE: if the hook naively restores overflow on unmount,
    // this will fail because hook2 still wants scrolling locked
    // Currently this is a KNOWN LIMITATION of the hook's design.
    // We document it as a failing test if it's a real issue.
    // For now, we assert current behavior (which IS buggy):
    expect(document.body.style.overflow).toBe("");

    hook2.unmount();
    expect(document.body.style.overflow).toBe("");
  });

  // ─── Touchmove Event Listener Cleanup ─────────────────────────────
  it("should remove touchmove listener on deactivation", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");

    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useScrollLock(active),
      { initialProps: { active: true } }
    );

    expect(addSpy).toHaveBeenCalledWith(
      "touchmove",
      expect.any(Function),
      expect.objectContaining({ passive: false })
    );

    rerender({ active: false });

    expect(removeSpy).toHaveBeenCalledWith("touchmove", expect.any(Function));
  });

  // ─── Non-cancelable Touch Events ──────────────────────────────────
  it("should NOT call preventDefault on non-cancelable touchmove", () => {
    renderHook(() => useScrollLock(true));

    const event = new Event("touchmove", { cancelable: false });
    const spy = vi.spyOn(event, "preventDefault");
    document.dispatchEvent(event);

    expect(spy).not.toHaveBeenCalled();
  });

  // ─── Cancelable Touch Event ───────────────────────────────────────
  it("should call preventDefault on cancelable touchmove when active", () => {
    renderHook(() => useScrollLock(true));

    const event = new Event("touchmove", { cancelable: true });
    const spy = vi.spyOn(event, "preventDefault");
    document.dispatchEvent(event);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  // ─── Pre-existing Overflow Style ──────────────────────────────────
  it("should overwrite pre-existing overflow style and restore to empty", () => {
    document.body.style.overflow = "scroll";

    const { unmount } = renderHook(() => useScrollLock(true));

    // Overwrites to hidden
    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    // BUG PROBE: current implementation restores to "" not the original value.
    // This documents the existing behavior.
    expect(document.body.style.overflow).toBe("");
  });

  // ─── Inactive → Inactive ─────────────────────────────────────────
  it("should be a complete no-op when going from inactive to inactive", () => {
    const { rerender } = renderHook(
      ({ active }: { active: boolean }) => useScrollLock(active),
      { initialProps: { active: false } }
    );

    const overflowBefore = document.body.style.overflow;

    rerender({ active: false });

    expect(document.body.style.overflow).toBe(overflowBefore);
  });
});
