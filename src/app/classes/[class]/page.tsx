import { notFound } from "next/navigation";

import { JsonLd } from "@/components/common/JsonLd";
import { UnitArchive } from "@/components/database/UnitArchive";
import { getAllEntities } from "@/services/api/api";
import { Spellcaster } from "@/types/api";

const CLASSES = ["Enchanter", "Duelist", "Conqueror"];

export async function generateStaticParams() {
  return CLASSES.map((c) => ({
    class: c,
  }));
}

interface ClassPageProps {
  params: Promise<{ class: string }>;
}

export async function generateMetadata({ params }: ClassPageProps) {
  const { class: className } = await params;
  const decodedClass = decodeURIComponent(className);
  return {
    title: `All ${decodedClass} Units List & Stats | SpellcastersDB`,
    description: `Complete list of ${decodedClass} spellcasters in Spellcasters Chronicles. Compare stats, abilities, and playstyles.`,
  };
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { class: className } = await params;
  const decodedClass = decodeURIComponent(className);

  if (!CLASSES.includes(decodedClass)) {
    notFound();
  }

  const allEntities = await getAllEntities();

  // Filter for JSON-LD (Only Spellcasters have classes)
  const classEntities = allEntities.filter(
    (e) =>
      e.category === "Spellcaster" && (e as Spellcaster).class === decodedClass
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${decodedClass} Units List`,
    description: `All ${decodedClass} class spellcasters.`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: classEntities.map((entity, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://spellcastersdb.com/spellcasters/${(entity as Spellcaster).spellcaster_id}`,
        name: entity.name,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-4 md:p-8">
      <JsonLd data={jsonLd} />
      <div className="max-w-page-grid mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-accent to-brand-primary mb-2">
            {decodedClass}
          </h1>
          <p className="text-text-muted">
            All {decodedClass} class spellcasters.
          </p>
        </div>

        <UnitArchive
          initialUnits={allEntities}
          defaultFilters={{ classes: [decodedClass] }}
        />
      </div>
    </div>
  );
}
