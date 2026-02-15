import { notFound } from "next/navigation";

import { UnitArchive } from "@/components/database/UnitArchive";
import { JsonLd } from "@/components/common/JsonLd";
import { getAllEntities } from "@/services/api/api";
import { Spell, Titan, UnifiedEntity, Unit } from "@/types/api";
import { SCHOOLS } from "@/services/config/constants";

// Local SCHOOLS definition removed


export async function generateStaticParams() {
  return SCHOOLS.map((school) => ({
    school: school,
  }));
}

interface SchoolPageProps {
  params: Promise<{ school: string }>;
}

export async function generateMetadata({ params }: SchoolPageProps) {
  const { school } = await params;
  const decodedSchool = decodeURIComponent(school);
  return {
    title: `${decodedSchool} School Units & Spells | SpellcastersDB`,
    description: `Complete list of ${decodedSchool} units, spells, and titans.`,
  };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { school } = await params;
  const decodedSchool = decodeURIComponent(school);

  if (!(SCHOOLS as readonly string[]).includes(decodedSchool)) {
    notFound();
  }

  const allEntities = await getAllEntities();

  // Filter for JSON-LD (Units, Spells, Titans have magic_school)
  const schoolEntities = allEntities.filter(
    (e) =>
      "magic_school" in e &&
      (e as UnifiedEntity & { magic_school: string }).magic_school ===
        decodedSchool
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${decodedSchool} School Units & Spells`,
    description: `All units and spells from the ${decodedSchool} magic school.`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: schoolEntities.map((entity, index) => {
        // We know it's not a spellcaster because we filtered by magic_school
        const safeEntity = entity as Unit | Spell | Titan;
        const id = safeEntity.entity_id;
        
        let url = `https://spellcastersdb.com/incantations/units/${id}`;
        if (entity.category === "Spell") {
          url = `https://spellcastersdb.com/incantations/spells/${id}`;
        } else if (entity.category === "Titan") {
          url = `https://spellcastersdb.com/titans/${id}`;
        }

        return {
          "@type": "ListItem",
          position: index + 1,
          url,
          name: entity.name,
        };
      }),
    },
  };

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-4 md:p-8">
      <JsonLd data={jsonLd} />
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-primary to-brand-secondary mb-2">
            {decodedSchool} School
          </h1>
          <p className="text-gray-400">
            All units practicing {decodedSchool} magic.
          </p>
        </div>

        <UnitArchive
          initialUnits={allEntities}
          defaultFilters={{ schools: [decodedSchool] }}
        />
      </div>
    </div>
  );
}
