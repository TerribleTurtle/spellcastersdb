import { Metadata } from "next";

import { EntityShowcase } from "@/components/inspector/EntityShowcase";
import { notFound } from "next/navigation";

import { getEntityById, getSpells } from "@/lib/api";
import { Spell } from "@/types/api";

interface SpellPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const spells = await getSpells();
  return spells.map((spell) => ({
    id: spell.entity_id,
  }));
}

export async function generateMetadata({
  params,
}: SpellPageProps): Promise<Metadata> {
  const { id } = await params;
  const entity = await getEntityById(id);
  const spell = entity as Spell;

  if (!spell || spell.category !== "Spell") {
    return { title: "Spell Not Found" };
  }

  return {
    title: spell.name,
    description: spell.description,
    openGraph: {
      title: spell.name,
      description: spell.description,
    },
  };
}

export default async function SpellPage({ params }: SpellPageProps) {
  const { id } = await params;
  const entity = await getEntityById(id);
  const spell = entity as Spell;

  if (!spell || spell.category !== "Spell") {
    notFound();
  }

  return (
    <EntityShowcase 
      item={spell} 
      backUrl="/incantations/spells"
      backLabel="Back to Spells"
    />
  );
}
