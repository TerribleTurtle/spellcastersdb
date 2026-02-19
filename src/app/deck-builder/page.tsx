import { Suspense } from "react";

import { Metadata } from "next";

import { FeatureErrorBoundary } from "@/components/error/FeatureErrorBoundary";
import { DeckBuilderContainer } from "@/features/deck-builder/ui/root/DeckBuilderContainer";
import { fetchCriticalGameData } from "@/services/api/api";
import { getCardImageUrl } from "@/services/assets/asset-helpers";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

import { generateDeckMetadata } from "@/services/metadata/metadata-service";

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  return generateDeckMetadata(searchParams);
}

import { PageSkeleton } from "@/features/deck-builder/ui/root/PageSkeleton";

/**
 * Generate preload URLs for the first N card images to improve LCP.
 * Uses /_next/image endpoint to match actual request paths.
 */
function getPreloadImageUrls(
  items: { entity_id?: string; spellcaster_id?: string; category?: string }[],
  count: number
): string[] {
  return items.slice(0, count).map((item) => {
    const rawUrl = getCardImageUrl(item);
    return `/_next/image?url=${encodeURIComponent(rawUrl)}&w=384&q=45`;
  });
}

import { JsonLd } from "@/components/common/JsonLd";

export default async function DeckBuilderPage() {
  // We fetch CRITICAL data only to pass to the client for instant search & hydration
  // Consumables/Upgrades are skipped for initial load
  const data = await fetchCriticalGameData();

  // Preload first 6 card images for LCP optimization
  const allItems = [...data.units, ...data.spells, ...data.titans];
  const preloadUrls = getPreloadImageUrls(allItems, 6);

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SpellcastersDB Deck Builder",
    "applicationCategory": "GameApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "A deck building tool for Spellcasters Chronicles. Create, save, and share your card strategies."
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden z-40 bg-surface-main shadow-2xl">
      <h1 className="sr-only">Deck Builder &amp; Loadout Editor</h1>
      <JsonLd data={webAppSchema} id="json-ld-deckbuilder" />

      {/* Preload LCP candidate images - discovered at HTML parse time */}
      {preloadUrls.map((url) => (
        <link
          key={url}
          rel="preload"
          as="image"
          href={url}
          fetchPriority="high"
        />
      ))}

      {/* Suspense boundary for data loading */}
      <Suspense fallback={<PageSkeleton />}>
        <FeatureErrorBoundary>
          <DeckBuilderContainer
            units={[...data.units, ...data.spells, ...data.titans]}
            spellcasters={data.spellcasters}
          />
        </FeatureErrorBoundary>
      </Suspense>
    </div>
  );
}
