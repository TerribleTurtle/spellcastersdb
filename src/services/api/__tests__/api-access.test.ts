
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock server-only to prevent crash in test environment
vi.mock("server-only", () => { return {}; });

import { getUnits } from "../api";
import { registry } from "../registry";
import { DataValidationError } from "../mappers";
import * as ApiClient from "../api-client";
import { AllDataResponse } from "@/types/api";
import { EntityCategory } from "@/types/enums";

// Mock API Client entirely
vi.mock("../api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api-client")>();
  return {
    ...actual,
    fetchChunkedData: vi.fn(),
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
        it("should call fetchChunkedData only once when getUnits is called multiple times", async () => {
            const mockData: AllDataResponse = {
                units: [{ 
                    entity_id: "u1", 
                    name: "Unit 1", 
                    category: EntityCategory.Creature, 
                    magic_school: "Wild",
                    health: 100,
                    tags: [], // Required by Unit interface
                    description: "Test Unit" 
                }],
                spells: [],
                titans: [],
                spellcasters: [],
                consumables: [],
                upgrades: [],
                build_info: { version: "1", generated_at: "now" }
            };
            
            
            // Setup successful fetch
            vi.mocked(ApiClient.fetchChunkedData).mockResolvedValue(mockData);

            // 1. First Call: Should fetch
            const units1 = await getUnits();
            expect(units1).toHaveLength(1);
            expect(ApiClient.fetchChunkedData).toHaveBeenCalledTimes(1);

            // 2. Second Call: Should use cache (fetch count remains 1)
            const units2 = await getUnits();
            expect(units2).toHaveLength(1);
            expect(ApiClient.fetchChunkedData).toHaveBeenCalledTimes(1);
        });
    });

    describe("Error Handling", () => {
        it("should propagate DataFetchError (Network Error)", async () => {
            const networkError = new ApiClient.DataFetchError("Network Failure", 500);
            vi.mocked(ApiClient.fetchChunkedData).mockRejectedValue(networkError);

            await expect(getUnits()).rejects.toThrow("Network Failure");
            
            // Ensure registry remains uninitialized on failure
            expect(registry.isInitialized()).toBe(false);
        });

        it("should propagate DataValidationError (Schema Error)", async () => {
             const validationError = new DataValidationError("Invalid JSON", "Friendly Message");
             vi.mocked(ApiClient.fetchChunkedData).mockRejectedValue(validationError);

             await expect(getUnits()).rejects.toThrow("Invalid JSON");
             expect(registry.isInitialized()).toBe(false);
        });
        
        it("should unexpected errors propagate", async () => {
             vi.mocked(ApiClient.fetchChunkedData).mockRejectedValue(new Error("Boom"));

             await expect(getUnits()).rejects.toThrow("Boom");
        });
    });
});
