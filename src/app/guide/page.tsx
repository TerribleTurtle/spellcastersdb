import Link from "next/link";

import {
  BookOpen,
  Calculator,
  Crown,
  Flame,
  Map,
  Shield,
  Sparkles,
  Swords,
  TrendingUp,
} from "lucide-react";

import { GuideCard, type GuideCardProps } from "@/components/guide/GuideCard";
import { PageShell } from "@/components/layout/PageShell";
import { routes } from "@/lib/routes";

// Revalidate every hour — matches pattern used by other pages (home, roadmap)
// to ensure Vercel's CDN serves fresh content after deployments.
export const revalidate = 3600;

export const metadata = {
  title: "Game Guide — SpellcastersDB",
  description:
    "Your comprehensive guide to Spellcasters Chronicles. Learn game mechanics, progression, ranked play, class upgrades, and more.",
  keywords: [
    "Spellcasters Chronicles",
    "Guide",
    "How to Play",
    "Game Mechanics",
    "Ranked Mode",
    "Upgrades",
  ],
  openGraph: {
    title: "Game Guide — SpellcastersDB",
    description:
      "Your comprehensive guide to Spellcasters Chronicles. Learn game mechanics, progression, ranked play, class upgrades, and more.",
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Game Guide — SpellcastersDB",
    description:
      "Your comprehensive guide to Spellcasters Chronicles. Learn game mechanics, progression, ranked play, class upgrades, and more.",
    images: ["/og-default.png"],
  },
};

// Removed inline interface, using GuideCardProps

const GUIDE_CARDS: GuideCardProps[] = [
  {
    title: "Basics & Deck Building",
    description:
      "Card types, ranks, spellcasters, and how to build a winning deck from scratch.",
    href: routes.guideBasics(),
    icon: <BookOpen size={28} />,
    gradient: "from-status-info/20 to-brand-accent/20",
  },
  {
    title: "Mechanics & Progression",
    description:
      "XP system, knowledge currency, and how leveling works in-match.",
    href: routes.guideMechanics(),
    icon: <Flame size={28} />,
    gradient: "from-status-warning/20 to-status-warning-text/20",
    badge: "NEW",
  },
  {
    title: "Ranked Mode",
    description:
      "Climb the competitive ladder from Novice to Grand Master. RP gains, tier breakdowns, and RP mechanics.",
    href: routes.guideRanked(),
    icon: <Crown size={28} />,
    gradient: "from-status-warning-text/20 to-status-warning/20",
    badge: "NEW",
  },
  {
    title: "Class Upgrades",
    description:
      "Discover how each class levels up. Population scaling and level-up choices.",
    href: routes.guideUpgrades(),
    icon: <TrendingUp size={28} />,
    gradient: "from-brand-primary/20 to-brand-secondary/20",
    badge: "NEW",
  },
  {
    title: "Infusions Database",
    description:
      "Elemental enhancements that add damage-over-time, crowd control, and status effects to your arsenal.",
    href: routes.infusions(),
    icon: <Sparkles size={28} />,
    gradient: "from-status-success/20 to-brand-accent/20",
  },
  {
    title: "Knowledge Tracker",
    description:
      "Track the Knowledge needed to unlock units and spells. Forecast your earnings and plan your next unlocks.",
    href: routes.guideKnowledgeTracker(),
    icon: <Calculator size={28} />,
    gradient: "from-amber-500/20 to-yellow-600/20",
    badge: "NEW",
  },
  {
    title: "Map Chests",
    description:
      "Chest spawn locations, rewards, and rarities for each arena map.",
    href: routes.guideMapChests(),
    icon: <Map size={28} />,
    gradient: "from-amber-500/20 to-yellow-600/20",
    badge: "NEW",
  },
];

export default function GuidePage() {
  return (
    <PageShell
      title="Game Guide"
      subtitle="A reference for game systems and mechanics."
      maxWidth="6xl"
      breadcrumbs={[{ label: "Guide", href: "/guide" }]}
    >
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-brand-primary/10 via-brand-secondary/5 to-transparent border border-brand-primary/20 p-6 md:p-10 mb-8 md:mb-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1.5">
              <Swords size={20} className="text-brand-primary" />
              <Shield size={20} className="text-brand-secondary" />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase text-text-muted">
              Spellcasters Chronicles
            </span>
          </div>
          <p className="text-text-secondary text-base md:text-lg max-w-2xl leading-relaxed">
            Whether you&apos;re a new player learning the ropes or a veteran
            optimizing your builds, this guide hub has everything you need.
            Explore game mechanics, master ranked play, and discover powerful
            class upgrades.
          </p>
        </div>
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-brand-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {GUIDE_CARDS.map((card) => (
          <GuideCard key={card.href} {...card} />
        ))}
      </div>

      {/* Quick CTA */}
      <div className="mt-10 md:mt-14 text-center">
        <p className="text-text-muted text-sm mb-4">
          Ready to put your knowledge to the test?
        </p>
        <Link
          href="/deck-builder"
          className="inline-block px-8 py-3 bg-linear-to-r from-brand-primary to-brand-secondary text-text-primary font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md shadow-brand-primary/20"
        >
          Launch Deck Builder
        </Link>
      </div>
    </PageShell>
  );
}
