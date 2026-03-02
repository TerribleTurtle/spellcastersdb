import "server-only";

import { MapChestsResponse } from "@/types/map-chests";

import { fetchChunk } from "./api-client";

const MAP_ID_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;

/**
 * Fetches all map chest entries from the aggregated `map_chests.json` endpoint,
 * then returns the single entry matching the given `mapId`.
 *
 * The community API publishes map chests as a single array, not per-map chunk
 * files, so we fetch the full list and filter client-side.
 */
export async function getMapChests(mapId: string): Promise<MapChestsResponse> {
  if (!MAP_ID_PATTERN.test(mapId)) {
    throw new Error(`Invalid map ID: ${mapId}`);
  }

  const allMaps =
    await fetchChunk<readonly MapChestsResponse[]>("map_chests.json");

  const match = allMaps.find((entry) => entry.entity_id === mapId);
  if (!match) {
    throw new Error(`Map not found: ${mapId}`);
  }

  return match;
}
