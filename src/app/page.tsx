import { Suspense } from "react";

import { Metadata } from "next";

import { FeatureErrorBoundary } from "@/components/error/FeatureErrorBoundary";
import { DeckBuilderContainer } from "@/features/deck-builder/ui/root/DeckBuilderContainer";
import { fetchCriticalGameData } from "@/services/api/api";

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

export default async function Home() {
  // We fetch CRITICAL data only to pass to the client for instant search & hydration
  // Consumables/Upgrades are skipped for initial load
  const data = await fetchCriticalGameData();

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden z-40 bg-surface-main shadow-2xl">
      <h1 className="sr-only">Deck Builder & Loadout Editor</h1>
      {/* Suspense boundary for data loading */}
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-brand-primary animate-pulse">
            Loading Deck Builder...
          </div>
        }
      >
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
