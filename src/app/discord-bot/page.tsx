"use client";

import { Search, Link as LinkIcon, Bot } from "lucide-react";

export default function DiscordBotPage() {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-medium mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
          </span>
          Coming Soon
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">
          Spellcasters Community Bot
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Enhance your Discord server with the ultimate utility tool for SpellcastersDB.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Feature 1: Deck Embeds */}
        <div className="relative group overflow-hidden rounded-2xl bg-surface-raised border border-white/5 hover:border-brand-primary/30 transition-all p-8">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <LinkIcon size={120} />
          </div>
          <div className="relative z-10">
            <div className="h-12 w-12 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary mb-6">
              <LinkIcon size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Rich Deck Embeds</h3>
            <p className="text-slate-400 leading-relaxed">
              Share your strategies with style. Simply paste a SpellcastersDB deck link in your chat, and the bot will automatically convert it into a beautiful, readable embed showcasing your units and spells. No more messy long URLs.
            </p>
          </div>
        </div>

        {/* Feature 2: Smart Search */}
        <div className="relative group overflow-hidden rounded-2xl bg-surface-raised border border-white/5 hover:border-brand-primary/30 transition-all p-8">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Search size={120} />
          </div>
          <div className="relative z-10">
            <div className="h-12 w-12 rounded-lg bg-brand-secondary/20 flex items-center justify-center text-brand-secondary mb-6">
              <Search size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Instant Lookups</h3>
            <p className="text-slate-400 leading-relaxed">
              Need stats fast? Use <code className="bg-black/30 px-2 py-0.5 rounded text-brand-accent">/search</code> to instantly find detailed information about any unit, spell, or item. Featuring smart fuzzy matching to find what you need, even if you make a typo.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-linear-to-br from-surface-raised to-surface-main border border-white/5 p-8 md:p-12 text-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="mx-auto h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
            <Bot size={32} className="text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">Get Ready to Summon</h2>
          <p className="text-slate-400 mb-8">
            The Spellcasters Community Bot is being actively developed by the community, for the community. It&apos;s open-source and built to be efficient, reliable, and easy to use.
          </p>
          
          <button 
            disabled
            className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed font-medium flex items-center justify-center gap-2 mx-auto"
          >
            <Bot size={18} />
            Invite Link Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}
