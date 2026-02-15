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
            value: [
              "default-src 'none'",
              `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""} https://va.vercel-scripts.com https://tally.so`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https://terribleturtle.github.io",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "connect-src 'self' https://terribleturtle.github.io https://vitals.vercel-insights.com",
              "frame-src 'self' https://tally.so",
              process.env.NODE_ENV === 'development' ? "" : "upgrade-insecure-requests",
            ].filter(Boolean).join("; "),
          },
        ],
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
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
