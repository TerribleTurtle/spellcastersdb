import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useEphemeralState } from "@/hooks/useEphemeralState";
import { copyToClipboard } from "@/lib/clipboard";
import { createShortLink } from "@/services/sharing/create-short-link";
import { Deck } from "@/types/deck";

import { useDeckSharing } from "../useDeckSharing";

vi.mock("@/services/sharing/create-short-link", () => ({
  createShortLink: vi.fn(),
}));

vi.mock("@/lib/clipboard", () => ({
  copyToClipboard: vi.fn(),
}));

vi.mock("@/hooks/useEphemeralState", () => ({
  useEphemeralState: vi.fn(),
}));

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
  },
}));

describe("useDeckSharing — Adversarial", () => {
  const mockTrigger = vi.fn();
  const emptyDeck = {
    id: undefined,
    name: "",
    slots: [],
    spellcaster: null,
  } as unknown as Deck;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", vi.fn());

    (useEphemeralState as ReturnType<typeof vi.fn>).mockReturnValue({
      isActive: false,
      trigger: mockTrigger,
    });

    (createShortLink as ReturnType<typeof vi.fn>).mockResolvedValue({
      url: "https://spellcastersdb.com/s/abc",
      isShortLink: true,
      rateLimited: false,
    });

    (copyToClipboard as ReturnType<typeof vi.fn>).mockResolvedValue(true);
  });

  it("ADV-SHARE-1: createShortLink throws → should not crash, isLoading returns to false", async () => {
    (createShortLink as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network exploded")
    );

    const { result } = renderHook(() =>
      useDeckSharing({ deck: emptyDeck, isTeamMode: false })
    );

    // The hook has a try/finally but no catch — the error WILL propagate.
    // This tests whether the component would crash.
    // Actually: it HAS a finally{} which sets isLoading = false.
    // But without a catch, the promise rejects. Let's see:
    await act(async () => {
      try {
        await result.current.handleShare();
      } catch {
        // Expected: unhandled rejection from the hook
      }
    });

    // isLoading should still be reset by the finally block
    expect(result.current.isLoading).toBe(false);
    expect(mockTrigger).not.toHaveBeenCalled();
  });

  it("ADV-SHARE-2: createShortLink returns XSS URL → should pass it literally to clipboard", async () => {
    const xssUrl = 'javascript:alert("pwned")';
    (createShortLink as ReturnType<typeof vi.fn>).mockResolvedValue({
      url: xssUrl,
      isShortLink: false,
      rateLimited: false,
    });

    const { result } = renderHook(() =>
      useDeckSharing({ deck: emptyDeck, isTeamMode: false })
    );

    await act(async () => {
      await result.current.handleShare();
    });

    // The URL should be copied literally, not sanitized (clipboard just stores text)
    expect(copyToClipboard).toHaveBeenCalledWith(xssUrl);
  });

  it("ADV-SHARE-3: copyToClipboard throws (not just returns false) → should still set isLoading = false", async () => {
    (copyToClipboard as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Clipboard API crashed")
    );

    const { result } = renderHook(() =>
      useDeckSharing({ deck: emptyDeck, isTeamMode: false })
    );

    await act(async () => {
      try {
        await result.current.handleShare();
      } catch {
        // Expected
      }
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("ADV-SHARE-4: calling handleShare concurrently (race condition) should not corrupt state", async () => {
    let callCount = 0;
    (createShortLink as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise((resolve) => {
          callCount++;
          setTimeout(
            () =>
              resolve({
                url: `https://spellcastersdb.com/s/${callCount}`,
                isShortLink: true,
                rateLimited: false,
              }),
            10
          );
        })
    );

    const { result } = renderHook(() =>
      useDeckSharing({ deck: emptyDeck, isTeamMode: false })
    );

    // Fire two shares concurrently
    await act(async () => {
      await Promise.all([
        result.current.handleShare(),
        result.current.handleShare(),
      ]);
    });

    // Should not crash, isLoading should be false at the end
    expect(result.current.isLoading).toBe(false);
    expect(copyToClipboard).toHaveBeenCalledTimes(2);
  });

  it("ADV-SHARE-5: sharing with deck that has undefined name/id should not crash", async () => {
    const cursedDeck = {
      id: undefined,
      name: undefined,
      slots: undefined,
      spellcaster: undefined,
    } as unknown as Deck;

    const { result } = renderHook(() =>
      useDeckSharing({ deck: cursedDeck, isTeamMode: false })
    );

    await act(async () => {
      await result.current.handleShare();
    });

    expect(createShortLink).toHaveBeenCalledWith(
      expect.objectContaining({ deck: cursedDeck })
    );
  });

  it("ADV-SHARE-6: sharing with absurdly long team name should pass through", async () => {
    const longName = "A".repeat(100000);

    const { result } = renderHook(() =>
      useDeckSharing({
        deck: emptyDeck,
        isTeamMode: true,
        teamDecks: [emptyDeck, emptyDeck, emptyDeck],
        teamName: longName,
        activeSlot: 0,
      })
    );

    await act(async () => {
      await result.current.handleShare();
    });

    expect(createShortLink).toHaveBeenCalledWith(
      expect.objectContaining({ teamName: longName })
    );
  });
});
