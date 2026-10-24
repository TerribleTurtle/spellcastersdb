import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { monitoring } from "@/services/monitoring";

import { GET } from "../route";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/services/monitoring", () => ({
  monitoring: {
    captureException: vi.fn(),
  },
}));

describe("GET /api/revalidate", () => {
  const originalEnvSecret = process.env.REVALIDATION_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalEnvSecret !== undefined) {
      process.env.REVALIDATION_SECRET = originalEnvSecret;
    } else {
      delete process.env.REVALIDATION_SECRET;
    }
  });

  describe("Authentication & Security", () => {
    it("returns 401 when process.env.REVALIDATION_SECRET is unset and no token is provided", async () => {
      delete process.env.REVALIDATION_SECRET;

      const req = new NextRequest("https://spellcastersdb.com/api/revalidate");
      const res = await GET(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ message: "Invalid token" });
      expect(revalidateTag).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("returns 401 when process.env.REVALIDATION_SECRET is empty string and no token is provided", async () => {
      process.env.REVALIDATION_SECRET = "";

      const req = new NextRequest("https://spellcastersdb.com/api/revalidate");
      const res = await GET(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ message: "Invalid token" });
      expect(revalidateTag).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("returns 401 when process.env.REVALIDATION_SECRET is unset but empty secret param is passed", async () => {
      delete process.env.REVALIDATION_SECRET;

      const req = new NextRequest(
        "https://spellcastersdb.com/api/revalidate?secret="
      );
      const res = await GET(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ message: "Invalid token" });
    });

    it("returns 401 when process.env.REVALIDATION_SECRET is configured but request has no credentials", async () => {
      process.env.REVALIDATION_SECRET = "super-secret-token";

      const req = new NextRequest("https://spellcastersdb.com/api/revalidate");
      const res = await GET(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ message: "Invalid token" });
    });

    it("returns 401 when tokens mismatch in content or length", async () => {
      process.env.REVALIDATION_SECRET = "super-secret-token";

      // Wrong length
      const reqShort = new NextRequest(
        "https://spellcastersdb.com/api/revalidate",
        {
          headers: { authorization: "Bearer wrong" },
        }
      );
      const resShort = await GET(reqShort);
      expect(resShort.status).toBe(401);

      // Same length, wrong content
      const reqDiff = new NextRequest(
        "https://spellcastersdb.com/api/revalidate",
        {
          headers: { authorization: "Bearer tuper-secret-token" },
        }
      );
      const resDiff = await GET(reqDiff);
      expect(resDiff.status).toBe(401);
    });
  });

  describe("Successful revalidation", () => {
    beforeEach(() => {
      process.env.REVALIDATION_SECRET = "test-revalidation-token";
    });

    it("returns 200 and revalidates tag and path with valid Authorization header", async () => {
      const req = new NextRequest("https://spellcastersdb.com/api/revalidate", {
        headers: { authorization: "Bearer test-revalidation-token" },
      });
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        revalidated: true,
        now: expect.any(Number),
        message: "Game data and sitemap revalidation triggered",
      });
      expect(revalidateTag).toHaveBeenCalledWith("game-data", "max");
      expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
    });

    it("returns 200 with valid query param fallback", async () => {
      const req = new NextRequest(
        "https://spellcastersdb.com/api/revalidate?secret=test-revalidation-token"
      );
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.revalidated).toBe(true);
      expect(revalidateTag).toHaveBeenCalledWith("game-data", "max");
      expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
    });
  });

  describe("Error handling", () => {
    it("returns 500 when revalidation throws an error", async () => {
      process.env.REVALIDATION_SECRET = "test-revalidation-token";
      const error = new Error("Cache error");
      vi.mocked(revalidateTag).mockImplementationOnce(() => {
        throw error;
      });

      const req = new NextRequest("https://spellcastersdb.com/api/revalidate", {
        headers: { authorization: "Bearer test-revalidation-token" },
      });
      const res = await GET(req);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({
        message: "Error revalidating",
        error: "Internal Server Error",
      });
      expect(monitoring.captureException).toHaveBeenCalledWith(error, {
        operation: "revalidation",
      });
    });
  });
});
