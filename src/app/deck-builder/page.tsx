import { Metadata } from 'next';
import { Sparkles, Wand2, Shield, Swords } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Deck Builder',
  description: 'Build and optimize your Spellcasters Chronicles decks with our advanced deck builder.',
};

export default function DeckBuilderPage() {
  return (
    <div className="min-h-screen bg-surface-main text-foreground pt-20 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <Wand2 className="w-12 h-12 text-brand-primary animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold tracking-wider text-transparent bg-clip-text bg-linear-to-r from-brand-primary via-brand-secondary to-brand-accent">
              THE FORGE
            </h1>
            <Wand2 className="w-12 h-12 text-brand-secondary animate-pulse" />
          </div>
          <p className="text-xl md:text-2xl text-slate-300 mb-4">
            Advanced Deck Builder
          </p>
          <div className="inline-block px-4 py-2 rounded-full bg-surface-card border border-brand-primary/30 backdrop-blur-sm">
            <span className="text-sm font-mono text-brand-accent">Coming Soon™</span>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Feature 1 */}
          <div className="group bg-surface-card border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:border-brand-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-brand-primary mb-2 tracking-wide">
                SMART VALIDATION
              </h3>
              <p className="text-sm text-slate-400">
                Real-time deck validation against game rules. No more invalid decks.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group bg-surface-card border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:border-brand-secondary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-brand-secondary to-brand-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-brand-secondary mb-2 tracking-wide">
                INSTANT SHARING
              </h3>
              <p className="text-sm text-slate-400">
                Share your decks with a single link. Beautiful OG images for Discord.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group bg-surface-card border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:border-brand-accent/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-brand-accent to-brand-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Swords className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-brand-accent mb-2 tracking-wide">
                COMMUNITY DECKS & GUIDES
              </h3>
              <p className="text-sm text-slate-400">
                Browse popular decks and strategy guides shared by the community.
              </p>
            </div>
          </div>
        </div>

        {/* Roadmap Section */}
        <div className="bg-surface-card border border-white/10 rounded-xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary mb-6 tracking-wide">
            WHAT&apos;S COMING
          </h2>
          
          <div className="space-y-4">
            {[
              { phase: 'Phase 1', title: 'Deck State Management', desc: 'Spellcaster selection + 5-card deck builder with drag-and-drop', status: 'In Progress' },
              { phase: 'Phase 2', title: 'The Invariants', desc: 'Real-time validation for rank limits, role restrictions, and deck rules', status: 'Planned' },
              { phase: 'Phase 3', title: 'URL Sharing', desc: 'Compressed deck URLs with auto-generated social preview images', status: 'Planned' },
              { phase: 'Phase 4', title: 'Community Hub', desc: 'Browse and share decks, strategy guides, and tips from other players', status: 'Future' },
            ].map((item, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-4 p-4 rounded-lg bg-surface-main/50 border border-white/5 hover:border-brand-primary/30 transition-colors"
              >
                <div className="shrink-0 w-24">
                  <span className="text-xs font-mono text-brand-accent">{item.phase}</span>
                </div>
                <div className="grow">
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
                <div className="shrink-0">
                  <span className={`text-xs px-3 py-1 rounded-full font-mono ${
                    item.status === 'In Progress' 
                      ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' 
                      : item.status === 'Planned'
                      ? 'bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30'
                      : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-4">
            Help improve the database by contributing data!
          </p>
          <a 
            href="https://github.com/TerribleTurtle/spellcasters-community-api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r from-brand-primary to-brand-secondary text-white font-bold tracking-wide hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            Contribute to Community API
          </a>
        </div>
      </div>
    </div>
  );
}
