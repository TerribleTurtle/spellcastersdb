import { describe, expect, it, vi } from "vitest";

import { fetchChunk } from "../api-client";
import { getMapChests } from "../map-chests";

// Mock server-only (no-op in test environment)
vi.mock("server-only", () => ({}));

// Mock fetchChunk
vi.mock("../api-client", () => ({
  fetchChunk: vi.fn(),
}));

const MOCK_ENTRY = {
  entity_id: "mausoleum",
  name: "Mausoleum",
  description: "Chest spawn locations for the Mausoleum arena.",
  image_required: false,
  tags: [],
  last_modified: "2026-03-01T22:48:00Z",
  chests: [
    {
      location: "Inner Side",
      rarity: "Common",
      tier: "T1",
      reward_entity_id: "harpy",
      reward_type: "Unit",
    },
  ],
};

describe("getMapChests", () => {
  it("fetches aggregated map chest data and returns the matching entry", async () => {
    vi.mocked(fetchChunk).mockResolvedValue([MOCK_ENTRY]);
    const result = await getMapChests("mausoleum");
    expect(fetchChunk).toHaveBeenCalledWith("map_chests.json");
    expect(result.entity_id).toBe("mausoleum");
    expect(result.chests).toHaveLength(1);
  });

  it("throws when mapId is not found in the aggregated data", async () => {
    vi.mocked(fetchChunk).mockResolvedValue([MOCK_ENTRY]);
    await expect(getMapChests("nonexistent")).rejects.toThrow("Map not found");
  });

  it("rejects invalid mapId with path traversal", async () => {
    await expect(getMapChests("../etc/passwd")).rejects.toThrow(
      "Invalid map ID"
    );
  });

  it("rejects empty mapId", async () => {
    await expect(getMapChests("")).rejects.toThrow("Invalid map ID");
  });

  it("rejects mapId with uppercase", async () => {
    await expect(getMapChests("Mausoleum")).rejects.toThrow("Invalid map ID");
  });
});
