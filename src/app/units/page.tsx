import { getUnits } from "@/lib/api";
import Link from "next/link";

export const metadata = {
  title: "Units",
  description: "Browse all accessible units, buildings, and spells.",
};

export default async function UnitsIndexPage() {
  const units = await getUnits();

  // Sort by Rank then Name
  const sortedUnits = units.sort((a, b) => {
    if (a.card_config.rank !== b.card_config.rank) {
      return a.card_config.rank.localeCompare(b.card_config.rank); // Rank I vs Rank II... might need better logic but ok for now
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-primary">
          Units Database
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedUnits.map((unit) => (
            <Link 
              key={unit.entity_id} 
              href={`/units/${unit.entity_id}`}
              className="block group bg-surface-card border border-white/10 rounded-xl p-5 transition-all hover:bg-surface-hover hover:border-brand-accent/50 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-gray-500 uppercase">{unit.category}</span>
                <span className="text-xs font-mono text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded">
                  {unit.card_config.cost_population} Pop
                </span>
              </div>
              
              <h2 className="text-xl font-bold text-white group-hover:text-brand-accent transition-colors mb-1">
                {unit.name}
              </h2>
              
              <p className="text-xs text-brand-primary mb-3">
                {unit.magic_school} • {unit.card_config.rank}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mt-auto">
                 <div>
                    <span className="block text-[10px] uppercase tracking-wider text-gray-600">Health</span>
                    <span className="text-white">{unit.health}</span>
                 </div>
                 <div>
                    <span className="block text-[10px] uppercase tracking-wider text-gray-600">Speed</span>
                    <span className="text-white">{unit.movement_speed}</span>
                 </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
