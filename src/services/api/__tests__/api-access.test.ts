
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock server-only to prevent crash in test environment
vi.mock("server-only", () => { return {}; });

import { getUnits, ensureDataLoaded, fetchGameData } from "../api";
import { registry } from "../registry";
import { DataValidationError } from "../mappers";
import * as ApiClient from "../api-client";
import { AllDataResponse } from "@/types/api";

// Mock API Client entirely
vi.mock("../api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api-client")>();
  return {
    ...actual,
    fetchRemoteData: vi.fn(),
  };
});

describe("API Access & Reliability", () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
        registry.reset(); // Use our new helper
    });
    
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Caching Strategy", () => {
        it("should call fetchRemoteData only once when getUnits is called multiple times", async () => {
            const mockData = {
                units: [{ entity_id: "u1", name: "Unit 1", category: "Creature", magic_school: "Wild" }],
                spells: [],
                titans: [],
                spellcasters: [],
                consumables: [],
                upgrades: [],
                build_info: { version: "1", generated_at: "now" }
            } as any;
            
            // Setup successful fetch
            (ApiClient.fetchRemoteData as any).mockResolvedValue(mockData);

            // 1. First Call: Should fetch
            const units1 = await getUnits();
            expect(units1).toHaveLength(1);
            expect(ApiClient.fetchRemoteData).toHaveBeenCalledTimes(1);

            // 2. Second Call: Should use cache (fetch count remains 1)
            const units2 = await getUnits();
            expect(units2).toHaveLength(1);
            expect(ApiClient.fetchRemoteData).toHaveBeenCalledTimes(1);
        });
    });

    describe("Error Handling", () => {
        it("should propagate DataFetchError (Network Error)", async () => {
            const networkError = new ApiClient.DataFetchError("Network Failure", 500);
            (ApiClient.fetchRemoteData as any).mockRejectedValue(networkError);

            await expect(getUnits()).rejects.toThrow("Network Failure");
            
            // Ensure registry remains uninitialized on failure
            expect(registry.isInitialized()).toBe(false);
        });

        it("should propagate DataValidationError (Schema Error)", async () => {
             const validationError = new DataValidationError("Invalid JSON", "Friendly Message");
             (ApiClient.fetchRemoteData as any).mockRejectedValue(validationError);

             await expect(getUnits()).rejects.toThrow("Invalid JSON");
             expect(registry.isInitialized()).toBe(false);
        });
        
        it("should unexpected errors propagate", async () => {
             (ApiClient.fetchRemoteData as any).mockRejectedValue(new Error("Boom"));

             await expect(getUnits()).rejects.toThrow("Boom");
        });
    });
});
