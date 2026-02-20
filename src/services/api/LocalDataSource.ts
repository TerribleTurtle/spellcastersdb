import { AllDataResponse } from "@/types/api";

import { GameDataSource } from "./GameDataSource";
import { fetchLocalData } from "./dev-data-source";

export class LocalDataSource implements GameDataSource {
  async fetch(): Promise<AllDataResponse> {
    const data = await fetchLocalData();
    if (!data) {
      throw new Error("Failed to load local data");
    }
    return data;
  }

  async fetchCritical(): Promise<AllDataResponse> {
    return this.fetch();
  }
}
