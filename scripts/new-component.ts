#!/usr/bin/env tsx
/**
 * Component Generator
 * Usage: npx tsx scripts/new-component.ts <ComponentName> [--dir=<subdirectory>]
 *
 * Examples:
 *   npx tsx scripts/new-component.ts StatBlock
 *   npx tsx scripts/new-component.ts StatBlock --dir=database
 */
import * as fs from "fs";
import * as path from "path";

// ─── Parse Args ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith("--"));
const positional = args.filter((a) => !a.startsWith("--"));

const componentName = positional[0];
const dirFlag = flags.find((f) => f.startsWith("--dir="));
const subDir = dirFlag ? dirFlag.split("=")[1] : "ui";

if (!componentName) {
  console.error(
    "❌ Usage: npx tsx scripts/new-component.ts <ComponentName> [--dir=<subdirectory>]"
  );
  console.error(
    "   Example: npx tsx scripts/new-component.ts StatBlock --dir=database"
  );
  process.exit(1);
}

// Validate PascalCase
if (!/^[A-Z][a-zA-Z0-9]+$/.test(componentName)) {
  console.error(
    `❌ Component name must be PascalCase (got: "${componentName}")`
  );
  process.exit(1);
}

// ─── Paths ───────────────────────────────────────────────────────────────────

const baseDir = path.resolve(__dirname, "..", "src", "components", subDir);
const testDir = path.join(baseDir, "__tests__");

const componentFile = path.join(baseDir, `${componentName}.tsx`);
const testFile = path.join(testDir, `${componentName}.test.tsx`);

// ─── Guards ──────────────────────────────────────────────────────────────────

if (fs.existsSync(componentFile)) {
  console.error(`❌ Component already exists: ${componentFile}`);
  process.exit(1);
}

// ─── Templates ───────────────────────────────────────────────────────────────

const componentTemplate = `import { cn } from "@/lib/utils";

interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

export function ${componentName}({ className, children }: ${componentName}Props) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}
`;

const testTemplate = `import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ${componentName} } from "@/components/${subDir}/${componentName}";

describe("${componentName}", () => {
  it("renders without crashing", () => {
    render(<${componentName}>Test</${componentName}>);
    expect(screen.getByText("Test")).toBeTruthy();
  });
});
`;

// ─── Write ───────────────────────────────────────────────────────────────────

fs.mkdirSync(baseDir, { recursive: true });
fs.mkdirSync(testDir, { recursive: true });

fs.writeFileSync(componentFile, componentTemplate, "utf-8");
fs.writeFileSync(testFile, testTemplate, "utf-8");

console.log(`✅ Created component:`);
console.log(`   ${path.relative(process.cwd(), componentFile)}`);
console.log(`   ${path.relative(process.cwd(), testFile)}`);
console.log(`\n   Run: npm test -- --filter ${componentName}`);
