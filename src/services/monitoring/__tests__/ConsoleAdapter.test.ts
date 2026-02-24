import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConsoleAdapter } from "../ConsoleAdapter";

describe("ConsoleAdapter", () => {
  let adapter: ConsoleAdapter;

  beforeEach(() => {
    adapter = new ConsoleAdapter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("captureException", () => {
    it("should log the error to console.error", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("Test exception");

      adapter.captureException(error);

      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][1]).toBe(error);
    });

    it("should log context when provided", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("Boom");

      adapter.captureException(error, { module: "test" });

      // First call: error line, second call: context line
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.mock.calls[1][1]).toContain('"module"');
    });

    it("should not log context line when context is omitted", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      adapter.captureException(new Error("No context"));

      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe("captureMessage", () => {
    it("should route 'error' level to console.error", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      adapter.captureMessage("Something failed", "error");

      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toContain("[ERROR]");
      expect(spy.mock.calls[0][0]).toContain("Something failed");
    });

    it("should route 'warning' level to console.warn", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

      adapter.captureMessage("Watch out", "warning");

      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toContain("[WARNING]");
    });

    it("should route 'info' level to console.info", () => {
      const spy = vi.spyOn(console, "info").mockImplementation(() => {});

      adapter.captureMessage("FYI", "info");

      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toContain("[INFO]");
    });

    it("should default to 'info' level when level is omitted", () => {
      const spy = vi.spyOn(console, "info").mockImplementation(() => {});

      adapter.captureMessage("Default info");

      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toContain("[INFO]");
    });

    it("should log context with the correct console method for errors", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      adapter.captureMessage("Error with context", "error", {
        source: "test",
      });

      // Message + context = 2 calls
      expect(errorSpy).toHaveBeenCalledTimes(2);
      expect(errorSpy.mock.calls[1][1]).toContain('"source"');
    });

    it("should log context with the correct console method for warnings", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      adapter.captureMessage("Warn with context", "warning", {
        source: "test",
      });

      expect(warnSpy).toHaveBeenCalledTimes(2);
    });
  });
});
