import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("MonitoringService Singleton", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear the singleton module from cache so it re-evaluates process.env
    vi.resetModules();
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should initialize with ConsoleAdapter if SENTRY_DSN is absent", async () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    const { monitoring } = await import("../index");

    // Access private adapter property for testing purposes
    const adapter = (monitoring as any).adapter;
    expect(adapter.constructor.name).toBe("ConsoleAdapter");
  });

  it("should initialize with SentryAdapter if SENTRY_DSN is present", async () => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://public@sentry.example.com/1";

    const { monitoring } = await import("../index");

    const adapter = (monitoring as any).adapter;
    expect(adapter.constructor.name).toBe("SentryAdapter");
  });

  it("should capture exception using the configured adapter", async () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    const { monitoring } = await import("../index");

    const adapter = (monitoring as any).adapter;
    const spy = vi
      .spyOn(adapter, "captureException")
      .mockImplementation(() => {});

    const error = new Error("Test Error");
    monitoring.captureException(error, { tags: { test: "true" } });

    expect(spy).toHaveBeenCalledWith(error, { tags: { test: "true" } });
  });

  it("should allow swapping the adapter manually via setAdapter", async () => {
    const { monitoring } = await import("../index");

    const mockAdapter = {
      captureException: vi.fn(),
      captureMessage: vi.fn(),
    };

    monitoring.setAdapter(mockAdapter);

    monitoring.captureMessage("Test manually swapped", "info");
    expect(mockAdapter.captureMessage).toHaveBeenCalledWith(
      "Test manually swapped",
      "info",
      undefined
    );
  });
});
