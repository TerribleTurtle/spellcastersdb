import { Metadata } from "next";
import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/common/JsonLd";

import { getSpellcasterById, getSpellcasters } from "@/lib/api";

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

  // Fallback description since spellcasters don't have a specific description field
  const description = `${spellcaster.name} - ${spellcaster.abilities.primary.name} user. Difficulty: ${spellcaster.difficulty || 1}/3.`;

  return {
    title: spellcaster.name,
    description: description,
    openGraph: {
      title: spellcaster.name,
      description: description,
    },
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
    "thumbnailUrl": `https://spellcastersdb.com/api/og?id=${spellcaster.spellcaster_id}`,
  };

  return (
    <>
      <JsonLd data={jsonLdData} id={`json-ld-spellcaster-${spellcaster.spellcaster_id}`} />
      <EntityShowcase 
        item={spellcaster} 
        backUrl="/spellcasters"
        backLabel="Back to Spellcasters"
      />
    </>
  );
}
