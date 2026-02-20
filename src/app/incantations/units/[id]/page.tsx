import { Metadata } from "next";
import { notFound } from "next/navigation";

// 3. The UI Component
import { BreadcrumbsLd } from "@/components/common/BreadcrumbsLd";
import { JsonLd } from "@/components/common/JsonLd";
import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { getUnitById, getUnits } from "@/services/api/api";
import {
  fetchChangelog,
  fetchEntityTimeline,
  filterChangelogForEntity,
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

  // Fetch patch history data and related entities in parallel
  const [changelog, timeline, allUnits] = await Promise.all([
    fetchChangelog(),
    fetchEntityTimeline(id),
    getUnits(),
  ]);
  const entityChangelog = filterChangelogForEntity(changelog, id);
  const relatedEntities = allUnits.filter(
    (u: Unit) => u.entity_id !== id && u.magic_school === unit.magic_school
  );

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
    <>
      <JsonLd
        data={jsonLdData as Record<string, unknown>}
        id={`json-ld-unit-${unit.entity_id}`}
      />
      <EntityShowcase
        item={unit}
        backUrl="/incantations/units"
        backLabel="Back to Units"
        changelog={entityChangelog}
        timeline={timeline}
        showControls={true}
        breadcrumbs={[
          { label: "Units", href: "/incantations/units" },
          { label: unit.name },
        ]}
        relatedEntities={relatedEntities}
        relatedTitle={`More ${unit.magic_school} Units`}
      />
    </>
  );
}
