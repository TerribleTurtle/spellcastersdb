import { Flame, Sparkles, Target, Zap } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { getGameSystems } from "@/services/api/api";

export const metadata = {
  title: "Mechanics & Progression — Game Guide",
  description:
    "Understand XP earning, knowledge currency, Cast Stones, and how in-match leveling and progression work in Spellcasters Chronicles.",
  keywords: [
    "Spellcasters Chronicles",
    "XP",
    "Progression",
    "Knowledge",
    "Cast Stones",
    "Mechanics",
  ],
};

export default async function MechanicsPage() {
  const systems = await getGameSystems();

  return (
    <PageShell
      title="Mechanics & Progression"
      subtitle="How XP, knowledge, and leveling work under the hood."
      maxWidth="6xl"
      breadcrumbs={[
        { label: "Guide", href: "/guide" },
        { label: "Mechanics", href: "/guide/mechanics" },
      ]}
    >
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* ── Knowledge Currency ──────────────────────── */}
        {systems?.progression && (
          <section className="bg-surface-card border border-border-default rounded-xl p-5 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center">
                <Sparkles size={22} className="text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-brand-accent">
                Knowledge Currency
              </h2>
            </div>
            <p className="text-text-secondary leading-relaxed mb-6">
              Knowledge is the primary currency used to unlock new incantations
              within Magic Schools. Earn it by playing matches — daily bonuses
              reward consistent play.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-surface-dim border border-border-default rounded-lg p-4">
                <p className="text-xs font-semibold tracking-wider uppercase text-text-muted mb-1">
                  Starting Knowledge
                </p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-brand-primary">
                    {systems.progression.starting_knowledge.default.toLocaleString()}
                  </span>
                  <span className="text-sm text-text-muted mb-1">default</span>
                </div>
              </div>
              <div className="bg-surface-dim border border-border-default rounded-lg p-4">
                <p className="text-xs font-semibold tracking-wider uppercase text-text-muted mb-1">
                  Closed Beta Bonus
                </p>
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-amber-400">
                    {systems.progression.starting_knowledge.beta.toLocaleString()}
                  </span>
                  <span className="text-sm text-text-muted mb-1">
                    (added to default)
                  </span>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-text-primary mb-3">
              Earn Rates
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "First Daily Match",
                  value: systems.progression.earn_rates.first_daily_match,
                  color: "text-emerald-400",
                },
                {
                  label: "Win",
                  value: systems.progression.earn_rates.win,
                  color: "text-blue-400",
                },
                {
                  label: "Loss",
                  value: systems.progression.earn_rates.loss,
                  color: "text-text-muted",
                },
              ].map((rate) => (
                <div
                  key={rate.label}
                  className="bg-surface-dim border border-border-default rounded-lg p-3 text-center"
                >
                  <p className="text-2xl font-bold mb-1">
                    <span className={rate.color}>+{rate.value}</span>
                  </p>
                  <p className="text-xs text-text-muted">{rate.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Match XP ────────────────────────────────── */}
        {systems?.match_xp && (
          <section className="bg-surface-card border border-border-default rounded-xl p-5 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Zap size={22} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-brand-accent">Match XP</h2>
            </div>
            <p className="text-text-secondary leading-relaxed mb-6">
              In-match XP drives your level-ups. Earn it through captures,
              creature summoning, and zone control. Higher levels unlock more
              powerful upgrades.
            </p>

            {/* Capture XP */}
            {systems.match_xp.capture && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Target size={18} className="text-emerald-400" />
                  Capture XP
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-default">
                        <th className="text-left py-2 px-3 text-text-muted font-medium">
                          Action
                        </th>
                        <th className="text-right py-2 px-3 text-text-muted font-medium">
                          XP
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      <tr>
                        <td className="py-2.5 px-3 text-text-secondary">
                          First Capture
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">
                          {systems.match_xp.capture.first.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-text-secondary">
                          Recapture
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">
                          {systems.match_xp.capture.recapture.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-text-secondary">
                          Passive Control (per sec)
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">
                          {systems.match_xp.capture.passive_per_sec}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-text-secondary">
                          Spellcaster on Point
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">
                          +
                          {systems.match_xp.capture.spellcaster_on_point.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Summoning XP */}
            {systems.match_xp.summoning && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Flame size={18} className="text-red-400" />
                  Summoning XP
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-default">
                        <th className="text-left py-2 px-3 text-text-muted font-medium">
                          Target
                        </th>
                        <th className="text-right py-2 px-3 text-text-muted font-medium">
                          XP
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      <tr>
                        <td className="py-2.5 px-3 text-text-secondary">
                          Spellcasters&apos; Souls
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-red-400">
                          {systems.match_xp.summoning.spellcaster_death}
                        </td>
                      </tr>
                      {(
                        [
                          ["Rank I", systems.match_xp.summoning.rank_I],
                          ["Rank II", systems.match_xp.summoning.rank_II],
                          ["Rank III", systems.match_xp.summoning.rank_III],
                          ["Rank IV", systems.match_xp.summoning.rank_IV],
                        ] as const
                      ).map(([label, xp]) => (
                        <tr key={label}>
                          <td className="py-2.5 px-3 text-text-secondary">
                            {label} Creature
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-red-400">
                            {xp}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Scaling */}
            {systems.match_xp.scaling && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-3">
                  XP Scaling
                </h3>
                <div className="bg-surface-dim border border-border-default rounded-lg p-4">
                  <p className="text-sm text-text-secondary mb-3">
                    Building spawns yield reduced XP (
                    <span className="font-semibold text-text-primary">
                      {systems.match_xp.scaling.building_spawn_multiplier}x
                    </span>{" "}
                    multiplier). Higher XP required at key level milestones:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {systems.match_xp.scaling.level_thresholds.map(
                      (lvl, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-surface-card border border-border-default rounded-full text-sm font-semibold text-brand-primary"
                        >
                          Lv. {lvl}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Fallback when data is unavailable */}
        {!systems && (
          <div className="bg-surface-card border border-border-default rounded-xl p-8 text-center">
            <p className="text-text-muted text-lg">
              Game systems data is currently unavailable. Check back soon!
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
