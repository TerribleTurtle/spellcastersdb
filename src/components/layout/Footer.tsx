'use client';



export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface-main/50 py-12 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          
          {/* Left: Branding & Disclaimer */}
          <div className="flex flex-col items-center gap-2 md:items-start text-center md:text-left">
            <span className="text-lg font-bold tracking-wider text-slate-200">
              SPELLCASTERS<span className="text-brand-primary">DB</span>
            </span>
            <p className="text-sm text-slate-500 max-w-md">
              A community-built database for Spellcasters Chronicles. 
              Not affiliated with the game developers. All game assets property of their respective owners.
            </p>
          </div>

          {/* Right: Links */}
          <div className="flex flex-col items-center gap-4 md:items-end">
            <div className="flex gap-6">
              <a href="https://store.steampowered.com/app/2458470/Spellcasters_Chronicles/" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-brand-accent transition-colors">
                Steam
              </a>
              <a href="https://discord.com/invite/spellcasters-chronicles-1425209254847058003" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-brand-accent transition-colors">
                Game Dev Discord
              </a>
              <a href="https://github.com/TerribleTurtle/spellcasters-community-api" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-brand-accent transition-colors">
                Community API
              </a>
            </div>
            <div className="text-xs text-slate-600">
              Built by <span className="font-medium text-slate-400">TerribleTurtles</span>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
