import { beforeEach, describe, expect, it, vi } from "vitest";

import { DataFetchError, fetchJson } from "@/services/api/api-client";
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

  // ─── Edge Cases ───────────────────────────────────────────────────

  describe("Edge Cases", () => {
    it("returns current URL when no deck or team inputs provided", async () => {
      const result = await createShortLink({});

      expect(result).toEqual({
        url: `${MOCK_ORIGIN}/deck-builder`,
        isShortLink: false,
        rateLimited: false,
      });
    });
  });
});
