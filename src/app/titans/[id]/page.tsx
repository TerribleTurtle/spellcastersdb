import { Metadata } from "next";
import { notFound } from "next/navigation";

import { BreadcrumbsLd } from "@/components/common/BreadcrumbsLd";
import { JsonLd } from "@/components/common/JsonLd";
import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { getEntityById, getTitans } from "@/services/api/api";
import {
  fetchEntityTimeline,
  mapStatChangesToChangelog,
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
      images: [{ url: `/api/og?id=${id}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: titan.name,
      description: titan.description,
      images: [`/api/og?id=${id}`],
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

  // Fetch related entities
  const allTitans = await getTitans();

  // Synthesize UI Patch History directly from inline stat_changes
  const entityChangelog = titan.stat_changes
    ? mapStatChangesToChangelog(titan.stat_changes, id, titan.name)
    : [];
  const entityTimeline = await fetchEntityTimeline(id);
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
          name: "Titans",
          item: "https://spellcastersdb.com/titans",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: titan.name,
        },
      ],
    },
  };

  return (
    <>
      <BreadcrumbsLd
        items={[
          { name: "Titans", url: "/titans" },
          { name: titan.name, url: `/titans/${titan.entity_id}` },
        ]}
      />
      <JsonLd
        data={jsonLdData as Record<string, unknown>}
        id={`json-ld-titan-${titan.entity_id}`}
      />
      <EntityShowcase
        item={titan}
        backUrl="/titans"
        backLabel="Back to Titans"
        changelog={entityChangelog}
        timeline={entityTimeline}
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
