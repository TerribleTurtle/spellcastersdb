import Link from "next/link";

import { Flame, Info, Skull, Snowflake, Zap } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/lib/routes";
import { fetchGameData } from "@/services/api/api";
import { Infusion } from "@/types/api";

export const metadata = {
  title: "Infusions Database - SC Guide",
  description:
    "Explore all elemental infusions in Spellcasters Chronicles, including Fire, Lightning, Poison, and Ice effects.",
};

const INFUSION_ICONS: Record<string, React.ElementType> = {
  fire_infusion: Flame,
  lightning_infusion: Zap,
  poison_infusion: Skull,
  ice_infusion: Snowflake,
};

const INFUSION_COLORS: Record<string, string> = {
  fire_infusion: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  lightning_infusion: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  poison_infusion: "text-green-400 border-green-500/30 bg-green-500/10",
  ice_infusion: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
};

export default async function InfusionsIndexPage() {
  const data = await fetchGameData();
  const infusions = data.infusions || [];

  return (
    <PageShell
      title="Infusions Database"
      maxWidth="4xl"
      breadcrumbs={[
        { label: "Guide", href: routes.guide() },
        { label: "Infusions", href: routes.infusions() },
      ]}
    >
      <div className="space-y-8">
        <section className="bg-surface-card border border-border-default rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            What are Infusions?
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Infusions are powerful elemental mechanics attached to specific
            units, spells, and spellcaster abilities. When an attack or ability
            with an infusion hits an enemy, it applies an elemental status
            buildup. Once the buildup reaches its threshold, the elemental
            effect triggers.
          </p>
          <div className="flex items-center gap-2 text-sm text-text-muted bg-surface-inset p-3 rounded">
            <Info size={16} className="text-brand-primary" />
            <p>
              Click on any infusion below to see detailed stat values and a list
              of all entities that utilize it.
            </p>
          </div>
        </section>

        {infusions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {infusions.map((infusion: Infusion) => {
              const Icon = INFUSION_ICONS[infusion.id] || Info;
              const colorClass =
                INFUSION_COLORS[infusion.id] ||
                "text-brand-primary border-brand-primary/30 bg-brand-primary/10";

              return (
                <Link
                  key={infusion.id}
                  href={routes.infusion(infusion.id)}
                  className="group flex flex-col h-full bg-surface-card border border-border-default rounded-lg p-5 hover:border-brand-accent transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg border ${colorClass}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-accent transition-colors">
                          {infusion.name}
                        </h3>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                          Element: {infusion.element}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed grow">
                    {infusion.allied_effect.description}
                  </p>

                  <div className="mt-5 pt-4 border-t border-border-subtle flex flex-col gap-3">
                    <div className="flex items-start gap-2 text-xs text-text-dimmed">
                      <Skull
                        size={14}
                        className="mt-0.5 shrink-0 text-status-danger-text"
                      />
                      <span
                        className="line-clamp-2"
                        title={infusion.enemy_effect.description}
                      >
                        <span className="font-bold text-status-danger-text mr-1">
                          Enemy:
                        </span>
                        {infusion.enemy_effect.description}
                      </span>
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="text-brand-primary text-sm font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                        View Details &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border-default rounded-lg">
            <p className="text-text-muted italic">
              No infusions data available from the API.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
