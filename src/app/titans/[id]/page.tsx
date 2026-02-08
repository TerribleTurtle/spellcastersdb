import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getEntityById, getTitans } from "@/lib/api";
import { Titan } from "@/types/api";

interface TitanPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const titans = await getTitans();
  return titans.map((titan) => ({
    id: titan.entity_id,
  }));
}

export async function generateMetadata({
  params,
}: TitanPageProps): Promise<Metadata> {
  const { id } = await params;
  const entity = await getEntityById(id);
  const titan = entity as Titan;

  if (!titan || titan.category !== "Titan") {
    return { title: "Titan Not Found" };
  }

  return {
    title: titan.name,
    description: titan.description,
    openGraph: {
      title: titan.name,
      description: titan.description,
    },
  };
}

export default async function TitanPage({ params }: TitanPageProps) {
  const { id } = await params;
  const entity = await getEntityById(id);
  const titan = entity as Titan;

  if (!titan || titan.category !== "Titan") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <span className="text-brand-primary font-mono text-sm uppercase tracking-wider flex gap-2">
            <span className="text-brand-accent">TITAN</span>
            <span>•</span>
            <Link
              href={`/schools/${titan.magic_school}`}
              className="hover:text-brand-secondary hover:underline underline-offset-4"
            >
              {titan.magic_school}
            </Link>
          </span>
          <h1 className="text-6xl font-black mt-2 mb-4 text-brand-accent drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">
            {titan.name}
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            {titan.description}
          </p>
        </div>

        {/* Stats Grid - Titan Specific */}
        <div className="grid grid-cols-2 gap-4 bg-surface-card rounded-2xl p-6 border border-brand-accent/20 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
          <div className="p-4 bg-black/20 rounded-xl border border-white/5">
            <p className="text-gray-400 text-sm uppercase tracking-widest text-[10px]">
              Health
            </p>
            <p className="text-3xl font-bold text-green-400">{titan.health}</p>
          </div>
          <div className="p-4 bg-black/20 rounded-xl border border-white/5">
            <p className="text-gray-400 text-sm uppercase tracking-widest text-[10px]">
              Damage
            </p>
            <p className="text-3xl font-bold text-red-400">{titan.damage}</p>
          </div>
          <div className="p-4 bg-black/20 rounded-xl border border-white/5">
            <p className="text-gray-400 text-sm uppercase tracking-widest text-[10px]">
              Speed
            </p>
            <p className="text-2xl font-bold text-yellow-400">
              {titan.movement_speed}
            </p>
          </div>
          {titan.heal_amount && (
            <div className="p-4 bg-black/20 rounded-xl border border-white/5">
              <p className="text-gray-400 text-sm uppercase tracking-widest text-[10px]">
                Heal
              </p>
              <p className="text-2xl font-bold text-green-300">
                {titan.heal_amount}
              </p>
            </div>
          )}
        </div>

        {/* Card Config */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-brand-primary">
            Titan Configuration
          </h2>
          <div className="bg-surface-card rounded-xl p-6 border border-surface-highlight">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Rank</span>
              <span className="font-mono text-lg text-brand-accent">
                V (TITAN)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
