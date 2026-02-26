import { describe, expect, it } from "vitest";

import { AllDataSchema } from "../data-schemas";

// URL from scripts/test-fetch.mjs
const API_URL =
  "https://terribleturtle.github.io/spellcasters-community-api/api/v2/all_data.json";

describe("Strict Core Schema Validation", () => {
  // TODO(GH#TBD): This test makes a live HTTP request to the V2 API endpoint.
  // It is intentionally skipped until the V2 API deployment is fully complete
  // to avoid CI false negatives, since the live environment still serves V1 data.
  it.skip("should validate live data against strict Zod schemas", async () => {
    // SKIPPED: Live data is V1 (outdated). We are implementing V2 Strict Schema ahead of API deployment.
    const response = await fetch(API_URL);
    if (!response.ok) {
      console.warn("Skipping strict schema test: API unreachable");
      return;
    }

    const rawData = await response.json();

    // Data Normalization (matching logic in mappers.ts)
    // 1. Map heroes -> spellcasters
    if (rawData.heroes && !rawData.spellcasters) {
      rawData.spellcasters = rawData.heroes;
    }

    // 2. Filter units (categories) - although schema might handle this, mappers.ts filters before parse.
    if (Array.isArray(rawData.units)) {
      // Minimal replication of mappers.ts filter
      rawData.units = rawData.units.filter(
        (u: { category: string }) =>
          u.category === "Creature" || u.category === "Building"
      );
    }

    const result = AllDataSchema.safeParse(rawData);

    if (!result.success) {
      console.error(
        "Zod Errors:",
        JSON.stringify(result.error.format(), null, 2)
      );
    }

    expect(result.success).toBe(true);
  });
});
