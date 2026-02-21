import { Ratelimit } from "@upstash/ratelimit";

import { monitoring } from "@/services/monitoring";

import { redis } from "./redis";

/**
 * Rate Limiter instance using Upstash Redis.
 * Only initialized if environment variables are present.
 */
export let ratelimit: Ratelimit | null = null;

if (redis) {
  ratelimit = new Ratelimit({
    redis,
    // Allow 10 requests per 10 seconds window (sliding)
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });
} else {
  monitoring.captureMessage(
    "Rate limiting disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not found.",
    "warning"
  );
}
