import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send events in production
  enabled: process.env.NODE_ENV === "production",

  // Keep traces extremely low to avoid quota usage
  tracesSampleRate: 0.01,

  // Allow Sentry to collect standard request basic data
  sendDefaultPii: true,

  debug: false,
});
