import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/deck-builder',
        destination: '/',
        permanent: true,
      },
      {
        source: '/deck_builder',
        destination: '/',
        permanent: true,
      },
      {
        source: '/spells',
        destination: '/incantations/spells',
        permanent: true,
      },
      {
        source: '/spells/:id',
        destination: '/incantations/spells/:id',
        permanent: true,
      },
      {
        source: '/units',
        destination: '/incantations/units',
        permanent: true,
      },
      {
        source: '/units/:id',
        destination: '/incantations/units/:id',
        permanent: true,
      },
      {
        source: '/heroes',
        destination: '/spellcasters',
        permanent: true,
      },
      {
        source: '/heroes/:id',
        destination: '/spellcasters/:id',
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
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
