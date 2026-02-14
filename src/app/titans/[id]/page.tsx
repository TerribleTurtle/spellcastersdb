import { Metadata } from "next";

import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/common/JsonLd";

import { getEntityById, getTitans } from "@/services/api/api";
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

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "name": titan.name,
    "description": titan.description,
    "genre": "Strategic Card Game",
    "isFamilyFriendly": true,
    "keywords": titan.tags.join(", "),
    "thumbnailUrl": `https://spellcastersdb.com/api/og/titan?id=${titan.entity_id}`,
    "mainEntity": {
      "@type": "Thing",
      "name": titan.name,
      "description": titan.description,
      "category": "Titan",
    }
  };

  return (
    <>
      <JsonLd data={jsonLdData as Record<string, unknown>} id={`json-ld-titan-${titan.entity_id}`} />
      <EntityShowcase 
        item={titan} 
        backUrl="/titans"
        backLabel="Back to Titans"
      />
    </>
  );
}
