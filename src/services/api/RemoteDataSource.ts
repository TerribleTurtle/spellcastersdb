import { AllDataResponse } from "@/types/api";

import { GameDataSource } from "./GameDataSource";
import { fetchChunkedData, fetchCriticalChunkedData } from "./api-client";

export class RemoteDataSource implements GameDataSource {
  async fetch(): Promise<AllDataResponse> {
    return await fetchChunkedData();
  }

  async fetchCritical(): Promise<AllDataResponse> {
    return await fetchCriticalChunkedData();
  }
}
