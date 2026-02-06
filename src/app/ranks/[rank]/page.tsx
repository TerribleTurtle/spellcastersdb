import { getAllEntities } from "@/lib/api";
import { UnitArchive } from "@/components/archive/UnitArchive";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return ["I", "II", "III", "IV"].map((rank) => ({
    rank: rank,
  }));
}

export const metadata = {
  title: "Browse by Rank | SpellcastersDB",
  description: "Browse units by their power rank.",
};

interface RankPageProps {
  params: Promise<{ rank: string }>;
}

export default async function RankPage({ params }: RankPageProps) {
  const { rank } = await params;
  
  if (!["I", "II", "III", "IV"].includes(rank)) {
    notFound();
  }

  const allEntities = await getAllEntities();

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-4 md:p-8">
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
