import { CONFIG } from "@/lib/config";
import { RawData, mapRawDataToAllData, DataValidationError } from "./mappers";
import { AllDataResponse } from "@/types/api";

export { DataValidationError };

export class DataFetchError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "DataFetchError";
  }
}


export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new DataFetchError(
          `Failed to fetch: ${response.status} ${response.statusText}`,
          response.status
        );
    }

    return (await response.json()) as T;
  } catch (error) {
     if (error instanceof DataFetchError) {
        throw error;
    }
    throw new DataFetchError(
        error instanceof Error ? error.message : "Unknown fetch error",
        500
    );
  }
}

export async function fetchChunk<T>(endpoint: string): Promise<T> {
  const url = `${CONFIG.API.BASE_URL}/${endpoint}`;
  return fetchJson<T>(url, {
    next: {
      revalidate: CONFIG.API.REVALIDATE_SECONDS,
      tags: ["game-data", endpoint],
    },
  });
}

export async function fetchChunkedData(): Promise<AllDataResponse> {
  const [
    units, 
    spells, 
    spellcasters, 
    titans, 
    consumables, 
    upgrades
  ] = await Promise.all([
    fetchChunk<any[]>("units.json"),
    fetchChunk<any[]>("spells.json"),
    fetchChunk<any[]>("heroes.json"),
    fetchChunk<any[]>("titans.json"),
    fetchChunk<any[]>("consumables.json"),
    fetchChunk<any[]>("upgrades.json").catch(err => {
        console.warn("Failed to fetch upgrades, defaulting to empty array:", err);
        return [];
    }),
  ]);

  const rawData: RawData = {
    build_info: {
        version: "v2-chunked",
        generated_at: new Date().toISOString(),
    },
    units,
    spells,
    spellcasters,
    titans,
    consumables,
    upgrades,
  };

  const data = mapRawDataToAllData(rawData);
  return { ...data, _source: `Remote API (Chunked)` };
}

export async function fetchRemoteData(): Promise<AllDataResponse> {
  try {
      return await fetchChunkedData();
  } catch (error) {
    if (error instanceof DataValidationError) {
        console.error("❌ Game Data Validation Failed:", error.message);
        throw error;
    }
    
    if (error instanceof DataFetchError) {
         console.error(`❌ Network Error (${error.status}):`, error.message);
         throw error;
    }

    console.error("❌ Unexpected Error fetching game data:", error);
    throw error;
  }
}
