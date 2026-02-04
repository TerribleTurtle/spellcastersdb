"use client";

import { DeckStats } from "@/types/deck";
import { Hero as Spellcaster } from "@/types/api";
import { CheckCircle2, AlertTriangle, Download, Trash2, Link as LinkIcon } from "lucide-react";

interface ForgeControlsProps {
    spellcaster: Spellcaster | null;
    stats: DeckStats; // We computed stats in hook, pass them down
    onClear: () => void;
    // For MVP we might just show spellcaster name or allow selection dialog (simplified)
}

export function ForgeControls({ spellcaster, stats, onClear }: ForgeControlsProps) {
  return (
    <div className="h-full bg-surface-main border-l border-white/10 flex flex-col p-4 space-y-6">
       {/* Spellcaster Section */}
       <div className="space-y-2">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Spellcaster</h3>
           <div className="w-full h-32 rounded-lg border border-brand-primary/30 bg-brand-primary/5 flex items-center justify-center cursor-pointer hover:border-brand-primary/50 transition-colors">
               {spellcaster ? (
                   <div className="text-center">
                       <p className="font-bold text-white">{spellcaster.name}</p>
                       <span className="text-xs text-brand-primary">Selected</span>
                   </div>
               ) : (
                   <span className="text-sm text-gray-400">Select Spellcaster...</span>
               )}
           </div>
       </div>

       {/* Validation Status */}
       <div className={`rounded-lg p-4 border ${stats.isValid ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center gap-3 mb-2">
                {stats.isValid ? (
                    <CheckCircle2 className="text-green-500" />
                ) : (
                    <AlertTriangle className="text-red-500" />
                )}
                <span className={`font-bold ${stats.isValid ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.isValid ? "Deck Valid" : "Invalid Deck"}
                </span>
            </div>
            {!stats.isValid && (
                <ul className="list-disc list-inside text-xs text-red-300 space-y-1">
                    {stats.validationErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                    ))}
                </ul>
            )}
       </div>

       {/* Stats Summary */}
       <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Metrics</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
             <div className="bg-surface-card p-2 rounded">
                 <span className="block text-xs text-gray-500">Avg Pop</span>
                 <span className="font-mono font-bold">{stats.averageCost.toFixed(1)}</span>
             </div>
             <div className="bg-surface-card p-2 rounded">
                 <span className="block text-xs text-gray-500">Avg Speed</span>
                 <span className="font-mono font-bold text-brand-secondary">{stats.averageChargeTime.toFixed(1)}s</span>
             </div>
          </div>
       </div>

       <div className="grow" />

       {/* Actions */}
       <div className="space-y-3">
           <button className="w-full flex items-center justify-center gap-2 py-2 rounded bg-surface-card border border-white/10 hover:bg-white/5 transition-colors text-sm font-bold">
               <Download size={16} /> Export JSON
           </button>
           <button className="w-full flex items-center justify-center gap-2 py-2 rounded bg-surface-card border border-white/10 hover:bg-white/5 transition-colors text-sm font-bold">
               <LinkIcon size={16} /> Share Link
           </button>
           <button 
                onClick={onClear}
                className="w-full flex items-center justify-center gap-2 py-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-bold"
            >
               <Trash2 size={16} /> Clear Deck
           </button>
       </div>
    </div>
  );
}
