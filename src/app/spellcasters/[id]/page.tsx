import { Metadata } from "next";
import { notFound } from "next/navigation";

// 3. The UI Component
import { BreadcrumbsLd } from "@/components/common/BreadcrumbsLd";
import { JsonLd } from "@/components/common/JsonLd";
import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { getSpellcasterById, getSpellcasters } from "@/services/api/api";
import {
  fetchChangelog,
  fetchEntityTimeline,
  filterChangelogForEntity,
} from "@/services/api/patch-history";

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

  // Fetch patch history data and related entities in parallel
  const [changelog, timeline, allSpellcasters] = await Promise.all([
    fetchChangelog(),
    fetchEntityTimeline(id),
    getSpellcasters(),
  ]);
  const entityChangelog = filterChangelogForEntity(changelog, id);
  const relatedEntities = allSpellcasters.filter(
    (s) => s.spellcaster_id !== id
  );

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: spellcaster.name,
    description: spellcaster.abilities.primary.description,
    url: `https://spellcastersdb.com/spellcasters/${spellcaster.spellcaster_id}`,
    image: `https://spellcastersdb.com/api/og?spellcasterId=${spellcaster.spellcaster_id}`,
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Spellcasters", url: "/spellcasters" },
    {
      name: spellcaster.name,
      url: `/spellcasters/${spellcaster.spellcaster_id}`,
    },
  ];

  return (
    <>
      <JsonLd
        data={jsonLdData}
        id={`json-ld-spellcaster-${spellcaster.spellcaster_id}`}
      />
      <BreadcrumbsLd items={breadcrumbs} />
      <EntityShowcase
        item={spellcaster}
        backUrl="/spellcasters"
        backLabel="Back to Spellcasters"
        changelog={entityChangelog}
        timeline={timeline}
        showControls={true}
        breadcrumbs={[
          { label: "Spellcasters", href: "/spellcasters" },
          { label: spellcaster.name },
        ]}
        relatedEntities={relatedEntities}
        relatedTitle="Other Spellcasters"
      />
    </>
  );
}
