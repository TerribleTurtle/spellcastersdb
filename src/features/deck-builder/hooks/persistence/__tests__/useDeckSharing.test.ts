import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useEphemeralState } from "@/hooks/useEphemeralState";
import { copyToClipboard } from "@/lib/clipboard";
import { createShortLink } from "@/services/sharing/create-short-link";
import { Deck } from "@/types/deck";

import { useDeckSharing } from "../useDeckSharing";

// --- Mocks ---

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

describe("useDeckSharing", () => {
  const mockTrigger = vi.fn();
  const mockDeck = {
    id: "d1",
    name: "Test Deck",
    slots: [],
  } as unknown as Deck;

  const defaultProps = {
    deck: mockDeck,
    isTeamMode: false,
    teamDecks: undefined,
    teamName: undefined,
    activeSlot: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", vi.fn());

    (useEphemeralState as ReturnType<typeof vi.fn>).mockReturnValue({
      isActive: false,
      trigger: mockTrigger,
    });

    (createShortLink as ReturnType<typeof vi.fn>).mockResolvedValue({
      url: "https://www.spellcastersdb.com/s/abc",
      isShortLink: true,
      rateLimited: false,
    });

    (copyToClipboard as ReturnType<typeof vi.fn>).mockResolvedValue(true);
  });

  it("should return the correct shape", () => {
    const { result } = renderHook(() => useDeckSharing(defaultProps));

    expect(result.current).toHaveProperty("handleShare");
    expect(result.current).toHaveProperty("copied");
    expect(result.current).toHaveProperty("isLoading");
    expect(typeof result.current.handleShare).toBe("function");
    expect(typeof result.current.copied).toBe("boolean");
    expect(typeof result.current.isLoading).toBe("boolean");
  });

  it("should call createShortLink with correct args and copy result on success", async () => {
    const { result } = renderHook(() => useDeckSharing(defaultProps));

    await act(async () => {
      await result.current.handleShare();
    });

    expect(createShortLink).toHaveBeenCalledWith({
      deck: mockDeck,
      isTeamMode: false,
      teamDecks: undefined,
      teamName: undefined,
      activeSlot: undefined,
    });
    expect(copyToClipboard).toHaveBeenCalledWith(
      "https://www.spellcastersdb.com/s/abc"
    );
    expect(mockTrigger).toHaveBeenCalled();
  });

  it("should set isLoading true during async work and false after", async () => {
    // Make the shortlink take a moment
    let resolveShortLink!: (value: any) => void;
    (createShortLink as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveShortLink = resolve;
        })
    );

    const { result } = renderHook(() => useDeckSharing(defaultProps));
    expect(result.current.isLoading).toBe(false);

    let sharePromise: Promise<void>;
    act(() => {
      sharePromise = result.current.handleShare();
    });

    // isLoading should be true while waiting
    expect(result.current.isLoading).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolveShortLink({
        url: "https://www.spellcastersdb.com/s/abc",
        isShortLink: true,
        rateLimited: false,
      });
      await sharePromise!;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("should show alert fallback when copyToClipboard fails", async () => {
    (copyToClipboard as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const { result } = renderHook(() => useDeckSharing(defaultProps));

    await act(async () => {
      await result.current.handleShare();
    });

    expect(mockTrigger).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("Failed to copy URL")
    );
  });

  it("should pass through team mode args correctly", async () => {
    const teamDecks = [mockDeck, mockDeck, mockDeck] as Deck[];
    const teamProps = {
      deck: mockDeck,
      isTeamMode: true,
      teamDecks,
      teamName: "Best Team",
      activeSlot: 1,
    };

    const { result } = renderHook(() => useDeckSharing(teamProps));

    await act(async () => {
      await result.current.handleShare();
    });

    expect(createShortLink).toHaveBeenCalledWith({
      deck: mockDeck,
      isTeamMode: true,
      teamDecks,
      teamName: "Best Team",
      activeSlot: 1,
    });
  });
});
