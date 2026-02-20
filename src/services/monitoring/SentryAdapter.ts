import * as Sentry from "@sentry/nextjs";

import { MonitoringAdapter, MonitoringContext } from "./ConsoleAdapter";

/**
 * Adapter that routes generic MonitoringService calls natively into Sentry.
 */
export class SentryAdapter implements MonitoringAdapter {
  captureException(error: unknown, context?: MonitoringContext): void {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
    context?: MonitoringContext
  ): void {
    const sentryLevel =
      level === "error" ? "error" : level === "warning" ? "warning" : "info";

    Sentry.captureMessage(message, {
      level: sentryLevel,
      extra: context,
    });
  }
}
