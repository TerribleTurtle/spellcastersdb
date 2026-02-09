import { Metadata } from "next";
import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { notFound } from "next/navigation";

import { getSpellcasterById, getSpellcasters } from "@/lib/api";

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

  // Fallback description since spellcasters don't have a specific description field
  const description = `${spellcaster.name} - ${spellcaster.abilities.primary.name} user. Difficulty: ${spellcaster.difficulty || 1}/3.`;

  return {
    title: spellcaster.name,
    description: description,
    openGraph: {
      title: spellcaster.name,
      description: description,
    },
  };
}

// 3. The UI Component
export default async function SpellcasterPage({
  params,
}: SpellcasterPageProps) {
  const { id } = await params;
  const spellcaster = await getSpellcasterById(id);


  if (!spellcaster) {
    notFound();
  }

  return (
    <EntityShowcase 
      item={spellcaster} 
      backUrl="/spellcasters"
      backLabel="Back to Spellcasters"
    />
  );
}
