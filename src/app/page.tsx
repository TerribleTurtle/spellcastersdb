import { getAllEntities } from "@/lib/api";
import { UnitArchive } from "@/components/archive/UnitArchive";

export const metadata = {
  title: "SpellcastersDB - Community Database & Deck Builder",
  description: "The definitive community hub for Spellcasters Chronicles. Search and filter the complete unit database.",
};

export default async function Home() {
  const units = await getAllEntities();

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
         {/* Minimal Hero / Header */}
        <div className="mb-8 flex flex-col items-start gap-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent animate-gradient-x">
            SpellcastersDB
          </h1>
          <p className="text-gray-400 max-w-2xl">
            The definitive community database. Unofficial and built by players.
          </p>
        </div>
        
        {/* The Archive UI */}
        <UnitArchive initialUnits={units} />
      </div>
    </div>
  );
}
