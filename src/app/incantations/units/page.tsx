import { UnitArchive } from "@/components/database/UnitArchive";
import { getUnits } from "@/services/api/api";
import { JsonLd } from "@/components/common/JsonLd";

export const metadata = {
  title: "The Archive | SpellcastersDB",
  description: "Comprehensive database of Units, Spells, and Buildings.",
};

export default async function UnitsIndexPage() {
  const units = await getUnits();

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "The Archive",
    "description": "Comprehensive database of Units, Spells, and Buildings.",
    "hasPart": units.map((u) => ({
      "@type": "Thing", // Or GameCharacter/VisualArtwork depending on what fits best. Units are diverse.
      "name": u.name,
      "url": `https://spellcastersdb.com/incantations/units/${u.entity_id}`,
    })),
  };

  return (
    <>
    <JsonLd data={jsonLdData} id="json-ld-units-collection" />
    <div className="min-h-screen bg-surface-main text-foreground p-4 md:p-8">
      <div className="max-w-page-grid mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-accent to-brand-primary mb-2">
            The Archive
          </h1>
          <p className="text-gray-400">
            Search and filter the complete unit database.
          </p>
        </div>

        <UnitArchive initialUnits={units} />
      </div>
    </div>
    </>
  );
}
