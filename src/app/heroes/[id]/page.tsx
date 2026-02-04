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

export async function generateMetadata({ params }: HeroPageProps): Promise<Metadata> {
  const { id } = await params;
  const hero = await getHeroById(id);

  if (!hero) {
    return { title: "Hero Not Found" };
  }

  return {
    title: hero.name,
    description: hero.description,
    openGraph: {
      title: `${hero.name} - ${hero.title}`,
      description: hero.description,
    },
  };
}

export default async function HeroPage({ params }: HeroPageProps) {
  const { id } = await params;
  const hero = await getHeroById(id);

  if (!hero) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <span className="text-purple-400 font-mono text-sm uppercase tracking-wider">
            Hero • {hero.magic_school}
          </span>
          <h1 className="text-5xl font-bold mt-2 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            {hero.name}
          </h1>
          <h2 className="text-2xl text-purple-200 mb-4 font-light">
            {hero.title}
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            {hero.description}
          </p>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-2 gap-4 bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <div className="p-4 bg-black/20 rounded-xl">
            <p className="text-gray-400 text-sm">Health</p>
            <p className="text-2xl font-bold text-green-400">{hero.health}</p>
          </div>
          <div className="p-4 bg-black/20 rounded-xl">
            <p className="text-gray-400 text-sm">Movement Speed</p>
            <p className="text-2xl font-bold text-yellow-400">{hero.movement_speed}</p>
          </div>
        </div>

        {/* Abilities */}
        {hero.abilities && hero.abilities.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-4 text-purple-300">Abilities</h3>
            <div className="space-y-4">
              {hero.abilities.map((ability) => (
                <div key={ability.ability_id} className="bg-white/5 rounded-xl p-6 border border-purple-500/20">
                  <h4 className="text-xl font-bold text-pink-400 mb-2">{ability.name}</h4>
                  <p className="text-gray-300">{ability.description}</p>
                  {ability.cooldown && (
                    <p className="text-sm text-gray-400 mt-2">Cooldown: {ability.cooldown}s</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
