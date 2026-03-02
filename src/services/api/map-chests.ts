import "server-only";

import { MapChestsResponse } from "@/types/map-chests";

import { fetchChunk } from "./api-client";

const MAP_ID_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;

export async function getMapChests(mapId: string): Promise<MapChestsResponse> {
  if (!MAP_ID_PATTERN.test(mapId)) {
    throw new Error(`Invalid map ID: ${mapId}`);
  }
  return fetchChunk<MapChestsResponse>(`map_chests/${mapId}.json`);
}
