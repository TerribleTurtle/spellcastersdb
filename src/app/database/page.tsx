import { UnitArchive } from "@/components/archive/UnitArchive";
import { getAllEntities } from "@/services/data/api";
import { JsonLd } from "@/components/common/JsonLd";

export const metadata = {
  title: "Card Database & Builds | Spellcasters Chronicles",
  description:
    "Search the complete card database including creatures, spells, and titans. Research units for your next deck, build, or loadout.",
  keywords: [
    "Spellcasters Chronicles",
    "Card Database",
    "Unit List",
    "Decks",
    "Builds",
    "Loadouts",
    "Stats",
    "Wiki",
  ],
  openGraph: {
    title: "Card Database & Builds | Spellcasters Chronicles",
    description:
      "Search the complete card database including creatures, spells, and titans. Research units for your next deck, build, or loadout.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Card Database & Builds | Spellcasters Chronicles",
    description:
      "Search the complete card database for your next deck, build, or loadout.",
  },
};

export default async function DatabasePage() {
  const units = await getAllEntities();

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Card Database",
    "description": "Search the complete card database including creatures, spells, and titans.",
    "hasPart": units.map((u) => {
        let url = `https://spellcastersdb.com/database`; // Default
        if (u.category === "Spellcaster") url = `https://spellcastersdb.com/spellcasters/${u.spellcaster_id}`;
        else if (u.category === "Titan") url = `https://spellcastersdb.com/titans/${u.entity_id}`;
        else if (u.category === "Spell") url = `https://spellcastersdb.com/incantations/spells/${u.entity_id}`;
        else if (u.category === "Creature" || u.category === "Building") url = `https://spellcastersdb.com/incantations/units/${u.entity_id}`;
        // Consumables? upgrades?
        
        return {
            "@type": "Thing",
            "name": u.name,
            "url": url,
        };
    }),
  };

  return (
    <>
    <JsonLd data={jsonLdData} id="json-ld-database-collection" />
    <div className="min-h-screen bg-surface-main text-foreground pt-28 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* The Archive UI */}
        <UnitArchive initialUnits={units} />
      </div>
    </div>
    </>
  );
}
