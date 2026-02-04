import { getHeroById, getHeroes } from "@/lib/api";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface HeroPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const heroes = await getHeroes();
  return heroes.map((hero) => ({
    id: hero.hero_id,
  }));
}

// 2. Generate Dynamic Metadata (SEO)
export async function generateMetadata({ params }: HeroPageProps): Promise<Metadata> {
  const { id } = await params;
  const hero = await getHeroById(id);

  if (!hero) {
    return { title: "Hero Not Found" };
  }

  // Fallback description since heroes don't have a specific description field
  const description = `${hero.name} - ${hero.abilities.primary.name} user. Health: ${hero.health}.`;

  return {
    title: hero.name,
    description: description,
    openGraph: {
      title: hero.name,
      description: description,
    },
  };
}

// 3. The UI Component
export default async function HeroPage({ params }: HeroPageProps) {
  const { id } = await params;
  const hero = await getHeroById(id);

  if (!hero) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-white/10 pb-6">
          <span className="text-brand-primary font-mono text-sm uppercase tracking-wider">
            Hero Character
          </span>
          <h1 className="text-6xl font-bold mt-2 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
            {hero.name}
          </h1>
        </div>

        {/* Combat Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface-card p-4 rounded-xl border border-surface-highlight">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Health</p>
            <p className="text-3xl font-bold text-green-400">{hero.health}</p>
            <p className="text-xs text-gray-500 mt-1">+{hero.health_regen_rate}/s Regen</p>
          </div>
          <div className="bg-surface-card p-4 rounded-xl border border-surface-highlight">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Damage</p>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-red-400">{hero.attack_damage_minion} <span className="text-sm font-normal text-gray-500">vs Minion</span></span>
              <span className="text-xl font-bold text-orange-400">{hero.attack_damage_summoner} <span className="text-sm font-normal text-gray-500">vs Player</span></span>
            </div>
          </div>
          <div className="bg-surface-card p-4 rounded-xl border border-surface-highlight">
             <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Move Speed</p>
             <p className="text-2xl font-bold text-yellow-400">{hero.movement_speed}</p>
          </div>
           <div className="bg-surface-card p-4 rounded-xl border border-surface-highlight">
             <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Flight Speed</p>
             <p className="text-2xl font-bold text-brand-accent">{hero.flight_speed}</p>
          </div>
        </div>

        {/* Ability Kit */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-2">
            <span>✨</span> Ability Kit
          </h2>
          
          {/* Primary */}
          <div className="bg-gradient-to-r from-brand-primary/20 to-surface-main border border-brand-primary/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
               <span className="bg-brand-primary text-white text-xs font-bold px-2 py-1 rounded">PRIMARY</span>
               <h3 className="text-xl font-bold text-white">{hero.abilities.primary.name}</h3>
            </div>
            <p className="text-gray-300">{hero.abilities.primary.description}</p>
          </div>

           {/* Defense */}
           <div className="bg-gradient-to-r from-brand-accent/20 to-surface-main border border-brand-accent/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
               <span className="bg-brand-accent text-brand-dark text-xs font-bold px-2 py-1 rounded">DEFENSE</span>
               <h3 className="text-xl font-bold text-white">{hero.abilities.defense.name}</h3>
            </div>
            <p className="text-gray-300">{hero.abilities.defense.description}</p>
          </div>

          {/* Ultimate */}
          <div className="bg-gradient-to-r from-brand-secondary/20 to-surface-main border border-brand-secondary/30 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2 relative z-10">
               <span className="bg-brand-secondary text-white text-xs font-bold px-2 py-1 rounded">ULTIMATE</span>
               <h3 className="text-xl font-bold text-white">{hero.abilities.ultimate.name}</h3>
            </div>
            <p className="text-gray-300 relative z-10">{hero.abilities.ultimate.description}</p>
          </div>

          {/* Passives */}
          {hero.abilities.passive.length > 0 && (
             <div className="grid gap-4">
                {hero.abilities.passive.map((passive, idx) => (
                  <div key={idx} className="bg-surface-card rounded-lg p-4 border border-white/5">
                    <h4 className="font-bold text-gray-300 text-sm mb-1">PASSIVE: <span className="text-white">{passive.name}</span></h4>
                    <p className="text-gray-400 text-sm">{passive.description}</p>
                  </div>
                ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
