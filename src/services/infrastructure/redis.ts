import { Redis } from "@upstash/redis";

import { monitoring } from "@/services/monitoring";

/**
 * Singleton Redis instance using Upstash Serverless Redis.
 * Only initialized if environment variables are present.
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
