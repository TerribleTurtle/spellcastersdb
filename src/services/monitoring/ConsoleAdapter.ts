export interface MonitoringContext {
  [key: string]: unknown;
}

export interface MonitoringAdapter {
  captureException(error: unknown, context?: MonitoringContext): void;
  captureMessage(
    message: string,
    level?: "info" | "warning" | "error",
    context?: MonitoringContext
  ): void;
}

export class ConsoleAdapter implements MonitoringAdapter {
  captureException(error: unknown, context?: MonitoringContext): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [EXCEPTION]`, error);
    if (context) {
      console.error("  Context:", JSON.stringify(context, null, 2));
    }
  }

  captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
    context?: MonitoringContext
  ): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case "error":
        console.error(`${prefix} ${message}`);
        break;
      case "warning":
        console.warn(`${prefix} ${message}`);
        break;
      case "info":
      default:
        console.info(`${prefix} ${message}`);
        break;
    }

    if (context) {
      const logFn =
        level === "error"
          ? console.error
          : level === "warning"
            ? console.warn
            : console.info;
      logFn("  Context:", JSON.stringify(context, null, 2));
    }
  }
}
