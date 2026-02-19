import Link from "next/link";
import { Search, Link as LinkIcon, Bot, Server, Zap } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";

export const metadata = {
  title: "Discord Bot - SpellcastersDB",
  description:
    "Add the SpellcastersDB bot to your server. Search cards, build decks, and access game data directly quickly.",
};

export default function DiscordBotPage() {
  return (
    <PageShell
      title="Spellcasters Community Bot"
      subtitle="Enhance your Discord server with the utility tool for SpellcastersDB."
      maxWidth="7xl"
    >
      <div className="flex justify-center mb-12 -mt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
          </span>
          Coming Soon
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
        {/* Features Left */}
        <div className="space-y-6">
          <div className="bg-surface-card border border-border-default p-6 rounded-xl hover:border-brand-primary/30 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary mb-4">
              <Search size={20} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              Instant Card Search
            </h3>
            <p className="text-text-muted">
              Search for any unit, spell, or item directly in Discord. Get detailed stats, abilities, and images instantly.
            </p>
          </div>

          <div className="bg-surface-card border border-border-default p-6 rounded-xl hover:border-brand-primary/30 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-brand-secondary/20 flex items-center justify-center text-brand-secondary mb-4">
              <LinkIcon size={20} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              Deck Link Previews
            </h3>
            <p className="text-text-muted">
              Share deck links and get beautiful, automatic previews with the spellcaster, mana curve, and key units.
            </p>
          </div>
          
           <div className="bg-surface-card border border-border-default p-6 rounded-xl hover:border-brand-primary/30 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Zap size={20} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              Meta Updates
            </h3>
            <p className="text-text-muted">
              Subscribe to patch notes. Get notified when new balance changes drop.
            </p>
          </div>
        </div>

        {/* Preview Right */}
        <div className="relative">
            <div className="absolute inset-0 bg-brand-primary/10 blur-3xl rounded-full opacity-20" />
            <div className="relative bg-surface-raised border border-border-default rounded-xl p-8 shadow-2xl">
                <div className="flex items-start gap-4 mb-6">
                    <div className="h-10 w-10 rounded-full bg-brand-primary flex items-center justify-center text-text-primary shrink-0">
                        <Bot size={24} />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-text-primary">SpellcastersBot</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#5865F2] text-text-primary font-medium">BOT</span>
                        </div>
                        <p className="text-xs text-text-muted">Today at 4:20 PM</p>
                    </div>
                </div>
                
                <div className="ml-14 bg-[#2f3136] rounded-l-md border-l-4 border-brand-primary p-4 max-w-sm">
                    <div className="font-bold text-brand-primary mb-1">Fire Imp</div>
                    <p className="text-sm text-text-secondary mb-3">Unit • Rank I • Inferno</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-text-muted mb-3">
                        <div>Health: <span className="text-text-primary">120</span></div>
                        <div>Damage: <span className="text-text-primary">15</span></div>
                        <div>Range: <span className="text-text-primary">3.5</span></div>
                        <div>Speed: <span className="text-text-primary">Fast</span></div>
                    </div>
                    <div className="text-xs text-text-muted italic">
                        &quot;Small, fast, and annoying. Explodes on death.&quot;
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-12 border-t border-border-default">
        <h2 className="text-3xl font-bold text-text-primary mb-6">
          Ready to invite?
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <button 
             disabled 
             className="px-8 py-4 bg-surface-hover text-text-muted font-bold rounded-xl cursor-not-allowed opacity-50 flex items-center gap-2"
            >
                <Server size={20} />
                Add to Server
            </button>
            <Link
                href="/"
                className="px-8 py-4 bg-surface-card hover:bg-surface-hover border border-border-default text-text-primary font-bold rounded-xl transition-colors"
            >
                Back to Home
            </Link>
        </div>
        <p className="mt-4 text-sm text-text-dimmed">
            Coming soon to a server near you.
        </p>
      </div>
    </PageShell>
  );
}
