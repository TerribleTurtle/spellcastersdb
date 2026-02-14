
import { GameDataSource } from "./GameDataSource";
import { AllDataResponse } from "@/types/api";
import { fetchLocalData } from "./dev-data-source";

export class LocalDataSource implements GameDataSource {
    async fetch(): Promise<AllDataResponse> {
        const data = await fetchLocalData();
        if (!data) {
            throw new Error("Failed to load local data");
        }
        return data;
    }
}
