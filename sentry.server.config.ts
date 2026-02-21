import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send events in production
  enabled: process.env.NODE_ENV === "production",

  // Keep traces extremely low to avoid quota usage
  tracesSampleRate: 0.01,

  // Do not send default PII
  sendDefaultPii: false,

  ignoreErrors: [
    "ResizeObserver loop",
    "Non-Error promise rejection",
    /Loading chunk \d+ failed/,
    "fetch failed",
    "write ETIMEDOUT",
  ],

  denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i],

  debug: false,

  beforeSend(event) {
    const ua = event.request?.headers?.["user-agent"] || "";
    if (
      /bot|crawl|spider|slurp|facebookexternalhit|Bytespider|GPTBot/i.test(ua)
    ) {
      return null;
    }

    if (event.user) {
      delete event.user.ip_address;
      delete event.user.email;
      delete event.user.username;
      if (Object.keys(event.user).length === 0) {
        delete event.user;
      }
    }

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
