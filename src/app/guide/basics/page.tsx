import Link from "next/link";

import { JsonLd } from "@/components/common/JsonLd";
import { GuideToc, MobileGuideToc } from "@/components/guide/GuideToc";
import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/lib/routes";

export const metadata = {
  title: "Basics & Deck Building — Game Guide",
  description:
    "Learn the fundamentals of Spellcasters Chronicles. Card types, ranks, spellcasters, charges, cooldowns, and how to build your first deck.",
  keywords: [
    "Spellcasters Chronicles",
    "Basics",
    "Deck Building",
    "Card Types",
    "Ranks",
    "Tutorial",
  ],
};

export default function BasicsPage() {
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: metadata.title,
    description: metadata.description,
    author: { "@type": "Organization", name: "SpellcastersDB" },
    publisher: {
      "@type": "Organization",
      name: "SpellcastersDB",
      logo: {
        "@type": "ImageObject",
        url: "https://www.spellcastersdb.com/favicon.svg",
      },
    },
  };

  return (
    <PageShell
      title="Basics & Deck Building"
      subtitle="Everything you need to start your journey."
      maxWidth="6xl"
      breadcrumbs={[
        { label: "Guide", href: "/guide" },
        { label: "Basics", href: "/guide/basics" },
      ]}
    >
      <JsonLd data={jsonLdData} id="json-ld-article" />
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
        <div className="flex-1 space-y-5 md:space-y-6 min-w-0 w-full max-w-4xl mx-auto lg:mx-0">
          <MobileGuideToc />

          {/* Game Overview */}
          <section
            id="overview"
            className="bg-surface-card border border-border-default rounded-lg p-5 md:p-6 scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
              What is Spellcasters Chronicles?
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Spellcasters Chronicles is a strategic card-based game where
              players build decks and battle using units, spells, and
              spellcasters. Each match requires careful planning, resource
              management, and tactical decision-making to outmaneuver your
              opponent.
            </p>
          </section>

          {/* Card Types */}
          <section
            id="card-types"
            className="bg-surface-card border border-border-default rounded-lg p-5 md:p-6 scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
              Card Types
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Your deck consists of various cards, mainly categorized as
              Incantations (Creatures, Spells, Buildings) and Titans.
            </p>
            <div className="space-y-4">
              <div className="bg-surface-dim border border-border-default rounded-lg p-3 md:p-4">
                <h3 className="text-lg font-semibold text-brand-primary mb-2">
                  Creatures
                </h3>
                <p className="text-text-secondary text-sm">
                  Combat units that attack and defend. Creatures have health,
                  attack power, and various abilities. They are the backbone of
                  most strategies.
                </p>
              </div>
              <div className="bg-surface-dim border border-border-default rounded-lg p-3 md:p-4">
                <h3 className="text-lg font-semibold text-brand-primary mb-2">
                  Spells
                </h3>
                <p className="text-text-secondary text-sm">
                  Instant or ongoing effects that can turn the tide of battle.
                  Spells provide utility, damage, healing, or buffs to support
                  your strategy.
                </p>
              </div>
              <div className="bg-surface-dim border border-border-default rounded-lg p-3 md:p-4">
                <h3 className="text-lg font-semibold text-brand-primary mb-2">
                  Buildings
                </h3>
                <p className="text-text-secondary text-sm">
                  Structures that provide passive benefits or generate resources
                  over time. Buildings are key to long-term strategies and board
                  control.
                </p>
              </div>
              <div className="bg-surface-dim border border-border-default rounded-lg p-3 md:p-4">
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
          <section
            id="ranks"
            className="bg-surface-card border border-border-default rounded-lg p-5 md:p-6 scroll-mt-24"
          >
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
          <section
            id="spellcasters"
            className="bg-surface-card border border-border-default rounded-lg p-5 md:p-6 scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
              Spellcasters
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Every deck is led by a Spellcaster, which defines your playstyle
              and provides unique abilities. Spellcasters have:
            </p>
            <ul className="list-disc list-inside text-text-secondary space-y-2">
              <li>
                <strong>Faction Affinity:</strong> Spellcasters belong to
                specific factions and may synergize with certain incantations
              </li>
              <li>
                <strong>Special Abilities:</strong> Unique powers that can be
                activated during battle
              </li>
            </ul>
          </section>

          {/* Resources */}
          <section
            id="charges-cooldowns"
            className="bg-surface-card border border-border-default rounded-lg p-5 md:p-6 scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
              Charges & Cooldowns
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Timing your incantations is important:
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-brand-primary mb-1">
                  Charges
                </h3>
                <p className="text-text-secondary text-sm">
                  Incantations have initial charges and charge times. Higher
                  rank incantations have fewer initial charges and longer
                  recharge periods.
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
          <section
            id="deck-building"
            className="bg-surface-card border border-border-default rounded-lg p-5 md:p-6 scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
              Deck Building Basics
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Building a strong deck requires understanding the game&apos;s
              rules and synergies. Every deck is composed of exactly 6 cards:
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-surface-dim border border-border-default rounded-lg p-3 md:p-4">
                <h3 className="text-lg font-semibold text-brand-primary mb-2 flex items-center gap-2">
                  <span className="bg-brand-primary text-text-primary px-2 py-0.5 rounded text-sm font-bold shadow-xs">
                    1
                  </span>
                  Spellcaster
                </h3>
                <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                  <li>
                    The leader of your deck, representing who you play in-game.
                  </li>
                  <li>
                    Build synergies between your Spellcaster and your
                    incantations.
                  </li>
                </ul>
              </div>

              <div className="bg-surface-dim border border-border-default rounded-lg p-3 md:p-4">
                <h3 className="text-lg font-semibold text-brand-primary mb-2 flex items-center gap-2">
                  <span className="bg-brand-primary text-text-primary px-2 py-0.5 rounded text-sm font-bold shadow-xs">
                    4
                  </span>
                  Incantations
                </h3>
                <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                  <li>
                    <strong className="text-brand-accent">Required:</strong> At
                    least one <strong>Rank I or II Creature</strong> (your deck
                    cannot be only Spells and Buildings).
                  </li>
                  <li>
                    Consider balancing ranks for early, mid, and late game
                    presence.
                  </li>
                  <li>Include a mix of offensive and defensive options.</li>
                </ul>
              </div>

              <div className="bg-surface-dim border border-border-default rounded-lg p-3 md:p-4">
                <h3 className="text-lg font-semibold text-brand-primary mb-2 flex items-center gap-2">
                  <span className="bg-brand-primary text-text-primary px-2 py-0.5 rounded text-sm font-bold shadow-xs">
                    1
                  </span>
                  Titan
                </h3>
                <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                  <li>
                    A powerful late-game threat that takes significant time to
                    charge.
                  </li>
                  <li>
                    Choose a Titan that complements your strategy, but remember
                    that a single Titan alone won&apos;t guarantee victory.
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-text-muted text-sm mt-4">
              <strong>Tip:</strong> Use our{" "}
              <Link
                href="/deck-builder"
                className="text-brand-primary hover:text-brand-accent underline"
              >
                Deck Builder
              </Link>{" "}
              to create and validate decks according to the official rules.
            </p>
          </section>

          {/* Infusions */}
          <section
            id="infusions"
            className="bg-brand-accent/5 border border-brand-accent/30 rounded-lg p-5 md:p-6 scroll-mt-24"
          >
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent flex items-center gap-2">
              Infusions Database
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Infusions are elemental enhancements applied to units and spells
              that deal damage over time, crowd control, and apply status
              buildups.
            </p>
            <Link
              href={routes.infusions()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent font-semibold rounded hover:bg-brand-accent/20 transition-colors"
            >
              Explore Infusions &rarr;
            </Link>
          </section>

          {/* Ready to Build */}
          <section className="bg-surface-card border border-brand-primary/30 rounded-lg p-5 md:p-6">
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
              Ready to Build?
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Create your ultimate deck strategy with our official Deck Builder.
            </p>
            <Link
              href="/deck-builder"
              className="inline-block px-6 py-3 bg-linear-to-r from-brand-primary to-brand-secondary text-text-primary font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Launch Builder
            </Link>
          </section>
        </div>

        {/* Desktop TOC Sidebar */}
        <GuideToc />
      </div>
    </PageShell>
  );
}
