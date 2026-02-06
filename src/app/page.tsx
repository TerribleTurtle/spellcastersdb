import { Suspense } from 'react';
import { fetchGameData } from '@/lib/api';
import { DeckBuilderApp } from '@/components/deck-builder/DeckBuilderApp';

export const metadata = {
  title: 'The Forge - Deck Builder, Card Builds & Loadouts',
  description: 'Create, optimize, and share your Spellcasters Chronicles decks. The ultimate card strategy tool for custom builds and loadouts.',
  keywords: ["Spellcasters Chronicles", "Deck Builder", "Card Decks", "Builds", "Loadouts", "Strategy", "MOBA", "Card Game"],
  openGraph: {
    title: 'The Forge - Deck Builder, Card Builds & Loadouts',
    description: 'Create, optimize, and share your Spellcasters Chronicles decks. The ultimate card strategy tool for custom builds and loadouts.',
    type: 'website',
    // images: ['/og-forge.png'], // TODO: Add specific OG image
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Forge - Deck Builder, Card Builds & Loadouts',
    description: 'Create, optimize, and share your Spellcasters Chronicles decks. The ultimate card strategy tool for custom builds and loadouts.',
  }
};

export default async function Home() {
  // We fetch ALL data to pass to the client for instant search & hydration
  const data = await fetchGameData();

  return (
    <div className="fixed inset-0 top-16 bg-surface-main overflow-hidden z-40">
        {/* TODO: Replace with proper Skeleton logic if desired, but Suspense needs to be high up */}
        <Suspense fallback={<div className="flex h-full items-center justify-center text-brand-primary animate-pulse">Loading The Forge...</div>}>
            <DeckBuilderApp 
                units={data.units} 
                spellcasters={data.heroes} 
            />
        </Suspense>
    </div>
  );
}
