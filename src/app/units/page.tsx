import { getUnits } from "@/lib/api";
import { UnitArchive } from "@/components/archive/UnitArchive";

export const metadata = {
  title: "The Archive | SpellcastersDB",
  description: "Comprehensive database of Units, Spells, and Buildings.",
};

export default async function UnitsIndexPage() {
  const units = await getUnits();

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-primary mb-2">
            The Archive
          </h1>
          <p className="text-gray-400">Search and filter the complete unit database.</p>
        </div>
        
        <UnitArchive initialUnits={units} />
      </div>
    </div>
  );
}
