import { Metadata } from "next";
import { notFound } from "next/navigation";

// 3. The UI Component
import { BreadcrumbsLd } from "@/components/common/BreadcrumbsLd";
import { JsonLd } from "@/components/common/JsonLd";
import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { DictionaryProvider } from "@/components/providers/DictionaryProvider";
import { buildDynamicDictionary } from "@/lib/link-dictionary";
import { routes } from "@/lib/routes";
import {
  fetchGameData,
  getSpellcasterById,
  getSpellcasters,
} from "@/services/api/api";
import {
  fetchEntityTimeline,
  mapStatChangesToChangelog,
} from "@/services/api/patch-history";
import { Spellcaster } from "@/types/api";

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

  const description = `Complete stats and ability breakdown for ${spellcaster.name} in Spellcasters Chronicles. Learn about the ${spellcaster.abilities.primary.name} and view compatible decks.`;

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

export default async function SpellcasterPage({
  params,
}: SpellcasterPageProps) {
  const { id } = await params;
  const spellcaster = await getSpellcasterById(id);

  if (!spellcaster) {
    notFound();
  }

  const data = await fetchGameData();
  const allSpellcasters = data.spellcasters || [];

  // Synthesize UI Patch History directly from inline stat_changes
  const entityChangelog = spellcaster.stat_changes
    ? mapStatChangesToChangelog(spellcaster.stat_changes, id, spellcaster.name)
    : [];
  const entityTimeline = await fetchEntityTimeline(id);
  const relatedEntities = allSpellcasters.filter(
    (s) =>
      s.spellcaster_id !== spellcaster.spellcaster_id &&
      s.class === spellcaster.class
  );

  const allEntities = [
    ...(data.units || []),
    ...(data.spells || []),
    ...allSpellcasters,
    ...(data.titans || []),
  ];
  const dictionary = buildDynamicDictionary(allEntities);

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: spellcaster.name,
    description: spellcaster.abilities.primary.description,
    url: `https://spellcastersdb.com${routes.spellcaster(spellcaster.spellcaster_id!)}`,
    image: `https://spellcastersdb.com/api/og?spellcasterId=${spellcaster.spellcaster_id}`,
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Spellcasters", url: routes.spellcaster("") },
    {
      name: spellcaster.name,
      url: routes.spellcaster(spellcaster.spellcaster_id!),
    },
  ];

  return (
    <DictionaryProvider dictionary={dictionary}>
      <JsonLd
        data={jsonLdData as Record<string, unknown>}
        id={`json-ld-hero-${spellcaster.spellcaster_id}`}
      />
      <BreadcrumbsLd items={breadcrumbs} />
      <EntityShowcase
        item={spellcaster}
        backUrl={routes.spellcaster("")}
        backLabel="Back to Spellcasters"
        changelog={entityChangelog}
        timeline={entityTimeline}
        showControls={true}
        breadcrumbs={[
          { label: "Spellcasters", href: routes.spellcaster("") },
          { label: spellcaster.name },
        ]}
        relatedEntities={relatedEntities}
        relatedTitle="Related Spellcasters"
      />
    </DictionaryProvider>
  );
}
