import { Suspense } from 'react';
import { fetchGameData } from '@/lib/api';
import { DeckBuilderApp } from '@/components/deck-builder/DeckBuilderApp';

import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  // Check for deck hash
  const resolvedParams = await searchParams;
  const deckHash = resolvedParams?.d;
  
  if (typeof deckHash === 'string' && deckHash) {
    return {
      title: 'Custom Deck Build - The Forge',
      description: 'Check out this custom deck build for Spellcasters Chronicles. Create, optimize, and share your own loadouts.',
      openGraph: {
        title: 'Custom Deck Build - The Forge',
        description: 'Check out this custom deck build for Spellcasters Chronicles.',
        type: 'website',
        images: [`/api/og?d=${deckHash}`],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Custom Deck Build - The Forge',
        description: 'Check out this custom deck build for Spellcasters Chronicles.',
        images: [`/api/og?d=${deckHash}`],
      }
    };
  }

  return {
    title: 'The Forge - Deck Builder, Card Builds & Loadouts',
    description: 'Create, optimize, and share your Spellcasters Chronicles decks. The ultimate card strategy tool for custom builds and loadouts.',
    keywords: ["Spellcasters Chronicles", "Deck Builder", "Card Decks", "Builds", "Loadouts", "Strategy", "MOBA", "Card Game"],
    openGraph: {
      title: 'The Forge - Deck Builder, Card Builds & Loadouts',
      description: 'Create, optimize, and share your Spellcasters Chronicles decks. The ultimate card strategy tool for custom builds and loadouts.',
      type: 'website',
      images: ['/og-forge.png'], // Static fallback (mapped in next steps if needed, or default)
    },
    twitter: {
      card: 'summary_large_image',
      title: 'The Forge - Deck Builder, Card Builds & Loadouts',
      description: 'Create, optimize, and share your Spellcasters Chronicles decks. The ultimate card strategy tool for custom builds and loadouts.',
    }
  };
}

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
