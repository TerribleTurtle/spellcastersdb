import { Metadata } from "next";
import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/common/JsonLd";

import { getSpellcasterById, getSpellcasters } from "@/services/api/api";
import { fetchChangelog, fetchEntityTimeline } from "@/services/api/patch-history";

interface SpellcasterPageProps {
  params: Promise<{ id: string }>;
}

// 1. Generate Static Params (SSG)
export async function generateStaticParams() {
  const spellcasters = await getSpellcasters();
  return spellcasters.map((s) => ({
    id: s.spellcaster_id,
  }));
}

// 2. Generate Dynamic Metadata (SEO)
export async function generateMetadata({
  params,
}: SpellcasterPageProps): Promise<Metadata> {
  const { id } = await params;
  const spellcaster = await getSpellcasterById(id);

  if (!spellcaster) {
    return { title: "Spellcaster Not Found" };
  }

  const description = `Complete stats, ability breakdown, and deck building guide for ${spellcaster.name} in Spellcasters Chronicles. Master the ${spellcaster.abilities.primary.name} and dominate the arena.`;

  return {
    title: `${spellcaster.name} Builds, Decks & Stats | SpellcastersDB`,
    description: description,
    openGraph: {
      title: `${spellcaster.name} Builds, Decks & Stats`,
      description: description,
    },
    keywords: [
      spellcaster.name,
      `${spellcaster.name} build`,
      `${spellcaster.name} deck`,
      `${spellcaster.name} guide`,
      "Spellcasters Chronicles",
      "Spellcaster Stats",
    ],
  };
}

// 3. The UI Component
export default async function SpellcasterPage({
  params,
}: SpellcasterPageProps) {
  const { id } = await params;
  const spellcaster = await getSpellcasterById(id);

  if (!spellcaster) {
    notFound();
  }

  // Fetch patch history data in parallel
  const [changelog, timeline] = await Promise.all([
    fetchChangelog(),
    fetchEntityTimeline(id),
  ]);
  const entityChangelog = changelog.filter((e) => e.entity_id === id);

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "name": spellcaster.name,
    "description": `${spellcaster.name} is a ${spellcaster.class} class spellcaster in Spellcasters Chronicles. Abilities include ${spellcaster.abilities.primary.name} and ${spellcaster.abilities.ultimate.name}.`,
    "genre": "Strategic Card Game",
    "character": {
      "@type": "GameCharacter",
      "name": spellcaster.name,
      "playabilityMode": "SinglePlayer",
      "description": spellcaster.abilities.primary.description,
    },
    "thumbnailUrl": `https://spellcastersdb.com/api/og?spellcasterId=${spellcaster.spellcaster_id}`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://spellcastersdb.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Spellcasters",
          "item": "https://spellcastersdb.com/spellcasters"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": spellcaster.name
        }
      ]
    }
  };

  return (
    <>
      <JsonLd data={jsonLdData} id={`json-ld-spellcaster-${spellcaster.spellcaster_id}`} />
      <EntityShowcase 
        item={spellcaster} 
        backUrl="/spellcasters"
        backLabel="Back to Spellcasters"
        changelog={entityChangelog}
        timeline={timeline}
      />
    </>
  );
}
