import crypto from "crypto";

/**
 * Anonymizes an IP address using a one-way SHA-256 hash with a secret salt.
 *
 * This ensures the rate limiter can distinguish unique clients without
 * ever storing or transmitting the actual IP address (PII under GDPR).
 *
 * @param ip - The raw IP address to anonymize.
 * @param salt - A secret salt (defaults to REVALIDATION_SECRET env var).
 * @returns A 64-character hex string that cannot be reversed to the original IP.
 */
export function anonymizeIp(
  ip: string,
  salt: string = process.env.REVALIDATION_SECRET || "default-salt"
): string {
  return crypto
    .createHash("sha256")
    .update(ip + salt)
    .digest("hex");
}
