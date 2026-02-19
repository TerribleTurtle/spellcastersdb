import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { monitoring } from "@/services/monitoring";

/**
 * Rate Limiter instance using Upstash Redis.
 * Only initialized if environment variables are present.
 */
export let ratelimit: Ratelimit | null = null;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
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
