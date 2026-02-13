import { Metadata } from "next";

import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/common/JsonLd";

import { getEntityById, getSpells } from "@/services/data/api";
import { Spell } from "@/types/api";

interface SpellPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const spells = await getSpells();
  return spells.map((spell) => ({
    id: spell.entity_id,
  }));
}

export async function generateMetadata({
  params,
}: SpellPageProps): Promise<Metadata> {
  const { id } = await params;
  const entity = await getEntityById(id);
  const spell = entity as Spell;

  if (!spell || spell.category !== "Spell") {
    return { title: "Spell Not Found" };
  }

  return {
    title: spell.name,
    description: spell.description,
    openGraph: {
      title: spell.name,
      description: spell.description,
    },
  };
}

export default async function SpellPage({ params }: SpellPageProps) {
  const { id } = await params;
  const entity = await getEntityById(id);
  const spell = entity as Spell;

  if (!spell || spell.category !== "Spell") {
    notFound();
  }

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "name": spell.name,
    "description": spell.description,
    "genre": "Strategic Card Game",
    "isFamilyFriendly": true,
    "keywords": spell.tags.join(", "),
    "thumbnailUrl": `https://spellcastersdb.com/api/og/spell?id=${spell.entity_id}`,
    "mainEntity": {
      "@type": "Thing",
      "name": spell.name,
      "description": spell.description,
      "category": "Spell",
    }
  };

  return (
    <>
      <JsonLd data={jsonLdData as Record<string, unknown>} id={`json-ld-spell-${spell.entity_id}`} />
      <EntityShowcase 
        item={spell} 
        backUrl="/incantations/spells"
        backLabel="Back to Spells"
      />
    </>
  );
}
