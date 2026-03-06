/**
 * Static registry of maps that have chest data.
 *
 * Extracted from the page component because Next.js App Router disallows
 * exporting non-standard identifiers (anything besides `default`, `metadata`,
 * `generateStaticParams`, etc.) from page files.
 */
export const KNOWN_MAPS = [
  {
    id: "nordic_shore",
    name: "Nordic Shore",
    description: "Chest spawn locations for the Nordic Shore arena.",
  },
  {
    id: "mausoleum",
    name: "Mausoleum",
    description: "Chest spawn locations for the Mausoleum arena.",
  },
] as const;
