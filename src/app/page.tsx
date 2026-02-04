import { getAllEntities } from "@/lib/api";
import { UnitArchive } from "@/components/archive/UnitArchive";

export const metadata = {
  title: "Spellcasters Chronicles Database",
  description: "The definitive community hub for Spellcasters Chronicles. Search and filter the complete unit database including creatures, spells, buildings, and titans.",
};

export default async function Home() {
  const units = await getAllEntities();

  return (
    <div className="min-h-screen bg-surface-main text-foreground pt-28 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* The Archive UI */}
        <UnitArchive initialUnits={units} />
      </div>
    </div>
  );
}
