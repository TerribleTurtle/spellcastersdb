import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

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
  ],

  beforeSend(event) {
    // Strip user objects if they accidentally leak
    if (event.user) {
      delete event.user.ip_address;
      delete event.user.email;
      delete event.user.username;

      // If user object is empty after deleting, remove it
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

    // Strip URL parameters that might be sensitive (if applicable)
    if (event.request && event.request.url) {
      try {
        const url = new URL(event.request.url);
        if (url.search) {
          event.request.url = url.origin + url.pathname + "?filtered=true";
        }
      } catch (e) {
        // ignore invalid urls
      }
    }

    return event;
  },
});
