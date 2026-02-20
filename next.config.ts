import type { NextConfig } from "next";

import createBundleAnalyzer from "@next/bundle-analyzer";
import withSerwistInit from "@serwist/next";
import { spawnSync } from "node:child_process";

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost:3000", "192.168.2.202:3000", "192.168.2.202"],
  async redirects() {
    return [
      /*
      // PREVIOUSLY: Redirected deck-builder to home. 
      // NOW: We want /deck-builder to be the app, and / to be the landing.
      // We also need to catch legacy shared links on /?d=
      */
      {
        source: "/",
        has: [
          {
            type: "query",
            key: "d",
          },
        ],
        destination: "/deck-builder",
        permanent: true,
      },
      {
        source: "/",
        has: [
          {
            type: "query",
            key: "team",
          },
        ],
        destination: "/deck-builder",
        permanent: true,
      },
      {
        source: "/spells",
        destination: "/incantations/spells",
        permanent: true,
      },
      {
        source: "/spells/:id",
        destination: "/incantations/spells/:id",
        permanent: true,
      },
      {
        source: "/units",
        destination: "/incantations/units",
        permanent: true,
      },
      {
        source: "/units/:id",
        destination: "/incantations/units/:id",
        permanent: true,
      },
      {
        source: "/heroes",
        destination: "/spellcasters",
        permanent: true,
      },
      {
        source: "/heroes/:id",
        destination: "/spellcasters/:id",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // Temporary: bust cached 301 from old /deck-builder -> / redirect.
      // Safe to remove after ~2 weeks post-deploy.
      {
        source: "/deck-builder",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/api/og/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=43200",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'none'",
              `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""} https://va.vercel-scripts.com https://tally.so`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https://terribleturtle.github.io https://www.spellcastersdb.com",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "connect-src 'self' https://terribleturtle.github.io https://vitals.vercel-insights.com https://tally.so",
              "frame-src 'self' https://tally.so",
              "worker-src 'self'",
              "manifest-src 'self'",
              process.env.NODE_ENV === "development"
                ? ""
                : "upgrade-insecure-requests",
            ]
              .filter(Boolean)
              .join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    qualities: [45, 75],
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "terribleturtle.github.io",
        pathname: "/spellcasters-community-api/**",
      },
      {
        protocol: "https",
        hostname: "www.spellcastersdb.com",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_PREFERRED_ASSET_FORMAT:
      process.env.NEXT_PUBLIC_PREFERRED_ASSET_FORMAT,
  },
  turbopack: {},
};

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf-8",
  }).stdout?.trim() ?? crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  disable: process.env.NODE_ENV === "development",
});

export default withBundleAnalyzer(withSerwist(nextConfig));
