import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { monitoring } from "@/services/monitoring";
import { AllDataResponse } from "@/types/api";

import { LocalDataSource } from "../LocalDataSource";
import { RemoteDataSource } from "../RemoteDataSource";
import { ensureDataLoaded, fetchCriticalGameData } from "../api";
import { registry } from "../registry";

// 1. Mock server-only so tests can run in JSDOM
vi.mock("server-only", () => ({}));

// 2. Mock DataSources specifically to preserve prototype for `instanceof`
vi.mock("../LocalDataSource");
vi.mock("../RemoteDataSource");

// 3. Mock monitoring
vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
  },
}));

describe("api.ts - Initialization & Fallback Mechanisms", () => {
  // A minimal valid mock data response
  const mockData: AllDataResponse = {
    build_info: { version: "v1", generated_at: "test" },
    units: [],
    spells: [],
    titans: [],
    spellcasters: [],
    consumables: [],
    upgrades: [],
    infusions: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    registry.reset();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("ensureDataLoaded()", () => {
    it("should no-op when registry is already initialized", async () => {
      registry.initialize(mockData);

      // Verify setup
      expect(registry.isInitialized()).toBe(true);

      const localFetchSpy = vi.spyOn(LocalDataSource.prototype, "fetch");
      const remoteFetchSpy = vi.spyOn(RemoteDataSource.prototype, "fetch");

      await ensureDataLoaded();

      expect(localFetchSpy).not.toHaveBeenCalled();
      expect(remoteFetchSpy).not.toHaveBeenCalled();
    });

    it("should fetch and initialize registry when uninitialized (prod mode)", async () => {
      vi.stubEnv("NODE_ENV", "production");

      const remoteFetchSpy = vi
        .spyOn(RemoteDataSource.prototype, "fetch")
        .mockResolvedValue(mockData);

      expect(registry.isInitialized()).toBe(false);

      await ensureDataLoaded();

      expect(remoteFetchSpy).toHaveBeenCalledTimes(1);
      expect(registry.isInitialized()).toBe(true);
    });

    it("should fetch and initialize registry when uninitialized (dev mode)", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const localFetchSpy = vi
        .spyOn(LocalDataSource.prototype, "fetch")
        .mockResolvedValue(mockData);

      expect(registry.isInitialized()).toBe(false);

      await ensureDataLoaded();

      expect(localFetchSpy).toHaveBeenCalledTimes(1);
      expect(registry.isInitialized()).toBe(true);
    });
  });

  describe("fetchCriticalGameData()", () => {
    it("should call fetchCritical() instead of fetch() on the source", async () => {
      vi.stubEnv("NODE_ENV", "production");

      const fetchCriticalSpy = vi
        .spyOn(RemoteDataSource.prototype, "fetchCritical")
        .mockResolvedValue(mockData);
      const fetchSpy = vi.spyOn(RemoteDataSource.prototype, "fetch");

      const result = await fetchCriticalGameData();

      expect(fetchCriticalSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(result).toBe(mockData);
    });

    it("should populate the registry after fetching data if uninitialized", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.spyOn(RemoteDataSource.prototype, "fetchCritical").mockResolvedValue(
        mockData
      );

      expect(registry.isInitialized()).toBe(false);
      await fetchCriticalGameData();
      expect(registry.isInitialized()).toBe(true);
    });

    it("should NOT overwrite a fully initialized registry with partial data", async () => {
      vi.stubEnv("NODE_ENV", "production");

      // Setup a "full" dataset with infusions
      const fullData = { ...mockData, infusions: [{ id: "i1" }] as any };
      registry.initialize(fullData);
      expect(registry.isInitialized()).toBe(true);

      const registryInitSpy = vi.spyOn(registry, "initialize");

      // Critical fetch returns partial data (no infusions)
      const partialData = { ...mockData, infusions: [] };
      vi.spyOn(RemoteDataSource.prototype, "fetchCritical").mockResolvedValue(
        partialData
      );

      await fetchCriticalGameData();

      // The guard should prevent the partial data from clobbering the full registry
      expect(registryInitSpy).not.toHaveBeenCalled();
    });
  });

  describe("fetchWithFallback() internall processing", () => {
    it("development: should fallback Local -> Remote when LocalDataSource throws", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const localError = new Error("Local File Missing");
      const localFetchSpy = vi
        .spyOn(LocalDataSource.prototype, "fetch")
        .mockRejectedValue(localError);

      const remoteFetchSpy = vi
        .spyOn(RemoteDataSource.prototype, "fetch")
        .mockResolvedValue(mockData);

      // Trigger the fetch path (ensureDataLoaded uses fetchGameData which uses fetchWithFallback)
      await ensureDataLoaded();

      // Ensure both were called in order
      expect(localFetchSpy).toHaveBeenCalledTimes(1);
      expect(remoteFetchSpy).toHaveBeenCalledTimes(1);

      // Ensure monitoring logged it
      expect(monitoring.captureException).toHaveBeenCalledWith(
        localError,
        expect.anything()
      );
      expect(monitoring.captureMessage).toHaveBeenCalledWith(
        "Local data failed, attempting remote fallback...",
        "warning",
        expect.anything()
      );

      // Ensure registry eventually initialized from the remote data
      expect(registry.isInitialized()).toBe(true);
    });

    it("development: should re-throw if both local and remote fail", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const localError = new Error("Local failed");
      vi.spyOn(LocalDataSource.prototype, "fetch").mockRejectedValue(
        localError
      );

      const remoteError = new Error("Remote failed too");
      vi.spyOn(RemoteDataSource.prototype, "fetch").mockRejectedValue(
        remoteError
      );

      await expect(ensureDataLoaded()).rejects.toThrow("Remote failed too");

      expect(registry.isInitialized()).toBe(false);
    });

    it("production: should immediately throw without falling back to Remote when Remote throws", async () => {
      vi.stubEnv("NODE_ENV", "production");

      const remoteError = new Error("API Down");
      const remoteFetchSpy = vi
        .spyOn(RemoteDataSource.prototype, "fetch")
        .mockRejectedValue(remoteError);

      // Reset local fetch mock to ensure it's not inadvertently called
      vi.spyOn(LocalDataSource.prototype, "fetch").mockRejectedValue(
        new Error("Should not be called")
      );

      await expect(ensureDataLoaded()).rejects.toThrow("API Down");

      expect(remoteFetchSpy).toHaveBeenCalledTimes(1);

      // Since it's production, it shouldn't log a fallback warning
      expect(monitoring.captureMessage).not.toHaveBeenCalled();

      expect(registry.isInitialized()).toBe(false);
    });
  });

  describe("Collection Getters", () => {
    const basicMockData: AllDataResponse = {
      ...mockData,
      units: [{ entity_id: "u1" } as any],
      spells: [{ entity_id: "s1" } as any],
      titans: [{ entity_id: "t1" } as any],
      spellcasters: [{ entity_id: "sc1" } as any],
      consumables: [{ entity_id: "c1" } as any],
      upgrades: [{ entity_id: "up1" } as any],
    };

    it("should return data from registry when initialized (no fetch)", async () => {
      registry.initialize(basicMockData);

      const fetchSpy = vi.spyOn(RemoteDataSource.prototype, "fetch");

      const {
        getUnits,
        getSpells,
        getTitans,
        getSpellcasters,
        getConsumables,
        getUpgrades,
      } = await import("../api");

      expect(await getUnits()).toEqual(basicMockData.units);
      expect(await getSpells()).toEqual(basicMockData.spells);
      expect(await getTitans()).toEqual(basicMockData.titans);
      expect(await getSpellcasters()).toEqual(basicMockData.spellcasters);
      expect(await getConsumables()).toEqual(basicMockData.consumables);
      expect(await getUpgrades()).toEqual(basicMockData.upgrades);

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("should fallback to fetch when registry is uninitialized", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.spyOn(RemoteDataSource.prototype, "fetch").mockResolvedValue(
        basicMockData
      );

      const {
        getUnits,
        getSpells,
        getTitans,
        getSpellcasters,
        getConsumables,
        getUpgrades,
      } = await import("../api");

      expect(registry.isInitialized()).toBe(false);

      expect(await getSpells()).toEqual(basicMockData.spells);

      expect(registry.isInitialized()).toBe(true);

      expect(await getUnits()).toEqual(basicMockData.units);
      expect(await getTitans()).toEqual(basicMockData.titans);
      expect(await getSpellcasters()).toEqual(basicMockData.spellcasters);
      expect(await getConsumables()).toEqual(basicMockData.consumables);
      expect(await getUpgrades()).toEqual(basicMockData.upgrades);
    });

    describe("getIncantations()", () => {
      it("should merge units and spells from registry", async () => {
        registry.initialize(basicMockData);

        const { getIncantations } = await import("../api");
        const fetchSpy = vi.spyOn(RemoteDataSource.prototype, "fetch");

        const result = await getIncantations();

        expect(result).toHaveLength(2); // 1 unit + 1 spell
        expect(result).toEqual(
          expect.arrayContaining([{ entity_id: "u1" }, { entity_id: "s1" }])
        );
        expect(fetchSpy).not.toHaveBeenCalled();
      });

      it("should fetch and merge units and spells when uninitialized", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.spyOn(RemoteDataSource.prototype, "fetch").mockResolvedValue(
          basicMockData
        );

        const { getIncantations } = await import("../api");

        expect(registry.isInitialized()).toBe(false);
        const result = await getIncantations();

        expect(registry.isInitialized()).toBe(true);
        expect(result).toHaveLength(2);
      });
    });
  });

  describe("By-ID Lookups & Unified Access", () => {
    const lookupMockData: AllDataResponse = {
      ...mockData,
      units: [
        { entity_id: "u1", name: "Unit 1" } as any,
        { entity_id: "shared_id", name: "Shared Unit" } as any,
      ],
      spells: [{ entity_id: "s1", name: "Spell 1" } as any],
      titans: [{ entity_id: "t1", name: "Titan 1" } as any],
      spellcasters: [
        {
          entity_id: "sc1",
          spellcaster_id: "legacy_sc1",
          name: "Spellcaster 1",
        } as any,
      ],
      consumables: [{ entity_id: "c1", name: "Consumable 1" } as any],
      upgrades: [{ entity_id: "up1", name: "Upgrade 1" } as any],
    };

    describe("getEntityById()", () => {
      it("should find an entity by ID from across collections if initialized", async () => {
        registry.initialize(lookupMockData);
        const { getEntityById } = await import("../api");

        expect(await getEntityById("s1")).toEqual(lookupMockData.spells[0]);
        expect(await getEntityById("t1")).toEqual(lookupMockData.titans[0]);
      });

      it("should lazily init and find an entity if uninitialized", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.spyOn(RemoteDataSource.prototype, "fetch").mockResolvedValue(
          lookupMockData
        );

        const { getEntityById } = await import("../api");

        expect(registry.isInitialized()).toBe(false);
        const result = await getEntityById("u1");

        expect(registry.isInitialized()).toBe(true);
        expect(result).toEqual(lookupMockData.units[0]);
      });

      it("should return null if the entity doesn't exist", async () => {
        registry.initialize(lookupMockData);
        const { getEntityById } = await import("../api");

        expect(await getEntityById("missing-id")).toBeNull();
      });
    });

    describe("getUnitById()", () => {
      it("should return a unit if found, and null if missing or in another collection", async () => {
        registry.initialize(lookupMockData);
        const { getUnitById } = await import("../api");

        expect(await getUnitById("u1")).toEqual(lookupMockData.units[0]);
        expect(await getUnitById("s1")).toBeNull(); // It's a spell, not a unit
        expect(await getUnitById("missing-id")).toBeNull();
      });

      it("should lazily init when called uninitialized", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.spyOn(RemoteDataSource.prototype, "fetch").mockResolvedValue(
          lookupMockData
        );
        const { getUnitById } = await import("../api");

        expect(await getUnitById("u1")).toEqual(lookupMockData.units[0]);
        expect(registry.isInitialized()).toBe(true);
      });
    });

    describe("getSpellcasterById()", () => {
      it("should return a spellcaster if found by spellcaster_id (or entity_id if missing legacy id)", async () => {
        registry.initialize(lookupMockData);
        const { getSpellcasterById } = await import("../api");

        // The legacy spellcaster_id is prioritized during registry initialization for the spellcasters map.
        // If a spellcaster_id exists, the spellcaster map is keyed by it, NOT entity_id.
        expect(await getSpellcasterById("legacy_sc1")).toEqual(
          lookupMockData.spellcasters[0]
        );

        // Searching by entity_id directly in the spellcasters map fails if spellcaster_id exists
        expect(await getSpellcasterById("sc1")).toBeNull();
      });

      it("should lazily init when called uninitialized", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.spyOn(RemoteDataSource.prototype, "fetch").mockResolvedValue(
          lookupMockData
        );
        const { getSpellcasterById } = await import("../api");

        expect(await getSpellcasterById("legacy_sc1")).toEqual(
          lookupMockData.spellcasters[0]
        );
        expect(registry.isInitialized()).toBe(true);
      });
    });

    describe("getAllEntities()", () => {
      it("should combine units, spells, titans, spellcasters, consumables BUT EXCLUDE upgrades (initialized)", async () => {
        registry.initialize(lookupMockData);
        const { getAllEntities } = await import("../api");
        const fetchSpy = vi.spyOn(RemoteDataSource.prototype, "fetch");

        const all = await getAllEntities();

        expect(all).toHaveLength(6); // 2 units + 1 spell + 1 titan + 1 spellcaster + 1 consumable
        expect(all.find((e) => e.entity_id === "up1")).toBeUndefined(); // Upgrade excluded
        expect(fetchSpy).not.toHaveBeenCalled();
      });

      it("should combine units, spells, titans, spellcasters, consumables BUT EXCLUDE upgrades (uninitialized)", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.spyOn(RemoteDataSource.prototype, "fetch").mockResolvedValue(
          lookupMockData
        );
        const { getAllEntities } = await import("../api");

        expect(registry.isInitialized()).toBe(false);
        const all = await getAllEntities();

        // fetchGameData is called, but getAllEntities builds its own array from the response
        expect(all).toHaveLength(6);
        expect(all.find((e) => e.entity_id === "up1")).toBeUndefined();
      });
    });
  });
});
