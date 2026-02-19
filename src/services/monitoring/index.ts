import {
  ConsoleAdapter,
  MonitoringAdapter,
  MonitoringContext,
} from "./ConsoleAdapter";

class MonitoringService {
  private static instance: MonitoringService;
  private adapter: MonitoringAdapter;

  private constructor() {
    // Default to ConsoleAdapter.
    // In the future, we can swap this based on env vars (e.g. if (process.env.SENTRY_DSN) ...)
    this.adapter = new ConsoleAdapter();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Replace the current adapter (e.g. for testing or initializing Sentry later)
   */
  public setAdapter(adapter: MonitoringAdapter): void {
    this.adapter = adapter;
  }

  public captureException(error: unknown, context?: MonitoringContext): void {
    this.adapter.captureException(error, context);
  }

  public captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
    context?: MonitoringContext
  ): void {
    this.adapter.captureMessage(message, level, context);
  }
}

export const monitoring = MonitoringService.getInstance();
export type { MonitoringContext };
