import { Layers, TrendingUp, Users } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { getUpgrades } from "@/services/api/api";
import type { Upgrade } from "@/types/api";

export const metadata = {
  title: "Class Upgrades — Game Guide",
  description:
    "Explore upgrade paths for each class in Spellcasters Chronicles. Population scaling, incantation upgrades, and level-up choices.",
  keywords: [
    "Spellcasters Chronicles",
    "Upgrades",
    "Class",
    "Conqueror",
    "Duelist",
    "Enchanter",
    "Level Up",
  ],
};

// Color palette for archetypes
const ARCHETYPE_STYLES: Record<
  string,
  { bg: string; border: string; text: string; iconBg: string }
> = {
  Conqueror: {
    bg: "from-red-500/10 to-orange-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    iconBg: "from-red-500/20 to-orange-500/20",
  },
  Duelist: {
    bg: "from-blue-500/10 to-indigo-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    iconBg: "from-blue-500/20 to-indigo-500/20",
  },
  Enchanter: {
    bg: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    iconBg: "from-emerald-500/20 to-teal-500/20",
  },
};

const DEFAULT_STYLE = {
  bg: "from-brand-primary/10 to-brand-secondary/10",
  border: "border-brand-primary/30",
  text: "text-brand-primary",
  iconBg: "from-brand-primary/20 to-brand-secondary/20",
};

function ArchetypeSection({ upgrade }: { upgrade: Upgrade }) {
  const style = ARCHETYPE_STYLES[upgrade.archetype] || DEFAULT_STYLE;

  return (
    <section
      className={`bg-linear-to-br ${style.bg} border ${style.border} rounded-xl p-5 md:p-8`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-12 h-12 rounded-lg bg-linear-to-br ${style.iconBg} flex items-center justify-center`}
        >
          <Users size={24} className={style.text} />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${style.text}`}>
            {upgrade.archetype}
          </h2>
        </div>
      </div>

      {/* Population Scaling */}
      {upgrade.population_scaling.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <TrendingUp size={18} className={style.text} />
            Population Scaling
          </h3>
          <div className="flex flex-wrap gap-2">
            {upgrade.population_scaling.map((entry) => (
              <div
                key={entry.level}
                className="bg-surface-card border border-border-default rounded-lg px-4 py-2 text-center min-w-[80px]"
              >
                <p className="text-xs text-text-muted mb-0.5">
                  Lv. {entry.level}
                </p>
                <p className="text-lg font-bold text-text-primary">
                  {entry.population_cap}
                </p>
                <p className="text-[10px] text-text-muted">pop cap</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incantation Upgrades */}
      {upgrade.incantation_upgrades.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Layers size={18} className={style.text} />
            Incantation Upgrades
          </h3>
          <div className="space-y-3">
            {upgrade.incantation_upgrades.map((iu) => (
              <div
                key={iu.incantation_id}
                className="bg-surface-card border border-border-default rounded-lg p-4"
              >
                <p className="text-sm font-semibold text-text-primary mb-2">
                  {iu.incantation_id}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {iu.upgrades.map((choice, idx) => (
                    <div
                      key={idx}
                      className={`bg-surface-dim border ${style.border} rounded-lg p-3`}
                    >
                      <p className={`text-sm font-semibold ${style.text} mb-1`}>
                        {choice.name}
                      </p>
                      <p className="text-xs text-text-muted mb-2">
                        {choice.description}
                      </p>
                      {Object.entries(choice.effect).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(choice.effect).map(([stat, val]) => (
                            <span
                              key={stat}
                              className="text-[10px] px-1.5 py-0.5 bg-surface-card rounded text-text-secondary"
                            >
                              {stat}:{" "}
                              {typeof val === "number" && val > 0 ? "+" : ""}
                              {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty states */}
      {upgrade.population_scaling.length === 0 &&
        upgrade.incantation_upgrades.length === 0 && (
          <p className="text-sm text-text-muted italic">
            No upgrade data available for this class yet.
          </p>
        )}
    </section>
  );
}

export default async function UpgradesPage() {
  const upgrades = await getUpgrades();

  return (
    <PageShell
      title="Class Upgrades"
      subtitle="Discover how each class evolves through leveling."
      maxWidth="6xl"
      breadcrumbs={[
        { label: "Guide", href: "/guide" },
        { label: "Upgrades", href: "/guide/upgrades" },
      ]}
    >
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Intro */}
        <div className="bg-surface-card border border-border-default rounded-xl p-5 md:p-6">
          <p className="text-text-secondary leading-relaxed mb-4">
            Each class in Spellcasters Chronicles has a unique upgrade path. As
            you level up during a match, you choose from three fixed upgrades
            that enhance your incantations. Population limits auto-scale with
            level.
          </p>
          <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-4">
            <p className="text-sm font-semibold text-brand-primary mb-1">
              Titan Auto-Scaling
            </p>
            <p className="text-sm text-text-secondary">
              Titans automatically scale at Levels 15, 20, and 25, gaining{" "}
              <strong className="text-text-primary">+25% DPS</strong> and{" "}
              <strong className="text-emerald-400">+5,000 HP</strong> at each
              breakpoint.
            </p>
          </div>
        </div>

        {upgrades.length > 0 ? (
          upgrades.map((upgrade) => (
            <ArchetypeSection key={upgrade.archetype} upgrade={upgrade} />
          ))
        ) : (
          <div className="bg-surface-card border border-border-default rounded-xl p-8 text-center">
            <p className="text-text-muted text-lg">
              Upgrade data is currently unavailable. Check back soon!
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
