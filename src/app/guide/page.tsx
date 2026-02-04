import Link from "next/link";

export const metadata = {
  title: "Game Guide",
  description: "Learn the basics of Spellcasters Chronicles. Understand unit types, deck building, spellcaster system, and game mechanics.",
  keywords: ["Spellcasters Chronicles", "Guide", "How to Play", "Tutorial", "Game Mechanics", "Deck Building"],
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-surface-main text-foreground pt-28 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">
          Spellcasters Chronicles Guide
        </h1>

        <div className="space-y-8">
          {/* Game Overview */}
          <section className="bg-surface-card border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">What is Spellcasters Chronicles?</h2>
            <p className="text-slate-300 leading-relaxed">
              Spellcasters Chronicles is a strategic card-based game where players build decks and battle using units, spells, and spellcasters. Each match requires careful planning, resource management, and tactical decision-making to outmaneuver your opponent.
            </p>
          </section>

          {/* Unit Types */}
          <section className="bg-surface-card border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">Unit Types</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Units are the core of your deck. There are four main types:
            </p>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-brand-primary mb-2">Creatures</h3>
                <p className="text-slate-300 text-sm">
                  Combat units that attack and defend. Creatures have health, attack power, and various abilities. They are the backbone of most strategies.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-brand-primary mb-2">Spells</h3>
                <p className="text-slate-300 text-sm">
                  Instant or ongoing effects that can turn the tide of battle. Spells provide utility, damage, healing, or buffs to support your strategy.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-brand-primary mb-2">Buildings</h3>
                <p className="text-slate-300 text-sm">
                  Structures that provide passive benefits or generate resources over time. Buildings are key to long-term strategies and board control.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-brand-primary mb-2">Titans</h3>
                <p className="text-slate-300 text-sm">
                  Powerful, game-changing units with high stats and unique abilities. Titans are expensive but can dominate the battlefield when played correctly.
                </p>
              </div>
            </div>
          </section>

          {/* Ranks */}
          <section className="bg-surface-card border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">Unit Ranks</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Units are categorized into four ranks, representing their power level and cost:
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-brand-primary font-bold">Rank I:</span>
                <span>Basic units with lower stats but faster charge times. Great for early game pressure.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-primary font-bold">Rank II:</span>
                <span>Intermediate units with balanced stats and moderate charge times.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-primary font-bold">Rank III:</span>
                <span>Advanced units with strong abilities and longer charge times.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-primary font-bold">Rank IV:</span>
                <span>Elite units with powerful effects but significant resource investment.</span>
              </li>
            </ul>
          </section>

          {/* Spellcaster System */}
          <section className="bg-surface-card border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">Spellcasters</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Every deck is led by a Spellcaster, which defines your playstyle and provides unique abilities. Spellcasters have:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li><strong>Faction Affinity:</strong> Spellcasters belong to specific factions and may synergize with certain unit types</li>
              <li><strong>Special Abilities:</strong> Unique powers that can be activated during battle</li>
              <li><strong>Starting Resources:</strong> Spellcasters may influence your starting mana or other resources</li>
            </ul>
          </section>

          {/* Resources */}
          <section className="bg-surface-card border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">Resource System</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Understanding resources is key to mastering Spellcasters Chronicles:
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-brand-primary mb-1">Mana</h3>
                <p className="text-slate-300 text-sm">
                  The primary resource used to play units. Mana costs vary by unit rank and type.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-brand-primary mb-1">Charges</h3>
                <p className="text-slate-300 text-sm">
                  Units have initial charges and charge times. Higher rank units have fewer initial charges and longer recharge periods.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-brand-primary mb-1">Cooldowns</h3>
                <p className="text-slate-300 text-sm">
                  Some abilities and effects have cooldowns that limit how often they can be used.
                </p>
              </div>
            </div>
          </section>

          {/* Deck Building */}
          <section className="bg-surface-card border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">Deck Building Basics</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Building a strong deck requires understanding the game&apos;s rules and synergies:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Each deck must have exactly <strong>1 Spellcaster</strong></li>
              <li>Decks typically contain <strong>5 units</strong> (exact rules may vary)</li>
              <li>Consider balancing unit ranks for early, mid, and late game presence</li>
              <li>Build synergies between your Spellcaster and units</li>
              <li>Include a mix of offensive and defensive options</li>
              <li>Account for different opponent strategies</li>
            </ul>
            <p className="text-slate-400 text-sm mt-4">
              <strong>Note:</strong> Use the Deck Builder tool (coming soon) to create and validate decks according to the official rules.
            </p>
          </section>

          {/* Next Steps */}
          <section className="bg-surface-card border border-brand-primary/30 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">Ready to Build?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Now that you understand the basics, explore the unit database to discover all available cards and start planning your strategy!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-linear-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Browse the Archive
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
