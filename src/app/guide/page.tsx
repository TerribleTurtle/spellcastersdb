import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";

export const metadata = {
  title: "Game Guide",
  description:
    "Learn the basics of Spellcasters Chronicles. Understand unit types, deck building, spellcaster system, and game mechanics.",
  keywords: [
    "Spellcasters Chronicles",
    "Guide",
    "How to Play",
    "Tutorial",
    "Game Mechanics",
    "Deck Building",
  ],
};

export default function GuidePage() {
  return (
    <PageShell
      title="Spellcasters Chronicles Guide"
      maxWidth="4xl"
      breadcrumbs={[{ label: "Guide", href: "/guide" }]}
    >
      <div className="space-y-8">
        {/* Game Overview */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            What is Spellcasters Chronicles?
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Spellcasters Chronicles is a strategic card-based game where players
            build decks and battle using units, spells, and spellcasters. Each
            match requires careful planning, resource management, and tactical
            decision-making to outmaneuver your opponent.
          </p>
        </section>

        {/* Card Types */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            Card Types
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Your deck consists of various cards, mainly categorized as
            Incantations (Creatures, Spells, Buildings) and Titans.
          </p>
          <div className="space-y-4">
            <div className="bg-surface-card border border-border-default rounded-lg p-4">
              <h3 className="text-lg font-semibold text-brand-primary mb-2">
                Creatures
              </h3>
              <p className="text-text-secondary text-sm">
                Combat units that attack and defend. Creatures have health,
                attack power, and various abilities. They are the backbone of
                most strategies.
              </p>
            </div>
            <div className="bg-surface-card border border-border-default rounded-lg p-4">
              <h3 className="text-lg font-semibold text-brand-primary mb-2">
                Spells
              </h3>
              <p className="text-text-secondary text-sm">
                Instant or ongoing effects that can turn the tide of battle.
                Spells provide utility, damage, healing, or buffs to support
                your strategy.
              </p>
            </div>
            <div className="bg-surface-card border border-border-default rounded-lg p-4">
              <h3 className="text-lg font-semibold text-brand-primary mb-2">
                Buildings
              </h3>
              <p className="text-text-secondary text-sm">
                Structures that provide passive benefits or generate resources
                over time. Buildings are key to long-term strategies and board
                control.
              </p>
            </div>
            <div className="bg-surface-card border border-border-default rounded-lg p-4">
              <h3 className="text-lg font-semibold text-brand-primary mb-2">
                Titans
              </h3>
              <p className="text-text-secondary text-sm">
                The ultimate invocation. Titans are powerful, game-changing
                units with high stats and unique abilities.
              </p>
            </div>
          </div>
        </section>

        {/* Ranks */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            Ranks
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Incantations are categorized into four ranks, representing their
            power level and charge time:
          </p>
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-brand-primary font-bold">Rank I:</span>
              <span>
                Basic incantations with lower stats but faster charge times.
                Great for early game pressure.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-primary font-bold">Rank II:</span>
              <span>
                Intermediate incantations with balanced stats and moderate
                charge times.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-primary font-bold">Rank III:</span>
              <span>
                Advanced incantations with strong abilities and longer charge
                times.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-primary font-bold">Rank IV:</span>
              <span>
                Elite incantations with powerful effects but significant time
                investment.
              </span>
            </li>
          </ul>
        </section>

        {/* Spellcaster System */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            Spellcasters
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Every deck is led by a Spellcaster, which defines your playstyle and
            provides unique abilities. Spellcasters have:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>
              <strong>Faction Affinity:</strong> Spellcasters belong to specific
              factions and may synergize with certain incantations
            </li>
            <li>
              <strong>Special Abilities:</strong> Unique powers that can be
              activated during battle
            </li>
          </ul>
        </section>

        {/* Resources */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            Charges & Cooldowns
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Timing your incantations is important:
          </p>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-brand-primary mb-1">Charges</h3>
              <p className="text-text-secondary text-sm">
                Incantations have initial charges and charge times. Higher rank
                incantations have fewer initial charges and longer recharge
                periods.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-primary mb-1">
                Cooldowns
              </h3>
              <p className="text-text-secondary text-sm">
                Some abilities and effects have cooldowns that limit how often
                they can be used.
              </p>
            </div>
          </div>
        </section>

        {/* Deck Building */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            Deck Building Basics
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Building a strong deck requires understanding the game&apos;s rules
            and synergies:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>
              Each deck must have exactly <strong>1 Spellcaster</strong>
            </li>
            <li>
              Decks typically contain <strong>5 Incantations</strong> (exact
              rules may vary)
            </li>
            <li>
              <strong className="text-brand-accent">Required:</strong> At least
              one <strong>Rank I or II Creature</strong>
            </li>
            <li>Decks must include at least 1 Creature</li>
            <li>
              Consider balancing ranks for early, mid, and late game presence
            </li>
            <li>Build synergies between your Spellcaster and incantations</li>
            <li>Include a mix of offensive and defensive options</li>
            <li>Account for different opponent strategies</li>
          </ul>
          <p className="text-muted-foreground text-sm mt-4">
            <strong>Tip:</strong> Use our{" "}
            <a
              href="/deck-builder"
              className="text-brand-primary hover:text-brand-accent underline"
            >
              Deck Builder
            </a>{" "}
            to create and validate decks according to the official rules.
          </p>
        </section>

        {/* Next Steps */}
        <section className="bg-surface-card border border-brand-primary/30 rounded-lg p-6 hover:border-brand-primary/50 transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            Ready to Build?
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Now that you understand the basics, explore the unit database to
            discover all available cards and start planning your builds.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-linear-to-r from-brand-primary to-brand-secondary text-text-primary font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
