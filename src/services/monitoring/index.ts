import {
  ConsoleAdapter,
  MonitoringAdapter,
  MonitoringContext,
} from "./ConsoleAdapter";
import { SentryAdapter } from "./SentryAdapter";

class MonitoringService {
  private static instance: MonitoringService;
  private adapter: MonitoringAdapter;

  private constructor() {
    // If Sentry is configured, route all logs there instead of Console
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      this.adapter = new SentryAdapter();
    } else {
      this.adapter = new ConsoleAdapter();
    }
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
