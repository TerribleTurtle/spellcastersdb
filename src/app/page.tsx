import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-main text-foreground">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-2">
          {/* Glow effect behind title */}
          <div className="absolute -inset-1 blur-3xl bg-gradient-to-r from-brand-primary/40 to-brand-secondary/40 opacity-50"></div>
          <h1 className="relative text-6xl md:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent animate-pulse">
            SpellcastersDB
          </h1>
        </div>
        
        <p className="mt-6 text-xl text-gray-400 max-w-2xl">
          The definitive community hub for <span className="text-white font-medium">Spellcasters Chronicles</span>. 
          Master the meta with comprehensive data on units, heroes, spells, and more.
        </p>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 w-full max-w-5xl">
          
          {/* Heroes Card */}
          <Link 
            href="/heroes/archmage" 
            className="group relative overflow-hidden rounded-2xl bg-surface-card border border-white/10 p-8 transition-all hover:bg-surface-hover hover:border-brand-primary/50 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <span className="text-4xl mb-4 block">👑</span>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">Heroes</h2>
              <p className="text-gray-400">Deep dive into hero abilities, stats, and ultimate powers.</p>
            </div>
          </Link>

          {/* Units Card */}
          <Link 
            href="/units/titan" 
            className="group relative overflow-hidden rounded-2xl bg-surface-card border border-white/10 p-8 transition-all hover:bg-surface-hover hover:border-brand-accent/50 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <span className="text-4xl mb-4 block">⚔️</span>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-brand-accent transition-colors">Units</h2>
              <p className="text-gray-400">Explore the complete unit database, from Faeries to Titans.</p>
            </div>
          </Link>

          {/* Consumables Card */}
          <Link 
            href="/consumables" 
            className="group relative overflow-hidden rounded-2xl bg-surface-card border border-white/10 p-8 transition-all hover:bg-surface-hover hover:border-brand-secondary/50 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <span className="text-4xl mb-4 block">🧪</span>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-brand-secondary transition-colors">Items</h2>
              <p className="text-gray-400">Browse potions, scrolls, and artifacts to turn the tide.</p>
            </div>
          </Link>

          {/* Debug/API Card */}
          <Link 
            href="/debug" 
            className="group relative overflow-hidden rounded-2xl bg-surface-card border border-white/10 p-8 transition-all hover:bg-surface-hover hover:border-green-400/50 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <span className="text-4xl mb-4 block">🔧</span>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Debug</h2>
              <p className="text-gray-400">Inspect the raw game data and verify API integrity.</p>
            </div>
          </Link>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 pb-8 text-center text-gray-500 text-sm">
        <p>Built by the Community for the Community.</p>
        <p className="mt-2 text-xs opacity-50">Not affiliated with the official game developers.</p>
      </footer>
    </div>
  );
}
