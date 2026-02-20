import { Metadata } from "next";
import { notFound } from "next/navigation";

import { BreadcrumbsLd } from "@/components/common/BreadcrumbsLd";
import { JsonLd } from "@/components/common/JsonLd";
import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { getEntityById, getTitans } from "@/services/api/api";
import {
  fetchChangelog,
  fetchEntityTimeline,
  filterChangelogForEntity,
} from "@/services/api/patch-history";
import { Titan } from "@/types/api";

interface TitanPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const titans = await getTitans();
  return titans.map((titan) => ({
    id: titan.entity_id,
  }));
}

export async function generateMetadata({
  params,
}: TitanPageProps): Promise<Metadata> {
  const { id } = await params;
  const entity = await getEntityById(id);
  const titan = entity as Titan;

  if (!titan || titan.category !== "Titan") {
    return { title: "Titan Not Found" };
  }

  return {
    title: titan.name,
    description: titan.description,
    openGraph: {
      title: titan.name,
      description: titan.description,
    },
  };
}

export default async function TitanPage({ params }: TitanPageProps) {
  const { id } = await params;
  const entity = await getEntityById(id);
  const titan = entity as Titan;

  if (!titan || titan.category !== "Titan") {
    notFound();
  }

  // Fetch patch history data and related entities in parallel
  const [changelog, timeline, allTitans] = await Promise.all([
    fetchChangelog(),
    fetchEntityTimeline(id),
    getTitans(),
  ]);
  const entityChangelog = filterChangelogForEntity(changelog, id);
  const relatedEntities = allTitans.filter((t: Titan) => t.entity_id !== id);

  const jsonLdData = {
    "@context": "https://schema.org",
    thumbnailUrl: `https://spellcastersdb.com/api/og/titan?id=${titan.entity_id}`,
    mainEntity: {
      "@type": "Thing",
      name: titan.name,
      description: titan.description,
      category: "Titan",
    },
  };

  return (
    <>
      <JsonLd
        data={jsonLdData as Record<string, unknown>}
        id={`json-ld-titan-${titan.entity_id}`}
      />
      <EntityShowcase
        item={titan}
        backUrl="/titans"
        backLabel="Back to Titans"
        changelog={entityChangelog}
        timeline={timeline}
        showControls={true}
        breadcrumbs={[
          { label: "Titans", href: "/titans" },
          { label: titan.name },
        ]}
        relatedEntities={relatedEntities}
        relatedTitle="Other Titans"
      />
    </>
  );
}
