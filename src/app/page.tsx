import { Suspense } from "react";

import { Metadata } from "next";

import { DeckBuilderApp } from "@/components/deck-builder/DeckBuilderApp";
import { fetchGameData } from "@/lib/api";
import { decodeDeck } from "@/lib/encoding";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  // Check for deck hash
  const resolvedParams = await searchParams;
  const deckHash = resolvedParams?.d;

  if (typeof deckHash === "string" && deckHash) {
    const decoded = decodeDeck(deckHash);
    let deckName = decoded?.name;

    // If no name in the hash, resolve it from the Spellcaster ID
    let spellcasterName = "";

    // Always try to get spellcaster name for better metadata
    if (decoded?.spellcasterId) {
      try {
        const data = await fetchGameData();
        const spellcaster = data.spellcasters.find(
          (h) => h.spellcaster_id === decoded.spellcasterId
        );
        if (spellcaster) {
          spellcasterName = spellcaster.name;
          if (!deckName) {
            deckName = `${spellcaster.name} Deck`;
          }
        }
      } catch (e) {
        console.error("Failed to fetch game data for metadata", e);
      }
    }

    // Fallback if still empty
    if (!deckName) deckName = "Custom Deck";

    const description = spellcasterName
      ? `Check out this ${spellcasterName} build for Spellcasters Chronicles.`
      : `Check out this ${deckName} build for Spellcasters Chronicles.`;

    return {
      title: `${deckName} - SpellcastersDB`,
      description: description,
      openGraph: {
        title: `${deckName} - SpellcastersDB`,
        description: description,
        type: "website",
        images: [`/api/og?d=${deckHash}`],
      },
      twitter: {
        card: "summary_large_image",
        title: `${deckName} - SpellcastersDB`,
        description: description,
        images: [`/api/og?d=${deckHash}`],
      },
    };
  }

  // Check for team hash
  const teamHash = resolvedParams?.team;
  if (typeof teamHash === "string" && teamHash) {
    // Decode team to get name
    // We need to import decodeTeam dynamically or add it to imports
    // Since this is a server component/function, we can just import it at top or require it.
    // But let's assume we added the import at the top.
    const { decodeTeam } = await import("@/lib/encoding");
    const { name } = decodeTeam(teamHash);

    const teamName = name || "Team Trinity";
    const description = `Check out this team build for Spellcasters Chronicles.`;

    return {
      title: `${teamName} - SpellcastersDB`,
      description: description,
      openGraph: {
        title: `${teamName} - SpellcastersDB`,
        description: description,
        type: "website",
        images: [`/api/og?team=${teamHash}`], // No tname needed anymore!
      },
      twitter: {
        card: "summary_large_image",
        title: `${teamName} - SpellcastersDB`,
        description: description,
        images: [`/api/og?team=${teamHash}`],
      },
    };
  }

  return {
    title: "The Forge - Deck Builder, Card Builds & Loadouts",
    description:
      "Create, optimize, and share your Spellcasters Chronicles decks. The ultimate card strategy tool for custom builds and loadouts.",
    keywords: [
      "Spellcasters Chronicles",
      "Deck Builder",
      "Card Decks",
      "Builds",
      "Loadouts",
      "Strategy",
      "MOBA",
      "Card Game",
    ],
    openGraph: {
      title: "The Forge - Deck Builder, Card Builds & Loadouts",
      description:
        "Create, optimize, and share your Spellcasters Chronicles decks. The ultimate card strategy tool for custom builds and loadouts.",
      type: "website",
      images: ["/og-forge.png"], // Static fallback (mapped in next steps if needed, or default)
    },
    twitter: {
      card: "summary_large_image",
      title: "The Forge - Deck Builder, Card Builds & Loadouts",
      description:
        "Create, optimize, and share your Spellcasters Chronicles decks. The ultimate card strategy tool for custom builds and loadouts.",
    },
  };
}

export default async function Home() {
  // We fetch ALL data to pass to the client for instant search & hydration
  const data = await fetchGameData();

  return (
    <div className="h-[calc(100dvh-64px)] w-full overflow-hidden z-40 bg-surface-main border-x border-white/5 shadow-2xl overscroll-none">
      {/* Suspense boundary for data loading */}
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-brand-primary animate-pulse">
            Loading The Forge...
          </div>
        }
      >
        <DeckBuilderApp
          units={[...data.units, ...data.spells, ...data.titans]}
          spellcasters={data.spellcasters}
        />
      </Suspense>
    </div>
  );
}
