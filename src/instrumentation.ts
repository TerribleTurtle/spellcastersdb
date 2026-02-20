import * as Sentry from "@sentry/nextjs";

import { monitoring } from "@/services/monitoring";

export const onRequestError = Sentry.captureRequestError;

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
    try {
      const { fetchGameData } = await import("@/services/api/api");
      await fetchGameData();
    } catch (error) {
      monitoring.captureException(error, { operation: "instrumentation" });
      // We do NOT rethrow here to allow the server to start even if data is initially bad.
      // The app will attempt to fetch again on first request/ISR.
    }
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}
