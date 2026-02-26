import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": '"test"',
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    server: {
      deps: {
        inline: ["react", "react-dom", "@testing-library/react"],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      reportsDirectory: "./coverage",
      thresholds: {
        lines: 42.09,
        functions: 36.84,
        branches: 42.1,
        autoUpdate: false,
      },
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        // Already excluded
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/**/types.ts",

        // Next.js app shell (layouts, loading, error, not-found)
        "src/app/layout.tsx",
        "src/app/**/layout.tsx",
        "src/app/**/loading.tsx",
        "src/app/error.tsx",
        "src/app/global-error.tsx",
        "src/app/not-found.tsx",

        // Next.js generated / config
        "src/app/registry.tsx",
        "src/app/manifest.ts",
        "src/app/robots.ts",
        "src/app/sitemap.ts",
        "src/app/sw.ts",

        // Sentry / instrumentation
        "src/instrumentation.ts",
        "src/instrumentation-client.ts",

        // Static data / assets
        "src/data/**",
        "src/assets/**",

        // Type-only barrel files
        "src/types/**",

        // Test utilities / fixtures
        "src/tests/**",
        "src/__tests__/**",

        // UI Primitives (Shadcn)
        "src/components/ui/**",

        // Top-level Next.js pages (covered by E2E)
        "src/app/**/page.tsx",

        // Next.js API Routes (better tested via E2E)
        "src/app/api/**/route.ts",
        "src/app/api/**/route.tsx",

        // Pure configuration and constant data files
        "src/lib/config.ts",
        "src/**/constants.ts",
        "src/**/*-constants.ts",
        "src/**/*-config.ts",
        "src/app/robots.ts",
        "src/app/sitemap.ts",
        "src/app/manifest.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
