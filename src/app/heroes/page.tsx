import { getSpellcasters } from "@/lib/api";
import Link from "next/link";

export const metadata = {
  title: "Spellcasters",
  description: "Browse all accessible spellcasters in Spellcasters Chronicles.",
};

export default async function HeroesIndexPage() {
  const heroes = await getSpellcasters();

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
          Spellcasters
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {heroes.map((hero) => (
            <Link 
              key={hero.hero_id} 
              href={`/heroes/${hero.hero_id}`}
              className="block group bg-surface-card border border-white/10 rounded-xl p-6 transition-all hover:bg-surface-hover hover:border-brand-primary/50 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white group-hover:text-brand-primary transition-colors">
                  {hero.name}
                </h2>
                <span className="bg-brand-primary/20 text-brand-primary text-xs font-mono py-1 px-2 rounded">
                  {hero.health} HP
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-brand-primary text-xs font-bold uppercase w-16">Primary</span>
                  <span className="truncate text-gray-300">{hero.abilities.primary.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-accent text-xs font-bold uppercase w-16">Defense</span>
                  <span className="truncate text-gray-300">{hero.abilities.defense.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-secondary text-xs font-bold uppercase w-16">Ultimate</span>
                  <span className="truncate text-gray-300">{hero.abilities.ultimate.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
