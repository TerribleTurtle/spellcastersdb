import { Redis } from "@upstash/redis";

import { monitoring } from "@/services/monitoring";

/**
 * Singleton Redis instance using Upstash Serverless Redis.
 *
 * Only initialized when both `UPSTASH_REDIS_REST_URL` and
 * `UPSTASH_REDIS_REST_TOKEN` are present in the environment.
 * When credentials are absent, `redis` is exported as `null` and
 * a warning is logged via `MonitoringService` — features that depend
 * on Redis (short link sharing, rate limiting) degrade gracefully.
 *
 * @example
 * ```ts
 * import { redis } from "@/services/infrastructure/redis";
 * if (redis) {
 *   await redis.set("key", "value");
 * }
 * ```
 */
export let redis: Redis | null = null;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  try {
    redis = Redis.fromEnv();
  } catch (error) {
    monitoring.captureException(error, {
      message: "Failed to initialize Upstash Redis from environment",
      context: "redis.ts",
    });
  }
} else {
  monitoring.captureMessage(
    "Redis disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not found.",
    "warning"
  );
}
