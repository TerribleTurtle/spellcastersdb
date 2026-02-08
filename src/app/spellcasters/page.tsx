import { getSpellcasters } from "@/lib/api";
import Link from "next/link";
import { Star } from "lucide-react";

export const metadata = {
  title: "Spellcasters",
  description: "Browse all accessible spellcasters in Spellcasters Chronicles.",
};

export default async function SpellcastersIndexPage() {
  const spellcasters = await getSpellcasters();

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
          Spellcasters
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spellcasters.map((spellcaster) => (
            <Link 
              key={spellcaster.spellcaster_id} 
              href={`/spellcasters/${spellcaster.spellcaster_id}`}
              className="block group bg-surface-card border border-white/10 rounded-xl p-6 transition-all hover:bg-surface-hover hover:border-brand-primary/50 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white group-hover:text-brand-primary transition-colors">
                  {spellcaster.name}
                </h2>
                <div className="flex gap-1 bg-black/40 px-2 py-1 rounded border border-white/10 items-center">
                  <span className="text-[10px] uppercase text-gray-500 mr-1 font-bold tracking-wider">Diff</span>
                  {[1, 2, 3].map((star) => (
                    <Star 
                      key={star} 
                      size={12}
                      className={`${
                        (spellcaster.difficulty || 1) >= star 
                        ? 'fill-brand-primary text-brand-primary' 
                        : 'fill-transparent text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-brand-primary text-xs font-bold uppercase w-16">Primary</span>
                  <span className="truncate text-gray-300">{spellcaster.abilities.primary.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-accent text-xs font-bold uppercase w-16">Defense</span>
                  <span className="truncate text-gray-300">{spellcaster.abilities.defense.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-secondary text-xs font-bold uppercase w-16">Ultimate</span>
                  <span className="truncate text-gray-300">{spellcaster.abilities.ultimate.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
