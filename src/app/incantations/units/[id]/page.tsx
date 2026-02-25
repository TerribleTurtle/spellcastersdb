import { Metadata } from "next";
import { notFound } from "next/navigation";

// 3. The UI Component
import { JsonLd } from "@/components/common/JsonLd";
import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { DictionaryProvider } from "@/components/providers/DictionaryProvider";
import { buildDynamicDictionary } from "@/lib/link-dictionary";
import { routes } from "@/lib/routes";
import { fetchGameData, getUnitById, getUnits } from "@/services/api/api";
import {
  fetchEntityTimeline,
  mapStatChangesToChangelog,
} from "@/services/api/patch-history";
import { Unit } from "@/types/api";

interface UnitPageProps {
  params: Promise<{ id: string }>;
}

// 1. Generate Static Params (SSG)
export async function generateStaticParams() {
  const units = await getUnits();
  return units.map((unit) => ({
    id: unit.entity_id,
  }));
}

// 2. Generate Dynamic Metadata (SEO)
export async function generateMetadata({
  params,
}: UnitPageProps): Promise<Metadata> {
  const { id } = await params;
  const unit = await getUnitById(id);

  if (!unit) {
    return {
      title: "Unit Not Found",
    };
  }

  return {
    title: unit.name,
    description: unit.description,
    openGraph: {
      title: unit.name,
      description: unit.description,
    },
  };
}

export default async function UnitPage({ params }: UnitPageProps) {
  const { id } = await params;
  const unit = await getUnitById(id);

  if (!unit) {
    notFound();
  }

  const data = await fetchGameData();
  const allUnits = data.units || [];

  // Synthesize UI Patch History directly from inline stat_changes
  const entityChangelog = unit.stat_changes
    ? mapStatChangesToChangelog(unit.stat_changes, id, unit.name)
    : [];
  const entityTimeline = await fetchEntityTimeline(id);

  const relatedEntities = allUnits.filter(
    (u: Unit) =>
      u.entity_id !== unit.entity_id &&
      (u.magic_school === unit.magic_school ||
        u.movement_type === unit.movement_type ||
        u.category === unit.category)
  );

  const allEntities = [
    ...allUnits,
    ...(data.spells || []),
    ...(data.spellcasters || []),
    ...(data.titans || []),
  ];
  const dictionary = buildDynamicDictionary(allEntities);

  // Schema for Unit (Product/Character)
  const jsonLdData = {
    "@context": "https://schema.org",
    thumbnailUrl: `https://spellcastersdb.com/api/og?unitId=${unit.entity_id}`,
    mainEntity: {
      "@type": "GameCharacter",
      name: unit.name,
      description: unit.description,
      category: unit.category,
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
          name: "Units",
          item: "https://spellcastersdb.com/incantations/units",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: unit.name,
        },
      ],
    },
  };

  return (
    <DictionaryProvider dictionary={dictionary}>
      <JsonLd
        data={jsonLdData as Record<string, unknown>}
        id={`json-ld-unit-${unit.entity_id}`}
      />
      <EntityShowcase
        item={unit}
        backUrl={routes.unit("")}
        backLabel="Back to Units"
        changelog={entityChangelog}
        timeline={entityTimeline}
        showControls={true}
        breadcrumbs={[
          { label: "Units", href: routes.unit("") },
          { label: unit.name },
        ]}
        relatedEntities={relatedEntities}
        relatedTitle="Related Units"
      />
    </DictionaryProvider>
  );
}
