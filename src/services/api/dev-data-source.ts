import { CONFIG } from "@/lib/config";
import { RawData, mapRawDataToAllData } from "./mappers";
import { AllDataResponse } from "@/types/api";

/**
 * Fetches game data from the local filesystem.
 *
 * STRATEGY:
 * 1. Check `CONFIG.DEV.LOCAL_DATA_PATH` (from env LOCAL_DATA_PATH).
 * 2. Fallback to looking for `spellcasters-community-api` as a sibling directory.
 *
 * This allows developers to work with the data repo checked out next to this repo
 * without complex configuration.
 */


export async function fetchLocalData(): Promise<AllDataResponse | undefined> {
  if (process.env.NODE_ENV !== "development") return undefined;

  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    // CRITICAL: Local Development Source of Truth
    // Prioritize explicit env, fallback to sibling directory
    const localPath =
      CONFIG.DEV.LOCAL_DATA_PATH ||
      path.resolve(process.cwd(), "..", "spellcasters-community-api", "api", "v2", "all_data.json");
    


    const fileContent = await fs.readFile(localPath, "utf-8");
    const rawData = JSON.parse(fileContent) as RawData;

    const data = mapRawDataToAllData(rawData);
    return { ...data, _source: "Local Filesystem" };

  } catch (e) {
    console.warn("⚠️ Could not load local data:", e);
    return undefined;
  }
}
