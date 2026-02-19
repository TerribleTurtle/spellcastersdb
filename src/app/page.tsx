import Link from "next/link";
import { Metadata } from "next";
import { Layers, Database, BookOpen, ArrowRight, Activity, Users, PlusCircle, MinusCircle, FilePenLine } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { fetchChangelog } from "@/services/api/patch-history";
import { getUnits, getSpells, getTitans, getSpellcasters } from "@/services/api/api";

export const metadata: Metadata = {
  title: "SpellcastersDB - The Community Hub",
  description:
    "A community database and deck builder for Spellcasters Chronicles.",
};

// Revalidate every hour
export const revalidate = 3600;

export default async function Home() {
  const [patches, units, spells, titans, spellcasters] = await Promise.all([
    fetchChangelog(),
    getUnits(),
    getSpells(),
    getTitans(),
    getSpellcasters(),
  ]);

  const latestPatch = patches[0];
  
  const stats = [
    { label: "Units", value: units.length },
    { label: "Spells", value: spells.length },
    { label: "Titans", value: titans.length },
    { label: "Spellcasters", value: spellcasters.length },
  ];

  return (
    <PageShell
      title="Spellcasters Chronicles Database"
      subtitle="Community tools for deck building and game data."
      maxWidth="page-grid"
      className="pb-20"
    >
      {/* Hero Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <Link
          href="/deck-builder"
          className="group relative overflow-hidden rounded-2xl bg-surface-card border border-border-default p-8 hover:border-brand-primary/50 transition-all hover:bg-surface-raised animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"
          style={{ animationDelay: "0ms" }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Layers size={100} />
          </div>
          <div className="relative z-10">
            <div className="h-12 w-12 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
              <Layers size={24} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Deck Builder
            </h2>
            <p className="text-muted-foreground mb-4">
              Build, save, and share your loadouts.
            </p>
            <span className="inline-flex items-center text-brand-primary font-medium group-hover:gap-2 transition-all">
              Launch Builder <ArrowRight size={16} className="ml-1" />
            </span>
          </div>
        </Link>

        <Link
          href="/database"
          className="group relative overflow-hidden rounded-2xl bg-surface-card border border-border-default p-8 hover:border-brand-secondary/50 transition-all hover:bg-surface-raised animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"
          style={{ animationDelay: "150ms" }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Database size={100} />
          </div>
          <div className="relative z-10">
            <div className="h-12 w-12 rounded-lg bg-brand-secondary/20 flex items-center justify-center text-brand-secondary mb-6 group-hover:scale-110 transition-transform">
              <Database size={24} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Unit Database
            </h2>
            <p className="text-muted-foreground mb-4">
              Browse detailed stats for every unit, spell, and titan.
            </p>
            <span className="inline-flex items-center text-brand-secondary font-medium group-hover:gap-2 transition-all">
              Explore Archive <ArrowRight size={16} className="ml-1" />
            </span>
          </div>
        </Link>
        
         <Link
          href="/guide"
          className="group relative overflow-hidden rounded-2xl bg-surface-card border border-border-default p-8 hover:border-brand-accent/50 transition-all hover:bg-surface-raised animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"
          style={{ animationDelay: "300ms" }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen size={100} />
          </div>
          <div className="relative z-10">
            <div className="h-12 w-12 rounded-lg bg-brand-accent/20 flex items-center justify-center text-brand-accent mb-6 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Game Guide
            </h2>
            <p className="text-muted-foreground mb-4">
              Learn the mechanics and understand the game.
            </p>
            <span className="inline-flex items-center text-brand-accent font-medium group-hover:gap-2 transition-all">
              Read Guide <ArrowRight size={16} className="ml-1" />
            </span>
          </div>
        </Link>
      </div>

      {/* Recent Activity / Patch Notes */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">
              <Activity className="text-brand-primary" size={20} />
              Latest Changes
            </h3>
            <Link 
              href="/changes" 
              className="text-sm text-brand-primary hover:text-brand-accent transition-colors"
            >
              View Full History <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="bg-surface-card border border-border-default rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-lg font-bold text-text-primary">
                        {latestPatch?.version || "Latest Patch"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        {latestPatch?.date ? new Date(latestPatch.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long', 
                            day: 'numeric'
                        }) : "Unknown Date"}
                    </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                    Latest
                </span>
            </div>
            
            <div className="space-y-3 mb-4">
                {(latestPatch ? latestPatch.changes.slice(0, 3) : []).map((change, i) => (
                    <div key={i} className="flex gap-3 text-sm border-l-2 border-border-default pl-3 py-1">
                        <span className={`font-mono text-xs px-1.5 py-0.5 rounded uppercase flex items-center gap-1 ${
                            change.change_type === 'add' ? 'bg-status-success-muted text-status-success-text' :
                            change.change_type === 'delete' ? 'bg-status-danger-muted text-status-danger-text' :
                            'bg-status-info-muted text-status-info-text'
                        }`}>
                            {change.change_type === 'add' && <PlusCircle size={10} />}
                            {change.change_type === 'delete' && <MinusCircle size={10} />}
                            {(!change.change_type || change.change_type === 'edit') && <FilePenLine size={10} />}
                            {change.change_type || 'edit'}
                        </span>
                        <span className="text-text-secondary line-clamp-1">
                            {change.name}: {change.field}
                        </span>
                    </div>
                ))}
            </div>

            {!latestPatch && (
                <div className="text-center py-8 text-muted-foreground bg-surface-dim rounded-lg mb-4">
                    No recent changes found.
                </div>
            )}
            
            <Link 
                href="/changes"
                className="block w-full text-center py-2 rounded-lg bg-surface-card hover:bg-surface-hover text-sm text-text-secondary transition-colors"
            >
                Read full patch notes
            </Link>
          </div>
        </div>

        {/* Community / Stats (Placeholder for now) */}
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                <Users className="text-brand-primary" size={20} />
                Community
            </h3>
            <div className="bg-surface-card border border-border-default rounded-xl p-6 space-y-4">
                <p className="text-muted-foreground text-sm">
                    Join the conversation and help us keep the database accurate.
                </p>
                <a 
                    href="https://discord.com/invite/spellcasters-chronicles-1425209254847058003"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-text-primary font-medium transition-colors"
                >
                    Join Discord
                </a>
                <a 
                    href="https://github.com/TerribleTurtle/spellcasters-community-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-border-default text-text-primary font-medium transition-colors"
                >
                    Contribute Data
                </a>
            </div>

            {/* Site Stats */}
            <div className="bg-surface-card border border-border-default rounded-xl p-6">
                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
                    Database Stats
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-surface-dim p-3 rounded-lg border border-border-subtle">
                            <div className="text-2xl font-bold text-text-primary mb-1">
                                {stat.value}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </PageShell>
  );
}
