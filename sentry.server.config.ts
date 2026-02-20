import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send events in production
  enabled: process.env.NODE_ENV === "production",

  // Keep traces extremely low to avoid quota usage
  tracesSampleRate: 0.01,

  // Do not send default PII
  sendDefaultPii: false,

  debug: false,

  beforeSend(event) {
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
