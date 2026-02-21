import crypto from "crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

import { anonymizeIp } from "../anonymize-ip";

describe("anonymizeIp", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should return a 64-character hex string", () => {
    const result = anonymizeIp("192.168.1.1", "test-salt");
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should never return the raw IP address", () => {
    const ip = "203.0.113.42";
    const result = anonymizeIp(ip, "test-salt");
    expect(result).not.toContain(ip);
    expect(result).not.toContain("203");
  });

  it("should produce consistent hashes for the same IP + salt", () => {
    const a = anonymizeIp("10.0.0.1", "salt-a");
    const b = anonymizeIp("10.0.0.1", "salt-a");
    expect(a).toBe(b);
  });

  it("should produce different hashes for different IPs", () => {
    const a = anonymizeIp("10.0.0.1", "same-salt");
    const b = anonymizeIp("10.0.0.2", "same-salt");
    expect(a).not.toBe(b);
  });

  it("should produce different hashes for different salts", () => {
    const a = anonymizeIp("10.0.0.1", "salt-1");
    const b = anonymizeIp("10.0.0.1", "salt-2");
    expect(a).not.toBe(b);
  });

  it("should match a known SHA-256 output for verification", () => {
    const ip = "127.0.0.1";
    const salt = "test-secret";
    const expected = crypto
      .createHash("sha256")
      .update(ip + salt)
      .digest("hex");

    expect(anonymizeIp(ip, salt)).toBe(expected);
  });

  it("should use REVALIDATION_SECRET env var as default salt", () => {
    vi.stubEnv("REVALIDATION_SECRET", "env-secret");

    const withEnv = anonymizeIp("10.0.0.1");
    const withExplicit = anonymizeIp("10.0.0.1", "env-secret");
    expect(withEnv).toBe(withExplicit);
  });

  it("should fall back to 'default-salt' when env var is missing", () => {
    vi.stubEnv("REVALIDATION_SECRET", "");

    const withDefault = anonymizeIp("10.0.0.1");
    const withExplicit = anonymizeIp("10.0.0.1", "default-salt");
    expect(withDefault).toBe(withExplicit);
  });

  it("should handle IPv6 addresses", () => {
    const result = anonymizeIp("2001:db8::1", "test-salt");
    expect(result).toMatch(/^[a-f0-9]{64}$/);
    expect(result).not.toContain("2001");
  });

  it("should handle x-forwarded-for chains (comma-separated)", () => {
    // The route passes the raw header value; we verify the hash works with it
    const chain = "203.0.113.42, 70.41.3.18, 150.172.238.178";
    const result = anonymizeIp(chain, "test-salt");
    expect(result).toMatch(/^[a-f0-9]{64}$/);
    expect(result).not.toContain("203.0.113.42");
  });
});
