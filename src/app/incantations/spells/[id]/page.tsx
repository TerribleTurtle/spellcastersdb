import { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/common/JsonLd";
import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { routes } from "@/lib/routes";
import { getEntityById, getSpells } from "@/services/api/api";
import {
  fetchEntityTimeline,
  mapStatChangesToChangelog,
} from "@/services/api/patch-history";
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

  // Fetch related entities
  const allSpells = await getSpells();

  // Synthesize UI Patch History directly from inline stat_changes
  const entityChangelog = spell.stat_changes
    ? mapStatChangesToChangelog(spell.stat_changes, id, spell.name)
    : [];
  const entityTimeline = await fetchEntityTimeline(id);
  const relatedEntities = allSpells.filter(
    (s: Spell) => s.entity_id !== id && s.magic_school === spell.magic_school
  );

  const jsonLdData = {
    "@context": "https://schema.org",
    description: spell.description,
    genre: "Strategic Card Game",
    isFamilyFriendly: true,
    keywords: spell.tags.join(", "),
    thumbnailUrl: `https://spellcastersdb.com/api/og/spell?id=${spell.entity_id}`,
    mainEntity: {
      "@type": "Thing",
      name: spell.name,
      description: spell.description,
      category: "Spell",
    },
  };

  return (
    <>
      <JsonLd
        data={jsonLdData as Record<string, unknown>}
        id={`json-ld-spell-${spell.entity_id}`}
      />
      <EntityShowcase
        item={spell}
        backUrl={routes.spell("")}
        backLabel="Back to Spells"
        changelog={entityChangelog}
        timeline={entityTimeline}
        showControls={true}
        breadcrumbs={[
          { label: "Spells", href: routes.spell("") },
          { label: spell.name },
        ]}
        relatedEntities={relatedEntities}
        relatedTitle={`More ${spell.magic_school} Spells`}
      />
    </>
  );
}
