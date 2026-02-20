import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send events in production
  enabled: process.env.NODE_ENV === "production",

  // Keep traces extremely low to avoid quota usage
  tracesSampleRate: 0.01,

  // Disable Replays entirely
  replaysOnErrorSampleRate: 0,
  replaysSessionSampleRate: 0,

  // Allow Sentry to collect standard request basic data so events aren't dropped as invalid
  sendDefaultPii: true,

  debug: true,

  // Filter out noise that isn't actionable
  ignoreErrors: [
    "Hydration failed",
    "There was an error while hydrating",
    "Text content does not match server-rendered HTML",
    "Failed to fetch",
    "NetworkError when attempting to fetch resource",
    "AbortError",
    "The user aborted a request",
    "ResizeObserver loop width and height error",
    "ResizeObserver loop limit exceeded",
  ],
});
