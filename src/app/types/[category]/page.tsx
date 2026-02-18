import { notFound } from "next/navigation";

import { UnitArchive } from "@/components/database/UnitArchive";
import { getAllEntities } from "@/services/api/api";
import { capitalize } from "@/services/utils/formatting";

// Map URL slug to Internal Category
const CATEGORY_MAP: Record<string, string> = {
  spells: "Spell",
  buildings: "Building",
  creatures: "Creature",
  titans: "Titan",
  spellcasters: "Spellcaster",
  consumables: "Consumable",
};

export async function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((category) => ({
    category: category,
  }));
}

export const dynamicParams = false; // 404 on unknown categories

interface TypePageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: TypePageProps) {
  const { category } = await params;
  const internalCategory = CATEGORY_MAP[category.toLowerCase()];

  if (!internalCategory) return { title: "Not Found" };

  return {
    title: `${capitalize(category)} | SpellcastersDB`,
    description: `Browse all ${category} in SpellcastersDB.`,
  };
}

export default async function TypePage({ params }: TypePageProps) {
  const { category } = await params;
  const internalCategory = CATEGORY_MAP[category.toLowerCase()]; // e.g. "Spell"

  if (!internalCategory) {
    notFound();
  }

  const allEntities = await getAllEntities();

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-4 md:p-8">
      <div className="max-w-page-grid mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-secondary to-brand-accent mb-2">
            {capitalize(category)}
          </h1>
          <p className="text-gray-400">Browse all {category}.</p>
        </div>

        <UnitArchive
          initialUnits={allEntities}
          defaultFilters={{ categories: [internalCategory] }}
        />
      </div>
    </div>
  );
}
