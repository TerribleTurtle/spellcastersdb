#!/usr/bin/env tsx
/**
 * Route Generator
 * Usage: npx tsx scripts/new-route.ts <route-name>
 *
 * Examples:
 *   npx tsx scripts/new-route.ts leaderboard
 *   npx tsx scripts/new-route.ts settings/profile
 */
import * as fs from "fs";
import * as path from "path";

// ─── Parse Args ──────────────────────────────────────────────────────────────

const routeName = process.argv[2];

if (!routeName) {
  console.error("❌ Usage: npx tsx scripts/new-route.ts <route-name>");
  console.error("   Example: npx tsx scripts/new-route.ts leaderboard");
  process.exit(1);
}

// Validate lowercase-kebab
if (!/^[a-z][a-z0-9\-\/]*$/.test(routeName)) {
  console.error(`❌ Route name must be lowercase-kebab (got: "${routeName}")`);
  process.exit(1);
}

// ─── Derive ──────────────────────────────────────────────────────────────────

const routeDir = path.resolve(__dirname, "..", "src", "app", routeName);

// For title: "leaderboard" → "Leaderboard", "settings/profile" → "Profile"
const lastSegment = routeName.split("/").pop()!;
const pageTitle =
  lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");

// ─── Guards ──────────────────────────────────────────────────────────────────

if (fs.existsSync(path.join(routeDir, "page.tsx"))) {
  console.error(`❌ Route already exists: ${routeDir}/page.tsx`);
  process.exit(1);
}

// ─── Templates ───────────────────────────────────────────────────────────────

const pageTemplate = `import { PageShell } from "@/components/layout/PageShell";

export default function ${pageTitle.replace(/\s/g, "")}Page() {
  return (
    <PageShell title="${pageTitle}">
      <p className="text-text-secondary">Coming soon.</p>
    </PageShell>
  );
}
`;

const loadingTemplate = `import { ShellSkeleton } from "@/components/skeletons/ShellSkeleton";

export default function Loading() {
  return <ShellSkeleton />;
}
`;

// ─── Write ───────────────────────────────────────────────────────────────────

fs.mkdirSync(routeDir, { recursive: true });

fs.writeFileSync(path.join(routeDir, "page.tsx"), pageTemplate, "utf-8");
fs.writeFileSync(path.join(routeDir, "loading.tsx"), loadingTemplate, "utf-8");

console.log(`✅ Created route:`);
console.log(
  `   ${path.relative(process.cwd(), path.join(routeDir, "page.tsx"))}`
);
console.log(
  `   ${path.relative(process.cwd(), path.join(routeDir, "loading.tsx"))}`
);
console.log(`\n   Visit: http://localhost:3000/${routeName}`);
