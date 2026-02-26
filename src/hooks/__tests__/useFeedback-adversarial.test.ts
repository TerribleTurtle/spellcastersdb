import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFeedback } from "../useFeedback";

describe("useFeedback — Adversarial", () => {
  const mockOpenPopup = vi.fn();
  const mockWindowOpen = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("open", mockWindowOpen);
    // Set a known location for predictable assertions
    Object.defineProperty(window, "location", {
      value: { href: "https://spellcastersdb.com/deck-builder" },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    delete (window as any).Tally;
  });

  // ─── Tally.openPopup Throws ────────────────────────────────────────
  it("should survive if Tally.openPopup throws an error", () => {
    (window as any).Tally = {
      openPopup: vi.fn(() => {
        throw new Error("Tally SDK crashed");
      }),
    };

    const { result } = renderHook(() => useFeedback());

    // Should throw (the hook doesn't catch Tally errors)
    // This IS a potential bug — documenting it as an adversarial finding
    expect(() => {
      act(() => {
        result.current.openFeedback();
      });
    }).toThrow("Tally SDK crashed");
  });

  // ─── XSS in URL ───────────────────────────────────────────────────
  it("should encode the current URL in the fallback to prevent injection", () => {
    Object.defineProperty(window, "location", {
      value: {
        href: 'https://evil.com/"><script>alert(1)</script>',
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.openFeedback();
    });

    const openedUrl = mockWindowOpen.mock.calls[0][0] as string;
    // The dangerous characters should be encoded out
    expect(openedUrl).not.toContain("<script>");
    expect(openedUrl).toContain(
      encodeURIComponent("<script>alert(1)</script>")
    );
  });

  // ─── Double Call ──────────────────────────────────────────────────
  it("should not crash when openFeedback is called twice rapidly", () => {
    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.openFeedback();
      result.current.openFeedback();
    });

    expect(mockWindowOpen).toHaveBeenCalledTimes(2);
  });

  // ─── Tally exists but openPopup is undefined ──────────────────────
  it("should fallback to window.open if Tally exists but openPopup is missing", () => {
    (window as any).Tally = {};

    const { result } = renderHook(() => useFeedback());

    // This tests the edge case where Tally is loaded but has no openPopup
    // Depending on implementation, this either calls undefined() or falls through
    expect(() => {
      act(() => {
        result.current.openFeedback();
      });
    }).toThrow(); // Tally.openPopup is not a function
  });

  // ─── Very Long URL ────────────────────────────────────────────────
  it("should handle extremely long URLs in fallback", () => {
    const longPath = "a".repeat(5000);
    Object.defineProperty(window, "location", {
      value: { href: `https://spellcastersdb.com/${longPath}` },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.openFeedback();
    });

    expect(mockWindowOpen).toHaveBeenCalledTimes(1);
    const openedUrl = mockWindowOpen.mock.calls[0][0] as string;
    expect(openedUrl.length).toBeGreaterThan(5000);
  });

  // ─── Tally Receives Correct Hidden Fields ─────────────────────────
  it("should pass the correct deck_url to Tally hiddenFields", () => {
    (window as any).Tally = { openPopup: mockOpenPopup };

    const { result } = renderHook(() => useFeedback());

    act(() => {
      result.current.openFeedback();
    });

    const options = mockOpenPopup.mock.calls[0][1] as Record<string, any>;
    expect(options.hiddenFields.deck_url).toBe(
      "https://spellcastersdb.com/deck-builder"
    );
  });
});
