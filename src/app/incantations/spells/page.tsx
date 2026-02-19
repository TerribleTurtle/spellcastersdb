import { UnitArchive } from "@/components/database/UnitArchive";
import { getSpells } from "@/services/api/api";
import { JsonLd } from "@/components/common/JsonLd";

export const metadata = {
  title: "Spells Archive | SpellcastersDB",
  description: "Comprehensive database of all Spells in Spellcasters Chronicles.",
};

export default async function SpellsIndexPage() {
  const spells = await getSpells();

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Spells Archive",
    "description": "Comprehensive database of all Spells in Spellcasters Chronicles.",
    "hasPart": spells.map((s) => ({
      "@type": "Thing", 
      "name": s.name,
      "url": `https://spellcastersdb.com/incantations/spells/${s.entity_id}`,
    })),
  };

  return (
    <>
    <JsonLd data={jsonLdData} id="json-ld-spells-collection" />
    <div className="min-h-screen bg-surface-main text-foreground p-4 md:p-8">
      <div className="max-w-page-grid mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-secondary to-brand-primary mb-2">
            Spells Archive
          </h1>
          <p className="text-text-muted">
            Search and filter the complete spell database.
          </p>
        </div>

        <UnitArchive initialUnits={spells} />
      </div>
    </div>
    </>
  );
}
