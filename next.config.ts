import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost:3000", "192.168.2.202:3000", "192.168.2.202"],
  async redirects() {
    return [
      {
        source: "/deck-builder",
        destination: "/",
        permanent: true,
      },
      {
        source: "/deck_builder",
        destination: "/",
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
            // CSP Note: 'unsafe-eval' and 'unsafe-inline' are currently required for Next.js dev mode and hydration.
            // TODO: Implement Nonce-based CSP for stricter production security.
            value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://tally.so; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://terribleturtle.github.io; font-src 'self'; connect-src 'self' https://terribleturtle.github.io https://vitals.vercel-insights.com; ${process.env.NODE_ENV === 'development' ? '' : 'upgrade-insecure-requests;'}`,
          },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'terribleturtle.github.io',
        pathname: '/spellcasters-community-api/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_PREFERRED_ASSET_FORMAT: process.env.NEXT_PUBLIC_PREFERRED_ASSET_FORMAT,
  },
};

export default nextConfig;
