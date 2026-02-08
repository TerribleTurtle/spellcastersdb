import { getSpells, getEntityById } from "@/lib/api";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Spell } from "@/types/api";

interface SpellPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const spells = await getSpells();
  return spells.map((spell) => ({
    id: spell.entity_id,
  }));
}

export async function generateMetadata({ params }: SpellPageProps): Promise<Metadata> {
  const { id } = await params;
  const entity = await getEntityById(id);
  const spell = entity as Spell;

  if (!spell || spell.category !== "Spell") {
    return { title: "Spell Not Found" };
  }

  return {
    title: spell.name,
    description: spell.description,
    openGraph: {
      title: spell.name,
      description: spell.description,
    },
  };
}

export default async function SpellPage({ params }: SpellPageProps) {
  const { id } = await params;
  const entity = await getEntityById(id);
  const spell = entity as Spell;

  if (!spell || spell.category !== "Spell") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <span className="text-brand-primary font-mono text-sm uppercase tracking-wider flex gap-2">
            <span>Spell</span>
            <span>•</span>
            <Link href={`/schools/${spell.magic_school}`} className="hover:text-brand-secondary hover:underline underline-offset-4">
              {spell.magic_school}
            </Link>
          </span>
          <h1 className="text-5xl font-bold mt-2 mb-4 bg-clip-text text-transparent bg-linear-to-r from-brand-primary to-brand-secondary">
            {spell.name}
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            {spell.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 bg-surface-card rounded-2xl p-6 border border-surface-highlight">
            {spell.damage && (
                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                    <p className="text-gray-400 text-sm uppercase tracking-widest text-[10px]">Damage</p>
                    <p className="text-2xl font-bold text-red-400">{spell.damage}</p>
                </div>
            )}
            {spell.range && (
                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                    <p className="text-gray-400 text-sm uppercase tracking-widest text-[10px]">Range</p>
                    <p className="text-2xl font-bold text-brand-accent">{spell.range}</p>
                </div>
            )}
             {spell.radius && (
                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                    <p className="text-gray-400 text-sm uppercase tracking-widest text-[10px]">Radius</p>
                    <p className="text-2xl font-bold text-blue-400">{spell.radius}</p>
                </div>
            )}
             {spell.duration && (
                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                    <p className="text-gray-400 text-sm uppercase tracking-widest text-[10px]">Duration</p>
                    <p className="text-2xl font-bold text-yellow-400">{spell.duration}s</p>
                </div>
            )}
             {spell.max_targets && (
                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                    <p className="text-gray-400 text-sm uppercase tracking-widest text-[10px]">Max Targets</p>
                    <p className="text-2xl font-bold text-purple-400">{spell.max_targets}</p>
                </div>
            )}

        </div>

        {/* Card Config */}

      </div>
    </div>
  );
}
