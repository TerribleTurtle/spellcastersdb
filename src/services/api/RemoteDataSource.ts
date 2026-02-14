
import { GameDataSource } from "./GameDataSource";
import { AllDataResponse } from "@/types/api";
import { fetchRemoteData } from "./api-client";

export class RemoteDataSource implements GameDataSource {
    async fetch(): Promise<AllDataResponse> {
        return await fetchRemoteData();
    }
}
