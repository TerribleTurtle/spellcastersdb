import { getAllEntities } from "@/lib/api";
import { UnitArchive } from "@/components/archive/UnitArchive";
import { notFound } from "next/navigation";

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
    title: `${decodedClass}s | SpellcastersDB`,
    description: `Browse all ${decodedClass} spellcasters.`,
  };
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { class: className } = await params;
  const decodedClass = decodeURIComponent(className);

  if (!CLASSES.includes(decodedClass)) {
    notFound();
  }

  const allEntities = await getAllEntities();

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-accent to-brand-primary mb-2">
            {decodedClass}
          </h1>
          <p className="text-gray-400">All {decodedClass} class spellcasters.</p>
        </div>
        
        <UnitArchive 
            initialUnits={allEntities} 
            defaultFilters={{ classes: [decodedClass] }}
        />
      </div>
    </div>
  );
}
