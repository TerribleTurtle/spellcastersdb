import { AllDataResponse } from "@/types/api";

export interface GameDataSource {
  fetch(): Promise<AllDataResponse>;
  fetchCritical(): Promise<AllDataResponse>;
}
