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

  // Do not send default PII
  sendDefaultPii: false,

  debug: false,

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
    "Non-Error promise rejection",
    /Loading chunk \d+ failed/,
  ],

  denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i],

  beforeSend(event) {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    if (
      /bot|crawl|spider|slurp|facebookexternalhit|Bytespider|GPTBot/i.test(ua)
    ) {
      return null;
    }
    // Strip user objects if they accidentally leak
    if (event.user) {
      delete event.user.ip_address;
      delete event.user.email;
      delete event.user.username;
      if (Object.keys(event.user).length === 0) {
        delete event.user;
      }
    }

    // Strip tokens or passwords from extra data
    if (event.extra) {
      for (const key of Object.keys(event.extra)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes("password") ||
          lowerKey.includes("token") ||
          lowerKey.includes("secret")
        ) {
          event.extra[key] = "[Filtered]";
        }
      }
    }

    return event;
  },
});
