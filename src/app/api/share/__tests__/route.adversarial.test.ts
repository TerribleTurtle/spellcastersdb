import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/share/route";
import { ratelimit } from "@/services/infrastructure/ratelimit";
import { redis } from "@/services/infrastructure/redis";

vi.mock("@/services/infrastructure/ratelimit", () => ({
  ratelimit: { limit: vi.fn() },
}));

vi.mock("@/services/infrastructure/redis", () => {
  const mockPipeline = {
    set: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue(["OK", "OK"]),
  };
  return {
    redis: {
      get: vi.fn(),
      set: vi.fn(),
      pipeline: vi.fn(() => mockPipeline),
    },
  };
});

vi.mock("@/services/monitoring", () => ({
  monitoring: { captureException: vi.fn() },
}));

function createRequest(
  body: Record<string, unknown>,
  headers?: Record<string, string>
): Request {
  return new Request("http://localhost:3000/api/share", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/share — Adversarial Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ratelimit!.limit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60_000,
      pending: Promise.resolve(),
    });
    vi.mocked(redis!.get).mockResolvedValue(null);
  });

  it("ADV-SHARE-1: Submits gigabyte-sized hash to break pipeline or redis lookup", async () => {
    // We won't actually send a GB, but a very large string
    const hugeHash = "A".repeat(10_000_000);
    const req = createRequest({ hash: hugeHash, type: "deck" });

    // We expect it to try and process, but realistically there should be body limits in Next.js.
    // However, the api route itself doesn't explicitly bound the hash length.
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.id).toBeDefined();

    const pipeline = redis!.pipeline();
    expect(pipeline.set).toHaveBeenCalledWith(
      `share_hash:deck:${hugeHash}`,
      json.id,
      expect.any(Object)
    );
  });

  it("ADV-SHARE-2: Incomplete/Malformed JSON as body", async () => {
    const req = new Request("http://localhost:3000/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"hash": "abc", "type": ', // Invalid JSON
    });

    const res = await POST(req);
    // Since it tries to JSON.parse the body asynchronously
    // it will throw an error and get caught by the catch block returning 500
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Internal Server Error");
  });

  it("ADV-SHARE-3: pipeline.exec throws a non-Error object", async () => {
    const mockPipeline = redis!.pipeline();
    // Simulate discarding a string instead of an Error object
    (
      mockPipeline.exec as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce("String error?!");

    const req = createRequest({ hash: "normal", type: "deck" });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Internal Server Error");
  });

  it("ADV-SHARE-4: redis.get returns non-string → falls through to create new link", async () => {
    // With the typeof guard, a non-string cached value should be ignored
    vi.mocked(redis!.get).mockResolvedValue({ evil: "object" } as any);

    const req = createRequest({ hash: "normal", type: "deck" });
    const res = await POST(req);
    const json = await res.json();

    // Should NOT return the object as the id — should create a new 7-char id instead
    expect(res.status).toBe(200);
    expect(json.id).toHaveLength(7);
    expect(typeof json.id).toBe("string");
    // Pipeline should have been called to save a new link
    expect(redis!.pipeline).toHaveBeenCalled();
  });
});
