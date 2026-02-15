import { CONFIG } from "@/lib/config";
import { RawData, mapRawDataToAllData, DataValidationError, RawUnit } from "./mappers";
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
        const errorMsg = `Failed to fetch ${url}: ${response.status} ${response.statusText}`;
        console.error(errorMsg);
        throw new DataFetchError(errorMsg, response.status);
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
    fetchChunk<RawUnit[]>("units.json"),
    fetchChunk<unknown[]>("spells.json"),
    fetchChunk<unknown[]>("heroes.json"),
    fetchChunk<unknown[]>("titans.json").catch(err => {
        console.warn("Failed to fetch titans, defaulting to empty:", err);
        return [];
    }),
    fetchChunk<unknown[]>("consumables.json").catch(err => {
        console.warn("Failed to fetch consumables, defaulting to empty:", err);
        return [];
    }),
    fetchChunk<unknown[]>("upgrades.json").catch(err => {
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

export async function fetchCriticalChunkedData(): Promise<AllDataResponse> {
  const [
    units, 
    spells, 
    spellcasters, 
    titans, 
  ] = await Promise.all([
    fetchChunk<RawUnit[]>("units.json"),
    fetchChunk<unknown[]>("spells.json"),
    fetchChunk<unknown[]>("heroes.json"),
    fetchChunk<unknown[]>("titans.json").catch(err => {
        console.warn("Failed to fetch titans, defaulting to empty:", err);
        return [];
    }),
  ]);

  const rawData: RawData = {
    build_info: {
        version: "v2-critical",
        generated_at: new Date().toISOString(),
    },
    units,
    spells,
    spellcasters,
    titans,
    consumables: [],
    upgrades: [],
  };

  const data = mapRawDataToAllData(rawData);
  return { ...data, _source: `Remote API (Critical)` };
}


