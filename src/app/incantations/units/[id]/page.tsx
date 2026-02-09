import { Metadata } from "next";
import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { notFound } from "next/navigation";

import { getUnitById, getUnits } from "@/lib/api";

interface UnitPageProps {
  params: Promise<{ id: string }>;
}

// 1. Generate Static Params (SSG)
// This tells Next.js at build time: "Here is a list of all unit IDs (e.g., 'faerie', 'titan') to build pages for."
export async function generateStaticParams() {
  const units = await getUnits();
  return units.map((unit) => ({
    id: unit.entity_id,
  }));
}

// 2. Generate Dynamic Metadata (SEO)
// This fetches the specific unit data to populate the <title> and <meta name="description"> tags.
export async function generateMetadata({
  params,
}: UnitPageProps): Promise<Metadata> {
  // Await the params promise first (Next.js 15 requirement)
  const { id } = await params;
  const unit = await getUnitById(id);

  if (!unit) {
    return {
      title: "Unit Not Found",
    };
  }

  return {
    title: unit.name, // Will become "Faerie | SpellcastersDB" due to template in layout.tsx
    description: unit.description,
    openGraph: {
      title: unit.name,
      description: unit.description,
      // We will add dynamic images later
      // images: [`/assets/units/${unit.entity_id}.png`],
    },
  };
}

// 3. The UI Component
export default async function UnitPage({ params }: UnitPageProps) {
  const { id } = await params; // Await params here too
  const unit = await getUnitById(id);

  if (!unit) {
    notFound();
  }

  return (
    <EntityShowcase 
      item={unit} 
      backUrl="/incantations/units"
      backLabel="Back to Units"
    />
  );
}
