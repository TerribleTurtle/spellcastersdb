
import { getAllEntities } from "@/lib/api";
import { UnitArchive } from "@/components/archive/UnitArchive";

export const metadata = {
  title: 'Card Database & Builds | Spellcasters Chronicles',
  description: 'Search the complete card database including creatures, spells, and titans. Research units for your next deck, build, or loadout.',
  keywords: ["Spellcasters Chronicles", "Card Database", "Unit List", "Decks", "Builds", "Loadouts", "Stats", "Wiki"],
  openGraph: {
    title: 'Card Database & Builds | Spellcasters Chronicles',
    description: 'Search the complete card database including creatures, spells, and titans. Research units for your next deck, build, or loadout.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Card Database & Builds | Spellcasters Chronicles',
    description: 'Search the complete card database for your next deck, build, or loadout.',
  }
};

export default async function DatabasePage() {
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
