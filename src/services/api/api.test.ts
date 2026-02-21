import {
  type Mock,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { AllDataResponse } from "@/types/api";
import { EntityCategory } from "@/types/enums";

import { fetchGameData } from "./api";

// Mock server-only to allow testing server code in client/test env
vi.mock("server-only", () => {
  return {};
});

describe("Remote Data Validation", () => {
  // Basic mock data satisfying the strict schema
  const mockApiResponse: AllDataResponse = {
    build_info: { version: "test-v1", generated_at: "2025-01-01" },
    spellcasters: [
      {
        entity_id: "sc1",
        spellcaster_id: "sc1",
        name: "Mage",
        category: EntityCategory.Spellcaster,
        class: "Enchanter",
        tags: [],
        health: 100,
        abilities: {
          passive: [],
          primary: { name: "P", description: "" },
          defense: { name: "D", description: "" },
          ultimate: { name: "U", description: "" },
        },
      },
    ],
    units: [
      {
        entity_id: "u1",
        name: "Goblin",
        category: EntityCategory.Creature,
        health: 10,
        tags: [],
        magic_school: "Wild",
        description: "",
      },
    ],
    spells: [],
    titans: [],
    consumables: [],
    upgrades: [],
  };

  beforeEach(() => {
    // Spy on fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate and return data on successful fetch", async () => {
    // Mock success response based on URL
    (global.fetch as Mock).mockImplementation((url: string) => {
      let body: unknown = [];
      if (url.includes("units.json")) body = mockApiResponse.units;
      else if (url.includes("spells.json")) body = mockApiResponse.spells;
      else if (url.includes("heroes.json")) body = mockApiResponse.spellcasters;
      else if (url.includes("titans.json")) body = mockApiResponse.titans;
      else if (url.includes("consumables.json"))
        body = mockApiResponse.consumables;
      else if (url.includes("upgrades.json")) body = mockApiResponse.upgrades;

      return Promise.resolve({
        ok: true,
        json: async () => body,
      });
    });

    const data = await fetchGameData();

    // 6 chunks expected
    expect(global.fetch).toHaveBeenCalledTimes(6);
    expect(data.spellcasters).toHaveLength(1);
    expect(data.units).toHaveLength(1);
    // build_info is mocked in api-client, so we check if it is present and has version
    expect(data.build_info.version).toBe("v2-chunked");
  });

  it("should throw DataFetchError on API failure (404/500)", async () => {
    // Mock error response for one of the chunks
    (global.fetch as Mock).mockImplementation((url: string) => {
      if (url.includes("units.json")) {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Server Error",
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    await expect(fetchGameData()).rejects.toThrow(
      /Failed to fetch.*500 Server Error/
    );
  });

  it("should throw DataFetchError on malformed JSON (Schema Validation Failure)", async () => {
    // Mock malformed data (invalid unit: has category to pass filter, but missing required fields)
    const badUnit = { category: "Creature", foo: "bar" };

    (global.fetch as Mock).mockImplementation((url: string) => {
      if (url.includes("units.json")) {
        return Promise.resolve({
          ok: true,
          json: async () => [badUnit],
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    // Use a spy on console.error to suppress the expected error log during test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(fetchGameData()).rejects.toThrow("Data Validation Failed");

    consoleSpy.mockRestore();
  });
});

describe("fetchJson Error Instrumentation", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should preserve the original error as cause when fetch rejects", async () => {
    const { fetchJson, DataFetchError } = await import("./api-client");
    const networkError = new TypeError("fetch failed");
    (global.fetch as Mock).mockRejectedValue(networkError);

    try {
      await fetchJson("https://example.com/data.json");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(DataFetchError);
      const typedErr = err as InstanceType<typeof DataFetchError>;
      expect(typedErr.message).toBe("fetch failed");
      expect(typedErr.status).toBe(500);
      expect(typedErr.cause).toBe(networkError);
    }
  });

  it("should re-throw DataFetchError without wrapping", async () => {
    const { fetchJson, DataFetchError } = await import("./api-client");
    const original = new DataFetchError("Not Found", 404);
    (global.fetch as Mock).mockImplementation(() => {
      throw original;
    });

    try {
      await fetchJson("https://example.com/missing.json");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBe(original); // same reference, not re-wrapped
    }
  });

  it("should include URL in the DataFetchError message for HTTP errors", async () => {
    const { fetchJson } = await import("./api-client");
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
    });

    await expect(
      fetchJson("https://example.com/api/units.json")
    ).rejects.toThrow(/https:\/\/example\.com\/api\/units\.json.*503/);
  });
});
