import { CONFIG } from "@/lib/config";
import { monitoring } from "@/services/monitoring";
import { AllDataResponse } from "@/types/api";

import {
  DataValidationError,
  RawData,
  RawUnit,
  mapRawDataToAllData,
} from "./mappers";

export { DataValidationError };

export class DataFetchError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "DataFetchError";
  }
}

export async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorMsg = `Failed to fetch ${url}: ${response.status} ${response.statusText}`;
      monitoring.captureMessage(errorMsg, "error", {
        context: "api-client.ts:fetchFromApi",
        status: response.status,
        statusText: response.statusText,
      });
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
  const [units, spells, spellcasters, titans, consumables, upgrades] =
    await Promise.all([
      fetchChunk<RawUnit[]>("units.json"),
      fetchChunk<unknown[]>("spells.json"),
      fetchChunk<unknown[]>("heroes.json"),
      fetchChunk<unknown[]>("titans.json").catch((err) => {
        monitoring.captureException(err, {
          message: "Failed to fetch titans, defaulting to empty",
          context: "api-client.ts:fetchEntities:titans",
        });
        return [];
      }),
      fetchChunk<unknown[]>("consumables.json").catch((err) => {
        monitoring.captureException(err, {
          message: "Failed to fetch consumables, defaulting to empty",
          context: "api-client.ts:fetchEntities:consumables",
        });
        return [];
      }),
      fetchChunk<unknown[]>("upgrades.json").catch((err) => {
        monitoring.captureException(err, {
          message: "Failed to fetch upgrades, defaulting to empty array",
          context: "api-client.ts:fetchEntities:upgrades",
        });
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
  const [units, spells, spellcasters, titans] = await Promise.all([
    fetchChunk<RawUnit[]>("units.json"),
    fetchChunk<unknown[]>("spells.json"),
    fetchChunk<unknown[]>("heroes.json"),
    fetchChunk<unknown[]>("titans.json").catch((err) => {
      monitoring.captureException(err, {
        message: "Failed to fetch titans, defaulting to empty",
        context: "api-client.ts:fetchCriticalChunkedData:titans",
      });
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
