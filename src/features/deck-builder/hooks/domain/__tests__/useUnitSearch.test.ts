/* eslint-disable @typescript-eslint/no-explicit-any */

import { renderHook } from "@testing-library/react";
import { useUnitSearch } from "../useUnitSearch";
import { UnifiedEntity } from "@/types/api";
import { describe, it, expect } from "vitest";

// Mock data

const mockFilters = {
  schools: ["Nature"],
  ranks: [],
  categories: [],
  classes: [],
};

describe("useUnitSearch", () => {
    it("should sort results by Priority (Creature > Spell > Structure) without mutating input", () => {
        // Input: Structure (3) then Creature (1)
        // Expected Output: Creature (1) then Structure (3)
        // Note: Structure has no priority defined so it is 99. Creature is 2.
        
         const unsortedInput: UnifiedEntity[] = [
             { entity_id: "3", name: "Unit C", category: "Structure", rank: "I", magic_school: "Nature", cost: 1, power: 1, health: 1, defense: 1, type: "Structure", description: "desc", tags: [] } as unknown as UnifiedEntity,
             { entity_id: "1", name: "Unit A", category: "Creature", rank: "I", magic_school: "Nature", cost: 1, power: 1, health: 1, defense: 1, type: "Creature", description: "desc", tags: [] } as unknown as UnifiedEntity,
        ];
        
        // Deep freeze input to verify no mutation at all if possible, but manually checking index 0 is fine
        const inputCopy = [...unsortedInput];

        const { result } = renderHook(() => useUnitSearch(unsortedInput, "", mockFilters));
        
        const sortedIds = result.current.map((u: any) => u.entity_id);
        
        // Asset usage of correct sort order
        expect(sortedIds).toEqual(["1", "3"]);
        
        // CRITICAL CHECK: Did unsortedInput get mutated?
        expect((unsortedInput[0] as any).entity_id).toBe("3"); 
        expect(unsortedInput).toEqual(inputCopy);
    });
});
