import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import sharp from "sharp";

const PUBLIC_DIR = join(process.cwd(), "public");
const ICONS_DIR = join(PUBLIC_DIR, "icons");
const SOURCE_SVG = join(PUBLIC_DIR, "logo.svg");

async function generateIcons() {
  if (!existsSync(ICONS_DIR)) {
    mkdirSync(ICONS_DIR, { recursive: true });
  }

  if (!existsSync(SOURCE_SVG)) {
    console.error(`Source format for PWA icons not found at ${SOURCE_SVG}`);
    process.exit(1);
  }

  console.log("Generating 192x192 icon...");
  await sharp(SOURCE_SVG)
    .resize(192, 192)
    .png()
    .toFile(join(ICONS_DIR, "icon-192.png"));

  console.log("Generating 512x512 icon...");
  await sharp(SOURCE_SVG)
    .resize(512, 512)
    .png()
    .toFile(join(ICONS_DIR, "icon-512.png"));

  console.log("Successfully generated PWA icons.");
}

generateIcons().catch(console.error);
