import { Metadata } from "next";
import { notFound } from "next/navigation";

import { BreadcrumbsLd } from "@/components/common/BreadcrumbsLd";
import { JsonLd } from "@/components/common/JsonLd";
import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { DictionaryProvider } from "@/components/providers/DictionaryProvider";
import { buildDynamicDictionary } from "@/lib/link-dictionary";
import { routes } from "@/lib/routes";
import { ensureDataLoaded, getEntityById, getSpells } from "@/services/api/api";
import {
  fetchEntityTimeline,
  mapStatChangesToChangelog,
} from "@/services/api/patch-history";
import { registry } from "@/services/api/registry";
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
      images: [{ url: `/api/og?id=${id}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: spell.name,
      description: spell.description,
      images: [`/api/og?id=${id}`],
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

  await ensureDataLoaded();
  const allSpells = registry.getAllSpells();

  // Synthesize UI Patch History directly from inline stat_changes
  const entityChangelog = spell.stat_changes
    ? mapStatChangesToChangelog(spell.stat_changes, id, spell.name)
    : [];
  const entityTimeline = await fetchEntityTimeline(id);
  const relatedEntities = allSpells.filter(
    (s: Spell) =>
      s.entity_id !== spell.entity_id &&
      (s.magic_school === spell.magic_school || s.category === spell.category)
  );

  const allEntities = [
    ...registry.getAllUnits(),
    ...allSpells,
    ...registry.getAllSpellcasters(),
    ...registry.getAllTitans(),
  ];
  const dictionary = buildDynamicDictionary(allEntities);

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
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://spellcastersdb.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Spells",
          item: "https://spellcastersdb.com/incantations/spells",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: spell.name,
        },
      ],
    },
  };

  return (
    <DictionaryProvider dictionary={dictionary}>
      <BreadcrumbsLd
        items={[
          { name: "Spells", url: "/incantations/spells" },
          { name: spell.name, url: `/incantations/spells/${spell.entity_id}` },
        ]}
      />
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
        relatedTitle="Related Spells"
      />
    </DictionaryProvider>
  );
}
