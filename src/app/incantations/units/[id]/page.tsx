import { Metadata } from "next";
import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/common/JsonLd";

import { getUnitById, getUnits } from "@/lib/api";

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

// 3. The UI Component
export default async function UnitPage({ params }: UnitPageProps) {
  const { id } = await params;
  const unit = await getUnitById(id);

  if (!unit) {
    notFound();
  }

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "name": unit.name,
    "description": unit.description,
    "genre": "Strategic Card Game",
    "isFamilyFriendly": true,
    "keywords": unit.tags.join(", "),
    "thumbnailUrl": `https://spellcastersdb.com/api/og/unit?id=${unit.entity_id}`, // Assuming this route exists or will be added
    "mainEntity": {
      "@type": "Thing",
      "name": unit.name,
      "description": unit.description,
      "category": unit.category,
    }
  };

  return (
    <>
      <JsonLd data={jsonLdData as any} id={`json-ld-unit-${unit.entity_id}`} />
      <EntityShowcase 
        item={unit} 
        backUrl="/incantations/units"
        backLabel="Back to Units"
      />
    </>
  );
}
