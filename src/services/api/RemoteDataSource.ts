
import { GameDataSource } from "./GameDataSource";
import { AllDataResponse } from "@/types/api";
import { fetchRemoteData, fetchRemoteCriticalData } from "./api-client";

export class RemoteDataSource implements GameDataSource {
    async fetch(): Promise<AllDataResponse> {
        return await fetchRemoteData();
    }

    async fetchCritical(): Promise<AllDataResponse> {
        return await fetchRemoteCriticalData();
    }
}
