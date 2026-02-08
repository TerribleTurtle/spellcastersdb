import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSpellcasterById, getSpellcasters } from "@/lib/api";

interface SpellcasterPageProps {
  params: Promise<{ id: string }>;
}

// 1. Generate Static Params (SSG)
export async function generateStaticParams() {
  const spellcasters = await getSpellcasters();
  return spellcasters.map((s) => ({
    id: s.spellcaster_id,
  }));
}

// 2. Generate Dynamic Metadata (SEO)
export async function generateMetadata({
  params,
}: SpellcasterPageProps): Promise<Metadata> {
  const { id } = await params;
  const spellcaster = await getSpellcasterById(id);

  if (!spellcaster) {
    return { title: "Spellcaster Not Found" };
  }

  // Fallback description since spellcasters don't have a specific description field
  const description = `${spellcaster.name} - ${spellcaster.abilities.primary.name} user. Difficulty: ${spellcaster.difficulty || 1}/3.`;

  return {
    title: spellcaster.name,
    description: description,
    openGraph: {
      title: spellcaster.name,
      description: description,
    },
  };
}

// 3. The UI Component
export default async function SpellcasterPage({
  params,
}: SpellcasterPageProps) {
  const { id } = await params;
  const spellcaster = await getSpellcasterById(id);

  if (!spellcaster) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-surface-main text-foreground p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-white/10 pb-6">
          <span className="text-brand-primary font-mono text-sm uppercase tracking-wider">
            <Link
              href={`/classes/${spellcaster.class}`}
              className="hover:text-brand-secondary hover:underline underline-offset-4"
            >
              {spellcaster.class}
            </Link>
          </span>
          <h1 className="text-6xl font-bold mt-2 mb-2 bg-clip-text text-transparent bg-linear-to-r from-brand-primary to-brand-secondary">
            {spellcaster.name}
          </h1>
        </div>

        {/* Difficulty Indicator */}
        <div className="mb-8">
          <div className="bg-surface-card p-4 rounded-xl border border-surface-highlight inline-flex items-center gap-4">
            <p className="text-gray-400 text-xs uppercase tracking-widest">
              Difficulty
            </p>
            <div className="flex gap-1">
              {[1, 2, 3].map((star) => (
                <div
                  key={star}
                  className={`h-3 w-3 rounded-full ${
                    (spellcaster.difficulty || 1) >= star
                      ? "bg-brand-primary shadow-[0_0_8px_rgba(var(--brand-primary),0.6)]"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400">
              {(spellcaster.difficulty || 1) === 1 && "Easy"}
              {(spellcaster.difficulty || 1) === 2 && "Medium"}
              {(spellcaster.difficulty || 1) === 3 && "Hard"}
            </span>
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
              <span className="bg-brand-primary text-white text-xs font-bold px-2 py-1 rounded">
                PRIMARY
              </span>
              <h3 className="text-xl font-bold text-white">
                {spellcaster.abilities.primary.name}
              </h3>
            </div>
            <p className="text-gray-300">
              {spellcaster.abilities.primary.description}
            </p>
          </div>

          {/* Defense */}
          <div className="bg-gradient-to-r from-brand-accent/20 to-surface-main border border-brand-accent/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-brand-accent text-brand-dark text-xs font-bold px-2 py-1 rounded">
                DEFENSE
              </span>
              <h3 className="text-xl font-bold text-white">
                {spellcaster.abilities.defense.name}
              </h3>
            </div>
            <p className="text-gray-300">
              {spellcaster.abilities.defense.description}
            </p>
          </div>

          {/* Ultimate */}
          <div className="bg-gradient-to-r from-brand-secondary/20 to-surface-main border border-brand-secondary/30 rounded-xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <span className="bg-brand-secondary text-white text-xs font-bold px-2 py-1 rounded">
                ULTIMATE
              </span>
              <h3 className="text-xl font-bold text-white">
                {spellcaster.abilities.ultimate.name}
              </h3>
            </div>
            <p className="text-gray-300 relative z-10">
              {spellcaster.abilities.ultimate.description}
            </p>
          </div>

          {/* Passives */}
          {spellcaster.abilities.passive.length > 0 && (
            <div className="grid gap-4">
              {spellcaster.abilities.passive.map((passive, idx) => (
                <div
                  key={idx}
                  className="bg-surface-card rounded-lg p-4 border border-white/5"
                >
                  <h4 className="font-bold text-gray-300 text-sm mb-1">
                    PASSIVE: <span className="text-white">{passive.name}</span>
                  </h4>
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
