import { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchGameData } from '@/lib/api';
import { DeckBuilderApp } from '@/components/deck-builder/DeckBuilderApp';

export const metadata: Metadata = {
  title: 'The Forge - Deck Builder',
  description: 'Build and optimize your Spellcasters Chronicles decks.',
};

export default async function DeckBuilderPage() {
  // We fetch ALL data to pass to the client for instant search & hydration
  const data = await fetchGameData();

  return (
    <div className="fixed inset-0 top-16 bg-surface-main overflow-hidden">
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
