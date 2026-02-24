import * as Sentry from "@sentry/nextjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MonitoringContext } from "./ConsoleAdapter";
import { SentryAdapter } from "./SentryAdapter";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe("SentryAdapter", () => {
  let adapter: SentryAdapter;

  beforeEach(() => {
    adapter = new SentryAdapter();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("captureException", () => {
    it("should call Sentry.captureException with error and context", () => {
      const error = new Error("Test error");
      const context: MonitoringContext = {
        user: "test_user",
        operation: "test_op",
      };

      adapter.captureException(error, context);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: context,
      });
    });

    it("should call Sentry.captureException without context if not provided", () => {
      const error = new Error("Test error without context");

      adapter.captureException(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: undefined,
      });
    });
  });

  describe("captureMessage", () => {
    it("should call Sentry.captureMessage with default info level", () => {
      adapter.captureMessage("Test message");

      expect(Sentry.captureMessage).toHaveBeenCalledWith("Test message", {
        level: "info",
        extra: undefined,
      });
    });

    it("should map custom levels correctly (warning)", () => {
      const context: MonitoringContext = { context: "warning_context" };
      adapter.captureMessage("Warning message", "warning", context);

      expect(Sentry.captureMessage).toHaveBeenCalledWith("Warning message", {
        level: "warning",
        extra: context,
      });
    });

    it("should map custom levels correctly (error)", () => {
      adapter.captureMessage("Error message", "error");

      expect(Sentry.captureMessage).toHaveBeenCalledWith("Error message", {
        level: "error",
        extra: undefined,
      });
    });

    it("should fallback to info if an invalid level is somehow passed (TypeScript cast)", () => {
      // @ts-expect-error - explicitly testing invalid input
      adapter.captureMessage("Invalid level message", "critical");

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        "Invalid level message",
        {
          level: "info",
          extra: undefined,
        }
      );
    });
  });
});
