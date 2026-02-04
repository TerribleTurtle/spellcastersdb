import { getUnitById, getUnits } from "@/lib/api";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface UnitPageProps {
  params: Promise<{ id: string }>;
}

// 1. Generate Static Params (SSG)
// This tells Next.js at build time: "Here is a list of all unit IDs (e.g., 'faerie', 'titan') to build pages for."
export async function generateStaticParams() {
  const units = await getUnits();
  return units.map((unit) => ({
    id: unit.entity_id,
  }));
}

// 2. Generate Dynamic Metadata (SEO)
// This fetches the specific unit data to populate the <title> and <meta name="description"> tags.
export async function generateMetadata({ params }: UnitPageProps): Promise<Metadata> {
  // Await the params promise first (Next.js 15 requirement)
  const { id } = await params;
  const unit = await getUnitById(id);

  if (!unit) {
    return {
      title: "Unit Not Found",
    };
  }

  return {
    title: unit.name, // Will become "Faerie | SpellcastersDB" due to template in layout.tsx
    description: unit.description,
    openGraph: {
      title: unit.name,
      description: unit.description,
      // We will add dynamic images later
      // images: [`/assets/units/${unit.entity_id}.png`], 
    },
  };
}

// 3. The UI Component
export default async function UnitPage({ params }: UnitPageProps) {
  const { id } = await params; // Await params here too
  const unit = await getUnitById(id);

  if (!unit) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <span className="text-purple-400 font-mono text-sm uppercase tracking-wider">
            {unit.category} • {unit.magic_school}
          </span>
          <h1 className="text-5xl font-bold mt-2 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            {unit.name}
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            {unit.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="p-4 bg-black/20 rounded-xl">
            <p className="text-gray-400 text-sm">Health</p>
            <p className="text-2xl font-bold text-green-400">{unit.health}</p>
          </div>
          <div className="p-4 bg-black/20 rounded-xl">
            <p className="text-gray-400 text-sm">Damage</p>
            <p className="text-2xl font-bold text-red-400">{unit.damage}</p>
          </div>
          <div className="p-4 bg-black/20 rounded-xl">
            <p className="text-gray-400 text-sm">Range</p>
            <p className="text-2xl font-bold text-blue-400">{unit.range}</p>
          </div>
          <div className="p-4 bg-black/20 rounded-xl">
            <p className="text-gray-400 text-sm">Speed</p>
            <p className="text-2xl font-bold text-yellow-400">{unit.movement_speed}</p>
          </div>
        </div>

        {/* Card Config */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-purple-300">Card Configuration</h2>
          <div className="bg-white/5 rounded-xl p-6 border border-purple-500/20">
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
              <span className="text-gray-400">Rank</span>
              <span className="font-mono text-lg">{unit.card_config.rank}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
              <span className="text-gray-400">Population Cost</span>
              <span className="font-mono text-lg">{unit.card_config.cost_population}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Charge Time</span>
              <span className="font-mono text-lg">{unit.card_config.charge_time}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
