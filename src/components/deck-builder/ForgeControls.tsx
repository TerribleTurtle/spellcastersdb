import { useState } from "react";
import { Deck, DeckStats } from "@/types/deck";
import { Spellcaster } from "@/types/api";
import { CheckCircle2, AlertTriangle, Download, Trash2, Link as LinkIcon, Check } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { cn, getCardImageUrl } from "@/lib/utils";
import { encodeDeck } from "@/lib/encoding";

interface ForgeControlsProps {
    spellcaster: Spellcaster | null;
    stats: DeckStats;
    validation: {
        isValid: boolean;
        errors: string[];
        reminder: string | null;
    };
    onClear: () => void;
    deck: Deck;
}

export function ForgeControls({ spellcaster, stats, validation, onClear, deck }: ForgeControlsProps) {
  const { isOver, setNodeRef } = useDroppable({
      id: "spellcaster-zone",
      data: { type: 'spellcaster' }
  });

  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const hash = encodeDeck(deck);
    const url = `${window.location.origin}${window.location.pathname}?d=${hash}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Clipboard write failed:", err);
        // Optionally show an error toast
      });
  };

  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(deck, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", "spellcasters_deck.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

   const [showClearConfirm, setShowClearConfirm] = useState(false);

   const handleClearClick = () => {
       if (showClearConfirm) {
           onClear();
           setShowClearConfirm(false);
       } else {
           setShowClearConfirm(true);
           setTimeout(() => setShowClearConfirm(false), 3000); // Reset after 3s
       }
   };

   return (
    <div className="h-full bg-surface-main border-l border-white/10 flex flex-col p-4 overflow-y-auto custom-scrollbar">
       {/* Spellcaster Spotlight */}
       {spellcaster ? (
           <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500 bg-surface-card border border-brand-primary/30 rounded-lg overflow-hidden shadow-2xl flex flex-col">
               {/* Header Image & Title */}
                <div className="relative w-full h-24 group/hero shrink-0">
                   <div className="absolute inset-0 bg-gray-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={getCardImageUrl(spellcaster)} 
                            alt={spellcaster.name} 
                            className="w-full h-full object-cover object-[center_25%] transition-transform duration-1000 group-hover/hero:scale-110"
                        />
                        {/* Glass Overlay for name */}
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-surface-card/10 to-transparent" />
                   </div>
                   
                   <div className="absolute bottom-0 left-0 right-0 p-3 pt-6">
                       <div className="relative">
                           <h2 className="text-xl font-black text-white leading-tight uppercase tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                               {spellcaster.name}
                           </h2>
                       </div>
                   </div>
               </div>

               {/* Passives Section - Scrollable */}
                <div className="p-4 space-y-4 bg-surface-card border-t border-white/5 max-h-[30vh] overflow-y-auto custom-scrollbar">
                   <div className="flex items-center justify-between">
                       <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                           Passive Abilities
                       </h3>
                       <div className="h-1 w-12 bg-white/5 rounded-full" />
                   </div>
                   
                   <div className="space-y-2">
                       {spellcaster.abilities.passive.map((ability) => (
                           <div key={ability.ability_id} className="group/ability relative pl-3 py-2 border-l-2 border-white/20 hover:border-brand-secondary transition-all bg-linear-to-r from-white/5 to-transparent hover:from-brand-secondary/10">
                               <p className="text-sm font-black text-gray-100 group-hover/ability:text-brand-secondary transition-colors uppercase tracking-wide">
                                   {ability.name}
                               </p>
                               <p className="text-xs text-brand-blue-100/80 leading-snug mt-1">
                                   {ability.description}
                               </p>
                           </div>
                       ))}
                   </div>
               </div>
           </div>
       ) : (
           <div 
                ref={setNodeRef}
                className={cn(
                    "w-full aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all mb-6",
                    isOver ? "border-brand-primary bg-brand-primary/20 scale-105" : "border-white/20 bg-white/5 text-gray-500"
                )}
           >
               <p className="text-sm font-bold mb-1">No Spellcaster Selected</p>
               <p className="text-xs opacity-70">Drag a Commander here or to the deck tray</p>
           </div>
       )}

       {/* Divider */}
       <hr className="border-white/5 my-2" />

       {/* Stats Summary */}
       <div className="space-y-2 shrink-0">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Metrics</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
             <div className="bg-surface-card p-2 rounded border border-white/5">
                 <span className="block text-xs text-gray-500">Avg Pop</span>
                 <span className="font-mono font-bold text-white">{stats.averageCost.toFixed(1)}</span>
             </div>
             <div className="bg-surface-card p-2 rounded border border-white/5">
                 <span className="block text-xs text-gray-500">Avg Speed</span>
                 <span className="font-mono font-bold text-brand-secondary">{stats.averageChargeTime.toFixed(1)}s</span>
             </div>
          </div>
       </div>

       <div className="grow" />

       {/* Divider */}
       <hr className="border-white/5 my-4" />

       {/* Validation Status (Moved Down) */}
       <div className={cn(
           "rounded-lg p-4 border transition-colors mb-4 shrink-0",
           stats.isValid ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
       )}>
            <div className="flex items-center gap-3 mb-2">
                {stats.isValid ? (
                    <CheckCircle2 className="text-green-500" />
                ) : (
                    <AlertTriangle className="text-red-500" />
                )}
                <span className={cn("font-bold", stats.isValid ? "text-green-400" : "text-red-400")}>
                    {stats.isValid ? "Deck Valid" : "Invalid Deck"}
                </span>
            </div>
            {!validation.isValid && (
                <ul className="list-disc list-inside text-xs text-red-300 space-y-1">
                    {validation.errors.slice(0, 3).map((err, i) => (
                        <li key={i}>{err}</li>
                    ))}
                    {validation.errors.length > 3 && <li>...and more</li>}
                </ul>
            )}
            {validation.reminder && (
                <p className="text-xs text-yellow-400 mt-2 italic opacity-70">
                    💡 {validation.reminder}
                </p>
            )}
       </div>

       {/* Actions */}
       <div className="space-y-3 shrink-0 pb-4">
           <button 
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 py-2 rounded bg-surface-card border border-white/10 hover:bg-white/5 transition-colors text-sm font-bold text-gray-300"
            >
               <Download size={16} /> Export JSON
           </button>
           <button 
                onClick={handleShare}
                className={cn(
                    "w-full flex items-center justify-center gap-2 py-2 rounded border transition-all text-sm font-bold",
                    copied ? "bg-green-500/20 border-green-500/50 text-green-400" : "bg-brand-primary/10 border-brand-primary/30 text-brand-primary hover:bg-brand-primary/20"
                )}
            >
               {copied ? <Check size={16} /> : <LinkIcon size={16} />} 
               {copied ? "Link Copied!" : "Share Link"}
           </button>
           <button 
                onClick={handleClearClick}
                className={cn(
                    "w-full flex items-center justify-center gap-2 py-2 rounded transition-colors text-sm font-bold",
                    showClearConfirm 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                )}
            >
               <Trash2 size={16} /> {showClearConfirm ? "Confirm Clear?" : "Clear Deck"}
           </button>
       </div>
    </div>
  );
}
