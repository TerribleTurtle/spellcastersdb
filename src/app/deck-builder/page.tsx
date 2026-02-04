import { Suspense } from 'react';
import { Metadata } from 'next';
import { fetchGameData } from '@/lib/api';
import { DeckBuilderApp } from '@/components/deck-builder/DeckBuilderApp';

export const metadata: Metadata = {
  title: 'The Forge - Deck Builder',
  description: 'Build and optimize your Spellcasters Chronicles decks.',
};

export default async function DeckBuilderPage() {
  const data = await fetchGameData();

  return (
    <div className="min-h-screen pt-16 bg-surface-main">
        <Suspense fallback={<div className="flex h-[80vh] items-center justify-center text-brand-primary">Loading The Forge...</div>}>
            <DeckBuilderApp 
                units={data.units} 
                spellcasters={data.heroes} 
            />
        </Suspense>
    </div>
  );
}
