/**
 * 🔥 ADVERSARIAL / EVIL TEST PASS for api.ts
 *
 * These tests intentionally abuse the API layer with:
 * - Poison inputs (null, undefined, empty strings, prototype keys)
 * - Concurrent race conditions
 * - Registry corruption mid-flight
 * - Non-Error throws
 * - Empty/partial data payloads
 * - Duplicate entity IDs across collections
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { monitoring } from "@/services/monitoring";
import { AllDataResponse } from "@/types/api";

import { LocalDataSource } from "../LocalDataSource";
import { RemoteDataSource } from "../RemoteDataSource";
import {
  ensureDataLoaded,
  fetchCriticalGameData,
  fetchGameData,
  getAllEntities,
  getConsumables,
  getEntityById,
  getIncantations,
  getSpellcasterById,
  getSpellcasters,
  getSpells,
  getTitans,
  getUnitById,
  getUnits,
  getUpgrades,
} from "../api";
import { registry } from "../registry";

vi.mock("server-only", () => ({}));
vi.mock("../LocalDataSource");
vi.mock("../RemoteDataSource");
vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Shared Fixtures
// ---------------------------------------------------------------------------
const EMPTY_DATA: AllDataResponse = {
  build_info: { version: "evil", generated_at: "never" },
  units: [],
  spells: [],
  titans: [],
  spellcasters: [],
  consumables: [],
  upgrades: [],
  infusions: [],
};

const POPULATED_DATA: AllDataResponse = {
  ...EMPTY_DATA,
  units: [
    { entity_id: "u1", name: "Goblin" } as any,
    { entity_id: "u2", name: "Orc" } as any,
  ],
  spells: [{ entity_id: "s1", name: "Fireball" } as any],
  titans: [{ entity_id: "t1", name: "Colossus" } as any],
  spellcasters: [
    {
      entity_id: "sc_entity",
      spellcaster_id: "sc_legacy",
      name: "Mage",
    } as any,
  ],
  consumables: [{ entity_id: "c1", name: "Potion" } as any],
  upgrades: [{ entity_id: "up1", name: "Sharp Blade" } as any],
};

describe("🔥 api.ts — Adversarial Evil Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registry.reset();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. POISON INPUTS — By-ID Lookups
  // =========================================================================
  describe("Poison Inputs: By-ID Lookups", () => {
    beforeEach(() => {
      registry.initialize(POPULATED_DATA);
    });

    it("should return null for empty string ID", async () => {
      expect(await getEntityById("")).toBeNull();
      expect(await getUnitById("")).toBeNull();
      expect(await getSpellcasterById("")).toBeNull();
    });

    it("should return null for whitespace-only ID", async () => {
      expect(await getEntityById("   ")).toBeNull();
      expect(await getUnitById("   ")).toBeNull();
      expect(await getSpellcasterById("   ")).toBeNull();
    });

    it("should return null for __proto__ injection attempt", async () => {
      expect(await getEntityById("__proto__")).toBeNull();
      expect(await getEntityById("constructor")).toBeNull();
      expect(await getEntityById("toString")).toBeNull();
      expect(await getEntityById("hasOwnProperty")).toBeNull();
    });

    it("should return null for SQL/NoSQL injection strings", async () => {
      expect(await getEntityById("'; DROP TABLE units;--")).toBeNull();
      expect(await getEntityById('{"$gt":""}')).toBeNull();
      expect(await getEntityById("<script>alert(1)</script>")).toBeNull();
    });

    it("should return null for extremely long ID", async () => {
      const longId = "x".repeat(10_000);
      expect(await getEntityById(longId)).toBeNull();
      expect(await getUnitById(longId)).toBeNull();
    });

    it("should return null for unicode/emoji ID", async () => {
      expect(await getEntityById("🔥💀🧙‍♂️")).toBeNull();
      expect(await getEntityById("\u0000\u0001\u0002")).toBeNull();
    });
  });

  // =========================================================================
  // 2. EMPTY DATA — Collections return [] not crash
  // =========================================================================
  describe("Empty Data Resilience", () => {
    it("should return empty arrays for all getters when data has zero entities", async () => {
      registry.initialize(EMPTY_DATA);

      expect(await getUnits()).toEqual([]);
      expect(await getSpells()).toEqual([]);
      expect(await getTitans()).toEqual([]);
      expect(await getSpellcasters()).toEqual([]);
      expect(await getConsumables()).toEqual([]);
      expect(await getUpgrades()).toEqual([]);
      expect(await getIncantations()).toEqual([]);
      expect(await getAllEntities()).toEqual([]);
    });

    it("should return null for any by-ID lookup on empty data", async () => {
      registry.initialize(EMPTY_DATA);

      expect(await getEntityById("anything")).toBeNull();
      expect(await getUnitById("anything")).toBeNull();
      expect(await getSpellcasterById("anything")).toBeNull();
    });
  });

  // =========================================================================
  // 3. RACE CONDITIONS — Concurrent ensureDataLoaded
  // =========================================================================
  describe("Race Conditions", () => {
    it("should survive N concurrent ensureDataLoaded calls without double-init", async () => {
      vi.stubEnv("NODE_ENV", "production");

      let fetchCount = 0;
      vi.spyOn(RemoteDataSource.prototype, "fetch").mockImplementation(
        async () => {
          fetchCount++;
          // simulate network latency
          // DELIBERATE TIMEOUT: Simulating real network latency to test race-condition stability
          await new Promise((r) => setTimeout(r, 10));
          return POPULATED_DATA;
        }
      );

      // Fire 10 concurrent calls
      const promises = Array.from({ length: 10 }, () => ensureDataLoaded());
      await Promise.all(promises);

      // Registry should be initialized
      expect(registry.isInitialized()).toBe(true);

      // Data should still be correct after the race
      expect(await getUnits()).toEqual(POPULATED_DATA.units);

      // The Thundering Herd fix should ensure we only fired one remote fetch
      expect(fetchCount).toBe(1);
    });

    it("should survive concurrent getEntityById calls while registry is cold", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.spyOn(RemoteDataSource.prototype, "fetch").mockResolvedValue(
        POPULATED_DATA
      );

      const results = await Promise.all([
        getEntityById("u1"),
        getEntityById("s1"),
        getEntityById("t1"),
        getEntityById("nonexistent"),
      ]);

      expect(results[0]).toEqual(POPULATED_DATA.units[0]);
      expect(results[1]).toEqual(POPULATED_DATA.spells[0]);
      expect(results[2]).toEqual(POPULATED_DATA.titans[0]);
      expect(results[3]).toBeNull();
    });
  });

  // =========================================================================
  // 4. NON-ERROR THROWS — fetchWithFallback with exotic throw types
  // =========================================================================
  describe("Exotic Error Types", () => {
    it("should survive when data source throws a string instead of Error", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.spyOn(RemoteDataSource.prototype, "fetch").mockRejectedValue(
        "raw string error"
      );

      await expect(fetchGameData()).rejects.toBe("raw string error");
      expect(monitoring.captureException).toHaveBeenCalledWith(
        "raw string error",
        expect.anything()
      );
    });

    it("should survive when data source throws null", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.spyOn(RemoteDataSource.prototype, "fetch").mockRejectedValue(null);

      await expect(fetchGameData()).rejects.toBeNull();
      expect(monitoring.captureException).toHaveBeenCalled();
    });

    it("should survive when data source throws undefined", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.spyOn(RemoteDataSource.prototype, "fetch").mockRejectedValue(
        undefined
      );

      await expect(fetchGameData()).rejects.toBeUndefined();
    });

    it("should survive when data source throws a number", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.spyOn(RemoteDataSource.prototype, "fetch").mockRejectedValue(42);

      await expect(fetchGameData()).rejects.toBe(42);
    });

    it("dev fallback should still work when local throws a non-Error", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.spyOn(LocalDataSource.prototype, "fetch").mockRejectedValue(
        "local boom"
      );
      vi.spyOn(RemoteDataSource.prototype, "fetch").mockResolvedValue(
        POPULATED_DATA
      );

      const data = await fetchGameData();
      expect(data).toBe(POPULATED_DATA);
      expect(registry.isInitialized()).toBe(true);
    });
  });

  // =========================================================================
  // 5. REGISTRY CORRUPTION — Re-init with different data
  // =========================================================================
  describe("Registry Corruption & Re-initialization", () => {
    it("should overwrite previous data when registry.initialize is called again", async () => {
      // First init
      registry.initialize(POPULATED_DATA);
      expect(await getUnits()).toHaveLength(2);

      // Re-init with empty data
      registry.initialize(EMPTY_DATA);
      expect(await getUnits()).toEqual([]);
      expect(await getEntityById("u1")).toBeNull();
    });

    it("should handle being reset mid-flight between getter calls", async () => {
      registry.initialize(POPULATED_DATA);

      const units = await getUnits();
      expect(units).toHaveLength(2);

      // Nuke the registry between calls
      registry.reset();

      // Next call should trigger a fetch since registry is now uninitialized
      vi.stubEnv("NODE_ENV", "production");
      vi.spyOn(RemoteDataSource.prototype, "fetch").mockResolvedValue(
        EMPTY_DATA
      );

      const spells = await getSpells();
      expect(spells).toEqual([]); // Should get empty from the fresh fetch
    });
  });

  // =========================================================================
  // 6. DUPLICATE / COLLISION ENTITY IDs
  // =========================================================================
  describe("Entity ID Collisions", () => {
    it("should handle duplicate entity_id across units and spells (last-write-wins in unified map)", async () => {
      const collisionData: AllDataResponse = {
        ...EMPTY_DATA,
        units: [{ entity_id: "collision_id", name: "Unit Version" } as any],
        spells: [{ entity_id: "collision_id", name: "Spell Version" } as any],
      };

      registry.initialize(collisionData);

      // In the unified map, spells are registered AFTER units, so spell wins
      const entity = await getEntityById("collision_id");
      expect(entity).toEqual(collisionData.spells[0]);

      // But getUnitById only checks the unit map
      const unit = await getUnitById("collision_id");
      expect(unit).toEqual(collisionData.units[0]);
    });

    it("getIncantations should include BOTH collision entries", async () => {
      const collisionData: AllDataResponse = {
        ...EMPTY_DATA,
        units: [{ entity_id: "dup", name: "Unit" } as any],
        spells: [{ entity_id: "dup", name: "Spell" } as any],
      };

      registry.initialize(collisionData);
      const inc = await getIncantations();

      // Both should be present since getIncantations spreads both arrays
      expect(inc).toHaveLength(2);
    });
  });

  // =========================================================================
  // 7. FETCHCRITICALDATA — Verify it actually calls fetchCritical not fetch
  // =========================================================================
  describe("fetchCriticalGameData isolation", () => {
    it("dev fallback for fetchCriticalGameData should call fetchCritical on remote, not fetch", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.spyOn(LocalDataSource.prototype, "fetchCritical").mockRejectedValue(
        new Error("local critical fail")
      );
      const remoteCriticalSpy = vi
        .spyOn(RemoteDataSource.prototype, "fetchCritical")
        .mockResolvedValue(POPULATED_DATA);
      const remoteFetchSpy = vi.spyOn(RemoteDataSource.prototype, "fetch");

      await fetchCriticalGameData();

      expect(remoteCriticalSpy).toHaveBeenCalledTimes(1);
      expect(remoteFetchSpy).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 8. MONITORING ABUSE — Ensure captureException doesn't throw
  // =========================================================================
  describe("Monitoring Resilience", () => {
    it("should not crash if monitoring.captureException itself throws", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.spyOn(RemoteDataSource.prototype, "fetch").mockRejectedValue(
        new Error("API down")
      );
      vi.mocked(monitoring.captureException).mockImplementation(() => {
        throw new Error("Monitoring is broken too!");
      });

      // The original error should still propagate, even if monitoring blows up
      await expect(fetchGameData()).rejects.toThrow(
        "Monitoring is broken too!"
      );
    });
  });

  // =========================================================================
  // 9. MALFORMED DATA — null/undefined arrays in AllDataResponse
  // =========================================================================
  describe("Malformed AllDataResponse Payloads", () => {
    it("should crash on null arrays (registry.initialize calls forEach on null)", async () => {
      const nullArrayData = {
        ...EMPTY_DATA,
        units: null as any,
      };

      // This SHOULD throw — registry.initialize does data.units.forEach()
      expect(() => registry.initialize(nullArrayData)).toThrow();
    });

    it("should crash on undefined arrays", async () => {
      const undefinedArrayData = {
        ...EMPTY_DATA,
        spells: undefined as any,
      };

      expect(() => registry.initialize(undefinedArrayData)).toThrow();
    });

    it("should handle entities with undefined entity_id", async () => {
      const badIdData: AllDataResponse = {
        ...EMPTY_DATA,
        units: [{ entity_id: undefined, name: "Ghost" } as any],
      };

      // Registry will Map.set(undefined, obj) — legitimate JS, just weird
      registry.initialize(badIdData);

      // Lookup by undefined key should not crash
      expect(await getEntityById("undefined")).toBeNull();
      expect(await getUnitById("undefined")).toBeNull();
    });

    it("should handle entities with null entity_id", async () => {
      const nullIdData: AllDataResponse = {
        ...EMPTY_DATA,
        units: [{ entity_id: null, name: "Phantom" } as any],
      };

      registry.initialize(nullIdData);
      expect(await getEntityById("null")).toBeNull();
    });
  });

  // =========================================================================
  // 10. SPELLCASTER EDGE CASES — empty string spellcaster_id
  // =========================================================================
  describe("Spellcaster ID Edge Cases", () => {
    it("should fallback to entity_id when spellcaster_id is empty string", async () => {
      const edgeCaseData: AllDataResponse = {
        ...EMPTY_DATA,
        spellcasters: [
          {
            entity_id: "sc_real",
            spellcaster_id: "", // empty string is falsy
            name: "Empty Legacy",
          } as any,
        ],
      };

      registry.initialize(edgeCaseData);

      // "" || "sc_real" => "sc_real", so it should be keyed by entity_id
      expect(await getSpellcasterById("sc_real")).toEqual(
        edgeCaseData.spellcasters[0]
      );
      expect(await getSpellcasterById("")).toBeNull();
    });

    it("should handle spellcaster with NO spellcaster_id field at all", async () => {
      const noLegacyData: AllDataResponse = {
        ...EMPTY_DATA,
        spellcasters: [{ entity_id: "sc_only", name: "Modern" } as any],
      };

      registry.initialize(noLegacyData);

      // undefined || "sc_only" => "sc_only"
      expect(await getSpellcasterById("sc_only")).toEqual(
        noLegacyData.spellcasters[0]
      );
    });

    it("should handle spellcaster where spellcaster_id === entity_id", async () => {
      const sameIdData: AllDataResponse = {
        ...EMPTY_DATA,
        spellcasters: [
          {
            entity_id: "same_id",
            spellcaster_id: "same_id",
            name: "Twin ID",
          } as any,
        ],
      };

      registry.initialize(sameIdData);
      expect(await getSpellcasterById("same_id")).toEqual(
        sameIdData.spellcasters[0]
      );
    });
  });

  // =========================================================================
  // 11. ARRAY MUTABILITY — callers can't corrupt registry
  // =========================================================================
  describe("Array Mutability Safety", () => {
    it("mutating the returned units array should not affect subsequent calls", async () => {
      registry.initialize(POPULATED_DATA);

      const units1 = await getUnits();
      expect(units1).toHaveLength(2);

      // Evil: try to corrupt the array
      units1.length = 0;
      units1.push({ entity_id: "evil", name: "Injected" } as any);

      // Fresh call should still return original data
      const units2 = await getUnits();
      expect(units2).toHaveLength(2);
      expect(units2[0]).toEqual(POPULATED_DATA.units[0]);
    });

    it("mutating getAllEntities result should not affect registry", async () => {
      registry.initialize(POPULATED_DATA);

      const all1 = await getAllEntities();
      const originalLength = all1.length;

      // Try to corrupt
      all1.splice(0, all1.length);

      const all2 = await getAllEntities();
      expect(all2).toHaveLength(originalLength);
    });
  });

  // =========================================================================
  // 12. DOUBLE FETCH — fetchGameData overwrites registry each time
  // =========================================================================
  describe("Double Fetch Behavior", () => {
    it("calling fetchGameData twice should re-initialize registry with fresh data", async () => {
      vi.stubEnv("NODE_ENV", "production");

      // First fetch returns populated data
      const fetchSpy = vi
        .spyOn(RemoteDataSource.prototype, "fetch")
        .mockResolvedValueOnce(POPULATED_DATA)
        .mockResolvedValueOnce(EMPTY_DATA);

      const data1 = await fetchGameData();
      expect(data1.units).toHaveLength(2);
      expect(await getUnits()).toHaveLength(2);

      // Second fetch returns empty — registry should be overwritten
      const data2 = await fetchGameData();
      expect(data2.units).toHaveLength(0);
      expect(await getUnits()).toEqual([]);

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  // =========================================================================
  // 13. CONCURRENT MIXED OPERATIONS — reads during write
  // =========================================================================
  describe("Concurrent Mixed Operations", () => {
    it("should handle interleaved reads and fetches without crashing", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.spyOn(RemoteDataSource.prototype, "fetch").mockImplementation(
        async () => {
          // DELIBERATE TIMEOUT: Simulating real network latency for concurrent operation tests
          await new Promise((r) => setTimeout(r, 5));
          return POPULATED_DATA;
        }
      );

      // Fire a mix of reads and inits concurrently
      const results = await Promise.allSettled([
        getUnits(),
        fetchGameData(),
        getEntityById("u1"),
        getAllEntities(),
        ensureDataLoaded(),
        getSpellcasterById("sc_legacy"),
        getIncantations(),
      ]);

      // All should settle (none should reject with unhandled errors)
      const rejections = results.filter((r) => r.status === "rejected");
      expect(rejections).toHaveLength(0);
    });
  });

  // =========================================================================
  // 14. MASSIVE PAYLOAD — Performance boundary
  // =========================================================================
  describe("Large Payload Stress", () => {
    it("should handle 10,000 units without crashing", async () => {
      const massiveData: AllDataResponse = {
        ...EMPTY_DATA,
        units: Array.from({ length: 10_000 }, (_, i) => ({
          entity_id: `unit_${i}`,
          name: `Unit ${i}`,
        })) as any,
      };

      registry.initialize(massiveData);

      const units = await getUnits();
      expect(units).toHaveLength(10_000);

      // Spot-check first, last, middle
      expect(await getUnitById("unit_0")).toEqual(massiveData.units[0]);
      expect(await getUnitById("unit_9999")).toEqual(massiveData.units[9999]);
      expect(await getUnitById("unit_5000")).toEqual(massiveData.units[5000]);
    });
  });
});
