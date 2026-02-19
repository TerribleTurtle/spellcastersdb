import { Metadata } from "next";

import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/common/JsonLd";

import { getEntityById, getSpells } from "@/services/api/api";
import { fetchChangelog, fetchEntityTimeline, filterChangelogForEntity } from "@/services/api/patch-history";
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

  // Fetch patch history data and related entities in parallel
  const [changelog, timeline, allSpells] = await Promise.all([
    fetchChangelog(),
    fetchEntityTimeline(id),
    getSpells(),
  ]);
  const entityChangelog = filterChangelogForEntity(changelog, id);
  const relatedEntities = allSpells.filter(
    (s: Spell) => s.entity_id !== id && s.magic_school === spell.magic_school
  );

  const jsonLdData = {
    "@context": "https://schema.org",
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
        changelog={entityChangelog}
        timeline={timeline}
        showControls={true}
        breadcrumbs={[
          { label: "Spells", href: "/incantations/spells" },
          { label: spell.name },
        ]}
        relatedEntities={relatedEntities}
        relatedTitle={`More ${spell.magic_school} Spells`}
      />
    </>
  );
}
