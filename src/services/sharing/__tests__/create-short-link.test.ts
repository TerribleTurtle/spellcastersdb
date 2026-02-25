import { beforeEach, describe, expect, it, vi } from "vitest";

import { DataFetchError, fetchJson } from "@/services/api/api-client";
import { monitoring } from "@/services/monitoring";
import { createShortLink } from "@/services/sharing/create-short-link";
import { encodeDeck, encodeTeam } from "@/services/utils/encoding";
import { Deck } from "@/types/deck";

// Mock external dependencies
vi.mock("@/services/api/api-client", () => ({
  fetchJson: vi.fn(),
  DataFetchError: class DataFetchError extends Error {
    status?: number;
    cause?: unknown;
    constructor(message: string, status?: number, cause?: unknown) {
      super(message, { cause });
      this.name = "DataFetchError";
      this.status = status;
      this.cause = cause;
    }
  },
}));

vi.mock("@/services/utils/encoding", () => ({
  encodeDeck: vi.fn(),
  encodeTeam: vi.fn(),
}));

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureMessage: vi.fn(),
    captureException: vi.fn(),
  },
}));

describe("createShortLink", () => {
  const MOCK_ORIGIN = "http://localhost:3000";

  beforeEach(() => {
    vi.resetAllMocks();

    // Provide a consistent window context
    vi.stubGlobal("window", {
      location: {
        origin: MOCK_ORIGIN,
        pathname: "/deck-builder",
        href: `${MOCK_ORIGIN}/deck-builder`,
      },
    });

    // Default encoder return values
    vi.mocked(encodeDeck).mockReturnValue("encoded_solo_deck");
    vi.mocked(encodeTeam).mockReturnValue("encoded_team");
  });

  // ─── Solo Deck Sharing ────────────────────────────────────────────

  describe("Solo Deck Sharing", () => {
    const mockDeck = { id: "deck-1", name: "My Deck" } as Deck;

    it("returns a short link on successful API response", async () => {
      vi.mocked(fetchJson).mockResolvedValueOnce({ id: "abc1234" });

      const result = await createShortLink({ deck: mockDeck });

      expect(encodeDeck).toHaveBeenCalledWith(mockDeck);
      expect(fetchJson).toHaveBeenCalledWith(
        "/api/share",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            hash: "encoded_solo_deck",
            type: "deck",
            path: "/deck-builder",
          }),
        })
      );
      expect(result).toEqual({
        url: `${MOCK_ORIGIN}/s/abc1234`,
        isShortLink: true,
        rateLimited: false,
      });
    });

    it("falls back to long URL when API returns no id", async () => {
      vi.mocked(fetchJson).mockResolvedValueOnce({});

      const result = await createShortLink({ deck: mockDeck });

      expect(result).toEqual({
        url: `${MOCK_ORIGIN}/deck-builder?d=encoded_solo_deck`,
        isShortLink: false,
        rateLimited: false,
      });
    });

    it("falls back to long URL on generic network error", async () => {
      vi.mocked(fetchJson).mockRejectedValueOnce(new Error("Network Error"));

      const result = await createShortLink({ deck: mockDeck });

      expect(result).toEqual({
        url: `${MOCK_ORIGIN}/deck-builder?d=encoded_solo_deck`,
        isShortLink: false,
        rateLimited: false,
      });
    });

    it("sets rateLimited=true on 429 DataFetchError", async () => {
      vi.mocked(fetchJson).mockRejectedValueOnce(
        new DataFetchError("Too Many Requests", 429)
      );

      const result = await createShortLink({ deck: mockDeck });

      expect(result).toEqual({
        url: `${MOCK_ORIGIN}/deck-builder?d=encoded_solo_deck`,
        isShortLink: false,
        rateLimited: true,
      });
    });

    it("falls back gracefully on non-429 DataFetchError", async () => {
      vi.mocked(fetchJson).mockRejectedValueOnce(
        new DataFetchError("Internal Server Error", 500)
      );

      const result = await createShortLink({ deck: mockDeck });

      expect(result).toEqual({
        url: `${MOCK_ORIGIN}/deck-builder?d=encoded_solo_deck`,
        isShortLink: false,
        rateLimited: false,
      });
    });
  });

  // ─── Team Sharing ─────────────────────────────────────────────────

  describe("Team Sharing", () => {
    const mockDecks = [{}, {}, {}] as [Deck, Deck, Deck];
    const mockTeamName = "The Best Team";

    it("returns a short link on successful API response", async () => {
      vi.mocked(fetchJson).mockResolvedValueOnce({ id: "def5678" });

      const result = await createShortLink({
        teamDecks: mockDecks,
        teamName: mockTeamName,
        isTeamMode: true,
      });

      expect(encodeTeam).toHaveBeenCalledWith(mockDecks, mockTeamName);
      expect(fetchJson).toHaveBeenCalledWith(
        "/api/share",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            hash: "encoded_team",
            type: "team",
            path: "/deck-builder",
          }),
        })
      );
      expect(result).toEqual({
        url: `${MOCK_ORIGIN}/s/def5678`,
        isShortLink: true,
        rateLimited: false,
      });
    });

    it("uses 'Untitled Team' as default team name", async () => {
      vi.mocked(fetchJson).mockResolvedValueOnce({ id: "ghi9012" });

      await createShortLink({
        teamDecks: mockDecks,
        isTeamMode: true,
      });

      expect(encodeTeam).toHaveBeenCalledWith(mockDecks, "Untitled Team");
    });

    it("replaces the deck at activeSlot when provided", async () => {
      vi.mocked(fetchJson).mockResolvedValueOnce({ id: "slot123" });

      const newDeck = { id: "new-deck", name: "Replacement" } as Deck;
      await createShortLink({
        teamDecks: mockDecks,
        isTeamMode: true,
        deck: newDeck,
        activeSlot: 1, // Replace the middle deck
      });

      // It should create a new array with the new deck at index 1
      const expectedDecks = [mockDecks[0], newDeck, mockDecks[2]];
      expect(encodeTeam).toHaveBeenCalledWith(expectedDecks, "Untitled Team");
    });

    it("ignores activeSlot if it is out of bounds (too high)", async () => {
      vi.mocked(fetchJson).mockResolvedValueOnce({ id: "slot456" });

      const newDeck = { id: "new-deck", name: "Replacement" } as Deck;
      await createShortLink({
        teamDecks: mockDecks,
        isTeamMode: true,
        deck: newDeck,
        activeSlot: 5, // Out of bounds
      });

      // It should fall back to the original decks without modification
      expect(encodeTeam).toHaveBeenCalledWith(mockDecks, "Untitled Team");
    });

    it("ignores activeSlot if it is negative", async () => {
      vi.mocked(fetchJson).mockResolvedValueOnce({ id: "slot789" });

      const newDeck = { id: "new-deck", name: "Replacement" } as Deck;
      await createShortLink({
        teamDecks: mockDecks,
        isTeamMode: true,
        deck: newDeck,
        activeSlot: -1, // Negative index
      });

      expect(encodeTeam).toHaveBeenCalledWith(mockDecks, "Untitled Team");
    });

    it("rejects non-integer floats to prevent array corruption", async () => {
      vi.mocked(fetchJson).mockResolvedValueOnce({ id: "slot-float" });

      const newDeck = { id: "new-deck", name: "Replacement" } as Deck;
      await createShortLink({
        teamDecks: mockDecks,
        isTeamMode: true,
        deck: newDeck,
        activeSlot: 1.5, // Float index should be rejected by Number.isInteger
      });

      // It should fall back to the original decks without modification
      expect(encodeTeam).toHaveBeenCalledWith(mockDecks, "Untitled Team");
    });

    it("falls back to long URL on API failure", async () => {
      vi.mocked(fetchJson).mockRejectedValueOnce(new Error("Network Error"));

      const result = await createShortLink({
        teamDecks: mockDecks,
        isTeamMode: true,
      });

      expect(result).toEqual({
        url: `${MOCK_ORIGIN}/deck-builder?team=encoded_team`,
        isShortLink: false,
        rateLimited: false,
      });
    });
  });

  describe("Edge Cases", () => {
    it("returns current URL when no deck or team inputs provided", async () => {
      const result = await createShortLink({});

      expect(result).toEqual({
        url: `${MOCK_ORIGIN}/deck-builder`,
        isShortLink: false,
        rateLimited: false,
      });
    });

    it("returns current URL and warns when isTeamMode is true but teamDecks is undefined", async () => {
      const result = await createShortLink({ isTeamMode: true });

      // The catch-all `else` block should fire instead of crashing
      expect(monitoring.captureMessage).toHaveBeenCalledWith(
        "createShortLink: Invalid options provided, returning current URL",
        "warning"
      );

      expect(result).toEqual({
        url: `${MOCK_ORIGIN}/deck-builder`,
        isShortLink: false,
        rateLimited: false,
      });
    });
  });
});
