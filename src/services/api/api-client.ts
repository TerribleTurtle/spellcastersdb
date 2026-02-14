import { CONFIG } from "@/lib/config";
import { RawData, mapRawDataToAllData } from "./mappers";
import { AllDataResponse } from "@/types/api";

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

export async function fetchRemoteData(): Promise<AllDataResponse> {
  const url = `${CONFIG.API.BASE_URL}/all_data.json`;

  try {
    const rawData = await fetchJson<RawData>(url, {
      next: {
        revalidate: CONFIG.API.REVALIDATE_SECONDS,
        tags: ["game-data"],
      },
    });

    const data = mapRawDataToAllData(rawData);
    
    return { ...data, _source: `Remote API (${url})` };

  } catch (error) {
    console.error("Error fetching game data:", error);
    throw error;
  }
}
