import * as fs from "fs";
import * as path from "path";
import { describe, expect, it } from "vitest";

// Ensure we find the src/app directory reliably regardless of execution context
const srcDir = path.resolve(__dirname, "..");
const appDir = path.join(srcDir, "app");

function findPageFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findPageFiles(fullPath, fileList);
    } else if (file === "page.tsx") {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const pageFiles = findPageFiles(appDir);

// Allowlist for pages that intentionally don't need metadata
// (e.g., offline fallback, internal admin loops)
const ALLOWLIST_NO_METADATA = ["~offline", "design-system", "admin", "private"];

const ALLOWLIST_NO_INDEX = ["~offline", "design-system", "admin", "private"];

describe("SEO Drift Guards", () => {
  describe("Metadata verification", () => {
    it.each(pageFiles)("should export metadata in %s", (filePath) => {
      // Check if file is in allowlist
      const relativePath = path.relative(appDir, filePath);
      const isAllowed = ALLOWLIST_NO_METADATA.some((allowedDir) =>
        relativePath.includes(allowedDir)
      );

      if (isAllowed) {
        return; // Skip allowed files
      }

      const content = fs.readFileSync(filePath, "utf-8");

      const exportsStaticMetadata = content.includes("export const metadata");
      const exportsDynamicMetadata =
        content.includes("export async function generateMetadata") ||
        content.includes("export function generateMetadata");

      expect(
        exportsStaticMetadata || exportsDynamicMetadata,
        `File ${relativePath} is missing a metadata export. Every indexable page must export 'metadata' or 'generateMetadata'.`
      ).toBe(true);
    });
  });

  describe("Sitemap verification", () => {
    it("should include all major static routes in the sitemap array", () => {
      const sitemapPath = path.join(appDir, "sitemap.ts");
      const sitemapContent = fs.readFileSync(sitemapPath, "utf-8");

      const requiredStaticRoutes = [
        "/",
        "/deck-builder",
        "/incantations/units",
        "/incantations/spells",
        "/titans",
        "/consumables",
        "/guide",
        "/guide/basics",
        "/guide/mechanics",
        "/guide/upgrades",
        "/guide/ranked",
        "/guide/infusions",
        "/spellcasters",
        "/database",
        "/roadmap",
        "/discord-bot",
        "/privacy",
        "/terms",
      ];

      for (const route of requiredStaticRoutes) {
        const isPresent =
          // matches `url: \`\${baseUrl}${route}\`` or `url: baseUrl` for root
          route === "/"
            ? sitemapContent.includes(`url: baseUrl,`) ||
              sitemapContent.includes(`url: \`\${baseUrl}/\``)
            : sitemapContent.includes(`\${baseUrl}${route}\``);

        expect(
          isPresent,
          `Route ${route} is missing from the static routes array in sitemap.ts.`
        ).toBe(true);
      }
    });
  });

  describe("Noindex Guard", () => {
    it.each(pageFiles)(
      "should not have accidental noindex tags in %s",
      (filePath) => {
        const relativePath = path.relative(appDir, filePath);
        const isAllowed = ALLOWLIST_NO_INDEX.some((allowedDir) =>
          relativePath.includes(allowedDir)
        );

        if (isAllowed) {
          return; // Skip allowed files
        }

        const content = fs.readFileSync(filePath, "utf-8");

        // Look for `<meta name="robots" content="noindex"` or nextjs metadata equivalent
        const hasHtmlNoIndex = content.toLowerCase().includes("noindex");

        expect(
          !hasHtmlNoIndex,
          `File ${relativePath} contains 'noindex'. If this is intentional, add it to the ALLOWLIST_NO_INDEX array in seo-guards.test.ts.`
        ).toBe(true);
      }
    );
  });

  describe("Homepage Title Keyword check", () => {
    it("homepage should contain the core brand keyword 'Spellcasters Chronicles'", () => {
      const pagePath = path.join(appDir, "page.tsx");
      const pageContent = fs.readFileSync(pagePath, "utf-8");

      // Extract the title text
      const titleMatch = pageContent.match(/title:\s*"(.*?)"/);
      expect(titleMatch).toBeTruthy();

      if (titleMatch) {
        const titleContent = titleMatch[1];
        expect(
          titleContent.includes("Spellcasters Chronicles"),
          `Homepage metadata title ("${titleContent}") is missing the core brand keyword "Spellcasters Chronicles".`
        ).toBe(true);
      }
    });
  });
});
