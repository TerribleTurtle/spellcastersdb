import { notFound } from "next/navigation";

import { UnitArchive } from "@/components/database/UnitArchive";
import { JsonLd } from "@/components/common/JsonLd";
import { getAllEntities } from "@/services/api/api";
import { Spell, Titan, UnifiedEntity, Unit } from "@/types/api";

export async function generateStaticParams() {
  return ["I", "II", "III", "IV"].map((rank) => ({
    rank: rank,
  }));
}

interface RankPageProps {
  params: Promise<{ rank: string }>;
}

export async function generateMetadata({ params }: RankPageProps) {
  const { rank } = await params;
  return {
    title: `Rank ${rank} Units List | SpellcastersDB`,
    description: `Complete list of Rank ${rank} units and spells.`,
  };
}

export default async function RankPage({ params }: RankPageProps) {
  const { rank } = await params;

  if (!["I", "II", "III", "IV"].includes(rank)) {
    notFound();
  }

  const allEntities = await getAllEntities();

  // Filter for JSON-LD (Rank is on Units, Spells, Titans)
  const rankEntities = allEntities.filter(
    (e) =>
      "rank" in e &&
      (e as UnifiedEntity & { rank: string }).rank === rank
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Rank ${rank} Units List`,
    description: `All Rank ${rank} units and spells.`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: rankEntities.map((entity, index) => {
        const safeEntity = entity as Unit | Spell | Titan;
        const id = safeEntity.entity_id;
        
        let url = `https://spellcastersdb.com/incantations/units/${id}`;
        if (entity.category === "Spell") {
          url = `https://spellcastersdb.com/incantations/spells/${id}`;
        } else if (entity.category === "Titan") {
           // Titans are usually Rank V, but logic holds
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
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-accent to-brand-primary mb-2">
            Rank {rank} Units
          </h1>
          <p className="text-gray-400">All units of Rank {rank}.</p>
        </div>

        <UnitArchive
          initialUnits={allEntities}
          defaultFilters={{ ranks: [rank] }}
        />
      </div>
    </div>
  );
}
