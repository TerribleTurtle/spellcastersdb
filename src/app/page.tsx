import { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Database,
  Github,
  Layers,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Swords,
  Wand2,
} from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import {
  getSpellcasters,
  getSpells,
  getTitans,
  getUnits,
} from "@/services/api/api";

export const metadata: Metadata = {
  title: "SpellcastersDB - Spellcasters Chronicles Community Hub",
  description:
    "A community database and deck builder for Spellcasters Chronicles.",
  openGraph: {
    title: "SpellcastersDB - Spellcasters Chronicles Community Hub",
    description:
      "A community database and deck builder for Spellcasters Chronicles.",
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpellcastersDB - Spellcasters Chronicles Community Hub",
    description:
      "A community database and deck builder for Spellcasters Chronicles.",
    images: ["/og-default.png"],
  },
};

// Revalidate every hour
export const revalidate = 3600;

export default async function Home() {
  const [units, spells, titans, spellcasters] = await Promise.all([
    getUnits(),
    getSpells(),
    getTitans(),
    getSpellcasters(),
  ]);

  const databaseCategories = [
    {
      label: "Units",
      value: units.length,
      icon: Swords,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Spells",
      value: spells.length,
      icon: Sparkles,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Titans",
      value: titans.length,
      icon: ShieldAlert,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      label: "Spellcasters",
      value: spellcasters.length,
      icon: Wand2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <PageShell
      title="Spellcasters Chronicles Database"
      subtitle="Community tools for deck building and game data."
      maxWidth="page-grid"
      className="pb-20"
    >
      {/* Hero Actions */}
      <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
        <Link
          href="/deck-builder"
          data-testid="home-hero-deckbuilder"
          className="group relative overflow-hidden rounded-3xl bg-surface-card border border-border-default p-6 md:p-10 hover:border-brand-primary/50 transition-all hover:bg-surface-raised hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"
          style={{ animationDelay: "0ms" }}
        >
          <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500">
            <Layers
              size={200}
              className="w-40 h-40 md:w-[200px] md:h-[200px]"
            />
          </div>
          <div className="relative z-10">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-linear-to-br from-brand-primary/20 to-brand-primary/5 flex items-center justify-center text-brand-primary mb-4 md:mb-8 group-hover:scale-110 transition-transform shadow-inner shadow-brand-primary/20">
              <Layers className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 md:mb-3">
              Deck Builder
            </h2>
            <p className="text-text-muted mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
              Build, save, and share your most powerful loadouts and team
              strategies.
            </p>
            <span className="inline-flex items-center text-brand-primary font-semibold group-hover:gap-3 transition-all text-sm md:text-base">
              Launch Builder{" "}
              <ArrowRight
                size={18}
                className="ml-1 w-4 h-4 md:w-[18px] md:h-[18px]"
              />
            </span>
          </div>
        </Link>

        <Link
          href="/database"
          data-testid="home-hero-database"
          className="group relative overflow-hidden rounded-3xl bg-surface-card border border-border-default p-6 md:p-10 hover:border-brand-secondary/50 transition-all hover:bg-surface-raised hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"
          style={{ animationDelay: "150ms" }}
        >
          <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:-rotate-12 duration-500">
            <Database
              size={200}
              className="w-40 h-40 md:w-[200px] md:h-[200px]"
            />
          </div>
          <div className="relative z-10">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-linear-to-br from-brand-secondary/20 to-brand-secondary/5 flex items-center justify-center text-brand-secondary mb-4 md:mb-8 group-hover:scale-110 transition-transform shadow-inner shadow-brand-secondary/20">
              <Database className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 md:mb-3">
              Unit Database
            </h2>
            <p className="text-text-muted mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
              Browse detailed stats, abilities, and mechanics for every entity
              in the game.
            </p>
            <span className="inline-flex items-center text-brand-secondary font-semibold group-hover:gap-3 transition-all text-sm md:text-base">
              Explore Archive{" "}
              <ArrowRight
                size={18}
                className="ml-1 w-4 h-4 md:w-[18px] md:h-[18px]"
              />
            </span>
          </div>
        </Link>

        <Link
          href="/guide"
          data-testid="home-hero-guide"
          className="group relative overflow-hidden rounded-3xl bg-surface-card border border-border-default p-6 md:p-10 hover:border-brand-accent/50 transition-all hover:bg-surface-raised hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"
          style={{ animationDelay: "300ms" }}
        >
          <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:rotate-12 duration-500">
            <BookOpen
              size={200}
              className="w-40 h-40 md:w-[200px] md:h-[200px]"
            />
          </div>
          <div className="relative z-10">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-linear-to-br from-brand-accent/20 to-brand-accent/5 flex items-center justify-center text-brand-accent mb-4 md:mb-8 group-hover:scale-110 transition-transform shadow-inner shadow-brand-accent/20">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 md:mb-3">
              Game Guide
            </h2>
            <p className="text-text-muted mb-4 md:mb-6 text-base md:text-lg leading-relaxed">
              Master the mechanics, understand the rules, and elevate your
              gameplay.
            </p>
            <span className="inline-flex items-center text-brand-accent font-semibold group-hover:gap-3 transition-all text-sm md:text-base">
              Read Guide{" "}
              <ArrowRight
                size={18}
                className="ml-1 w-4 h-4 md:w-[18px] md:h-[18px]"
              />
            </span>
          </div>
        </Link>
      </div>

      {/* Database Overview */}
      <div className="mb-12 md:mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
        <div className="mb-6 md:mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-1 md:mb-2">
            Explore the Database
          </h3>
          <p className="text-text-muted text-base md:text-lg">
            A comprehensive archive of all game entities.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {databaseCategories.map((cat) => (
            <Link
              key={cat.label}
              href="/database"
              className={`flex flex-col items-center justify-center p-4 md:p-8 rounded-2xl bg-surface-card border ${cat.border} hover:bg-surface-raised hover:scale-105 transition-all group`}
            >
              <div
                className={`h-10 w-10 md:h-16 md:w-16 rounded-full flex items-center justify-center ${cat.bg} ${cat.color} mb-2 md:mb-4 group-hover:scale-110 transition-transform`}
              >
                <cat.icon className="w-5 h-5 md:w-8 md:h-8" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-text-primary mb-1">
                {cat.value}
              </div>
              <div className="text-xs md:text-sm font-medium text-text-muted uppercase tracking-wider group-hover:text-text-primary transition-colors">
                {cat.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Community Call to Action */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
        <div className="bg-discord/10 hover:bg-discord/15 border border-discord/30 rounded-3xl p-6 md:p-10 relative overflow-hidden group transition-colors flex flex-col items-start">
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <MessageSquare
              size={160}
              className="w-32 h-32 md:w-40 md:h-40 text-discord"
            />
          </div>
          <div className="relative z-10 flex flex-col h-full items-start">
            <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-2 md:mb-3">
              Join the Community
            </h3>
            <p className="text-text-muted mb-6 md:mb-8 text-sm md:text-lg max-w-sm flex-1">
              Connect with other players, share your favorite decks, and help us
              keep the database accurate and up to date.
            </p>
            <a
              href="https://discord.com/invite/spellcasters-chronicles-1425209254847058003"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl bg-discord hover:bg-discord/80 text-white font-semibold transition-all hover:scale-105 text-sm md:text-base w-full sm:w-auto"
            >
              <MessageSquare size={18} className="md:w-5 md:h-5" />
              Join the Official Game Discord
            </a>
          </div>
        </div>

        <div className="bg-surface-card hover:bg-surface-hover border border-border-default rounded-3xl p-6 md:p-10 relative overflow-hidden group transition-colors flex flex-col items-start">
          <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Github size={160} className="w-32 h-32 md:w-40 md:h-40" />
          </div>
          <div className="relative z-10 flex flex-col h-full items-start">
            <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-2 md:mb-3">
              Contribute Data
            </h3>
            <p className="text-text-muted mb-6 md:mb-8 text-sm md:text-lg max-w-sm flex-1">
              SpellcastersDB is open source. Help us improve the community api
              by contributing data or code to the repository.
            </p>
            <a
              href="https://github.com/TerribleTurtle/spellcasters-community-api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl bg-surface-dim hover:bg-surface-hover border border-border-default text-text-primary font-semibold transition-all hover:scale-105 text-sm md:text-base w-full sm:w-auto"
            >
              <Github size={18} className="md:w-5 md:h-5" />
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
