import { Metadata } from "next";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchGameData } from "@/services/api/api";
import { monitoring } from "@/services/monitoring";
import { decodeDeck, decodeTeam } from "@/services/utils/encoding";
import { AllDataResponse, Spellcaster } from "@/types/api";

import { generateDeckMetadata } from "../metadata-service";

// --- Mocks ---
vi.mock("@/services/api/api", () => ({
  fetchGameData: vi.fn(),
}));

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureException: vi.fn(),
  },
}));

vi.mock("@/services/utils/encoding", () => ({
  decodeDeck: vi.fn(),
  decodeTeam: vi.fn(),
}));

describe("generateDeckMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultMetadata: Metadata = {
    title: "Deck Builder & Loadout Editor - SpellcastersDB",
    description: "Build and share your Spellcasters Chronicles decks.",
    keywords: expect.any(Array),
    openGraph: expect.any(Object),
    twitter: expect.any(Object),
  };

  it("returns default metadata when no hash provided", async () => {
    const params = Promise.resolve({});
    const result = await generateDeckMetadata(params);
    expect(result).toEqual(
      expect.objectContaining({
        title: defaultMetadata.title,
      })
    );
  });

  it("returns default metadata with invalid param types", async () => {
    const params = Promise.resolve({ d: ["array", "hash"] });
    const result = await generateDeckMetadata(params);
    expect(result).toEqual(
      expect.objectContaining({
        title: defaultMetadata.title,
      })
    );
  });

  it("prioritizes 'd' (deck) parameter over 'team' parameter when both are present", async () => {
    vi.mocked(decodeDeck).mockReturnValue({
      name: "Deck Wins",
      spellcasterId: "sc1",
      slotIds: [],
    });

    const params = Promise.resolve({
      d: "valid_deck_hash",
      team: "valid_team_hash",
    });
    const result = await generateDeckMetadata(params);

    expect(result.title).toBe("Deck Wins - SpellcastersDB");
    expect(decodeDeck).toHaveBeenCalledWith("valid_deck_hash");
    expect(decodeTeam).not.toHaveBeenCalled();
  });

  describe("Single Deck Metadata", () => {
    it("generates metadata for a named deck", async () => {
      vi.mocked(decodeDeck).mockReturnValue({
        name: "My Awesome Deck",
        spellcasterId: "sc1",
        slotIds: [],
      });

      const params = Promise.resolve({ d: "valid_hash" });
      const result = await generateDeckMetadata(params);

      expect(result.title).toBe("My Awesome Deck - SpellcastersDB");
      expect(result.description).toContain(
        "Check out this My Awesome Deck build"
      );
    });

    it("generates metadata falling back to spellcaster name", async () => {
      vi.mocked(decodeDeck).mockReturnValue({
        name: "",
        spellcasterId: "sc1",
        slotIds: [],
      });

      vi.mocked(fetchGameData).mockResolvedValue({
        spellcasters: [
          {
            spellcaster_id: "sc1",
            name: "Pyromancer",
          } as unknown as Spellcaster,
        ],
        units: [],
        spells: [],
        titans: [],
      } as unknown as AllDataResponse);

      const params = Promise.resolve({ d: "hash_no_name" });
      const result = await generateDeckMetadata(params);

      expect(result.title).toBe("Pyromancer Deck - SpellcastersDB");
      expect(result.description).toContain("Check out this Pyromancer build");
      expect(fetchGameData).toHaveBeenCalled();
    });

    it("generates fallback Custom Deck title when api fails", async () => {
      vi.mocked(decodeDeck).mockReturnValue({
        name: "",
        spellcasterId: "sc1",
        slotIds: [],
      });

      const testError = new Error("API Error");
      vi.mocked(fetchGameData).mockRejectedValue(testError);

      const params = Promise.resolve({ d: "hash_error" });
      const result = await generateDeckMetadata(params);

      expect(result.title).toBe("Custom Deck - SpellcastersDB");
      expect(result.description).toContain("Check out this Custom Deck build");
      expect(monitoring.captureException).toHaveBeenCalledWith(testError, {
        operation: "fetchMetadata",
      });
    });

    it("generates fallback Custom Deck title with no name or spellcaster", async () => {
      vi.mocked(decodeDeck).mockReturnValue({
        name: "",
        spellcasterId: "",
        slotIds: [],
      });

      const params = Promise.resolve({ d: "hash_empty" });
      const result = await generateDeckMetadata(params);

      expect(result.title).toBe("Custom Deck - SpellcastersDB");
    });

    it("generates correct OG image URL and Twitter card type for decks", async () => {
      vi.mocked(decodeDeck).mockReturnValue({
        name: "OG Deck",
        spellcasterId: "sc1",
        slotIds: [],
      });

      const rawHash = "test_raw_hash_123";
      const params = Promise.resolve({ d: rawHash });
      const result = await generateDeckMetadata(params);

      // 1. OG Image URL format
      expect(result.openGraph?.images).toEqual([`/api/og?d=${rawHash}`]);
      expect(result.twitter?.images).toEqual([`/api/og?d=${rawHash}`]);

      // 2. Twitter card is always summary_large_image
      expect((result.twitter as any)?.card).toBe("summary_large_image");
    });

    it("falls back to Custom Deck if decodeDeck returns null (corrupted hash)", async () => {
      vi.mocked(decodeDeck).mockReturnValue(null);

      const params = Promise.resolve({ d: "corrupted_hash" });
      const result = await generateDeckMetadata(params);

      expect(result.title).toBe("Custom Deck - SpellcastersDB");
      expect(result.openGraph?.images).toEqual([`/api/og?d=corrupted_hash`]);
    });
  });

  describe("Team Metadata", () => {
    it("generates metadata for a named team", async () => {
      vi.mocked(decodeTeam).mockReturnValue({
        name: "The Avengers",
        decks: [],
      });

      const params = Promise.resolve({ team: "team_hash_name" });
      const result = await generateDeckMetadata(params);

      expect(result.title).toBe("The Avengers - SpellcastersDB");
      expect(result.description).toContain("team build");
    });

    it("generates fallback Team Trinity when unnamed", async () => {
      vi.mocked(decodeTeam).mockReturnValue({
        name: "",
        decks: [],
      });

      const params = Promise.resolve({ team: "team_hash_empty" });
      const result = await generateDeckMetadata(params);

      expect(result.title).toBe("Team Trinity - SpellcastersDB");
    });

    it("generates correct OG image URL and Twitter card type for teams", async () => {
      vi.mocked(decodeTeam).mockReturnValue({
        name: "OG Team",
        decks: [],
      });

      const rawHash = "v2~team_hash_123";
      const params = Promise.resolve({ team: rawHash });
      const result = await generateDeckMetadata(params);

      // OG Image URL format for teams
      expect(result.openGraph?.images).toEqual([`/api/og?team=${rawHash}`]);
      expect(result.twitter?.images).toEqual([`/api/og?team=${rawHash}`]);

      // Twitter card is always summary_large_image
      expect((result.twitter as any)?.card).toBe("summary_large_image");
    });
  });
});
