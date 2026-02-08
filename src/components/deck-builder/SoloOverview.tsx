"use client";

import { useState } from 'react';
import { copyToClipboard } from '@/lib/clipboard';
import { Deck } from '@/types/deck';
import { UnifiedEntity } from '@/types/api';
import { getCardImageUrl, cn } from '@/lib/utils';
import { encodeDeck } from '@/lib/encoding';
import { validateDeck } from "@/lib/deck-validation";
import { Edit, Link as LinkIcon, Users, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { GameImage } from "@/components/ui/GameImage";

interface SoloOverviewProps {
  deck: Deck;
  onEdit: () => void;
  onCreateTeam?: (deck: Deck) => void;
  onBack?: () => void;
  isReadOnly?: boolean;
  onSave?: () => void;
  existingId?: string | null;
}

export function SoloOverview({
  deck,
  onEdit,
  onCreateTeam,
  onBack,
  isReadOnly,
  onSave,
  existingId
}: SoloOverviewProps) {
  const [copied, setCopied] = useState(false);
  const { isValid, errors } = validateDeck(deck);



  const handleShare = async () => {
    const hash = encodeDeck(deck);
    const url = `${window.location.origin}${window.location.pathname}?d=${hash}`;
    
    const success = await copyToClipboard(url);
    if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface-main overflow-hidden">
      {/* Header */}
      <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-surface-main z-10 gap-2 shrink-0 border-b border-white/5 w-full relative">
           <div className="flex flex-col items-center gap-1 group text-center">
              <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-wider truncate max-w-3xl">
                      {deck.name || "Untitled Deck"}
                  </h1>
                   {/* Validation Badge */}
                   <div 
                        className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-full border-2",
                            isValid ? "bg-green-500 text-white border-green-400" : "bg-red-500 text-white border-red-400"
                        )}
                        title={isValid ? "Deck Valid" : errors.join('\n')}
                   >
                        {isValid ? <CheckCircle2 size={14} strokeWidth={3} /> : <AlertCircle size={14} strokeWidth={3} />}
                   </div>
              </div>
              <p className="text-brand-primary text-xs md:text-sm font-bold uppercase tracking-widest">
                  {deck.spellcaster?.name || "No Spellcaster"}
              </p>
           </div>

           {/* Actions - Centered below title */}
           <div className="flex items-center gap-3 mt-4">
                <button 
                    onClick={handleShare}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider",
                        copied 
                            ? "bg-green-500/20 border-green-500/50 text-green-400" 
                            : "bg-surface-card border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
                    )}
                >
                    {copied ? <Copy size={14} /> : <LinkIcon size={14} />}
                    {copied ? "Link Copied" : "Share Deck"}
                </button>
                
                {onCreateTeam && (
                     <button 
                        onClick={() => onCreateTeam(deck)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent hover:bg-brand-accent/20 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                    >
                        <Users size={14} />
                        Create Team
                    </button>
                )}
           </div>
      </div>

      {/* Main Content - Centered Visual Display */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-black/20">
          <div className="flex flex-col items-center gap-8 max-w-5xl w-full">
            
            {/* Horizontal Deck Layout */}
             <div className="w-full bg-surface-card border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
                
                {/* Background Art (Optional: Uses Spellcaster Art) */}
                {deck.spellcaster && (
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <GameImage 
                            src={getCardImageUrl(deck.spellcaster)} 
                            alt="" 
                            fill 
                            className="object-cover"
                        />
                         <div className="absolute inset-0 bg-linear-to-b from-surface-card via-surface-card/90 to-surface-card" />
                    </div>
                )}

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                     {/* Spellcaster */}
                    <VisualSlot item={deck.spellcaster} type="spellcaster" label="Spellcaster" />

                    {/* Separator */}
                    <div className="hidden md:block w-px h-32 bg-white/10" />
                    
                    {/* Units */}
                    <div className="flex items-center gap-2 md:gap-4">
                         {deck.slots.slice(0, 4).map(s => (
                            <VisualSlot key={s.index} item={s.unit} type="unit" isEmpty={!s.unit} label={`Incant. ${s.index + 1}`} />
                        ))}
                    </div>

                    {/* Separator */}
                    <div className="hidden md:block w-px h-32 bg-white/10" />

                    {/* Titan */}
                    <VisualSlot item={deck.slots[4].unit} type="titan" isEmpty={!deck.slots[4].unit} label="Titan" />
                </div>
             </div>

          </div>
      </div>
      
      {/* Footer Action */}
       <div className="p-6 border-t border-white/10 flex justify-center bg-surface-main shrink-0 gap-4">
           {onBack && (
               <button 
                   onClick={onBack}
                   className="px-6 py-3 border border-white/10 text-gray-400 font-bold uppercase tracking-widest rounded-lg hover:text-white hover:bg-white/5 transition-all text-sm"
               >
                   Close
               </button>
           )}
           
           {/* Case 1: Deck Exists -> Open */}
           {existingId ? (
                <button 
                    onClick={onEdit}
                    className="px-6 md:px-8 py-3 bg-brand-primary text-white font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-brand-primary/90 hover:scale-105 transition-all flex items-center gap-2 text-xs md:text-sm"
                >
                        <Edit size={16} />
                        Open from Collection
                </button>
           ) : (
                /* Case 2: New Deck -> Save OR Try */
                <>
                    {isReadOnly && onSave && (
                        <button 
                            onClick={onSave}
                            className="px-6 md:px-8 py-3 bg-brand-primary text-white font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-brand-primary/90 hover:scale-105 transition-all flex items-center gap-2 text-xs md:text-sm"
                        >
                            <Users size={16} />
                            Save to Collection
                        </button>
                    )}

                    <button 
                        onClick={onEdit} 
                        className={cn(
                            "px-6 md:px-10 py-3 font-black uppercase tracking-widest rounded-lg shadow-lg transition-all flex items-center gap-2 text-xs md:text-sm",
                            isReadOnly 
                                ? "bg-surface-card text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white"
                                : "bg-brand-primary text-white hover:bg-brand-primary/90 hover:scale-105"
                        )}
                    >
                        <Edit size={16} />
                        {isReadOnly ? "Try in Forge" : "Edit in Forge"}
                    </button>
                </>
           )}
       </div>
    </div>
  );
}

function VisualSlot({ item, type, isEmpty, label }: { item?: UnifiedEntity | null, type: 'spellcaster' | 'unit' | 'titan', isEmpty?: boolean, label?: string }) {
    if (isEmpty || !item) {
        return (
            <div className={cn(
                "rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-2 transition-all",
                 type === 'spellcaster' 
                    ? "w-24 h-36 md:w-32 md:h-48 border-brand-primary/20" 
                    : "w-16 h-24 md:w-20 md:h-32"
            )}>
                 <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center px-1">{label}</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3 group/slot">
            <div className={cn(
                "relative rounded-xl overflow-hidden border border-white/10 bg-gray-900 shadow-2xl transition-transform duration-300 hover:scale-105 hover:z-10 hover:shadow-brand-primary/20",
                 type === 'spellcaster' 
                    ? "w-24 h-36 md:w-32 md:h-48 border-brand-primary ring-2 ring-brand-primary/20" 
                    : "w-16 h-24 md:w-20 md:h-32"
            )}>
                <GameImage 
                    src={getCardImageUrl(item)} 
                    alt={item.name}
                    fill
                    className="object-cover object-top"
                />
                
                {/* Badges */}
                {item.category === 'Titan' && (
                     <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-mono text-brand-accent backdrop-blur-sm shadow-sm border border-brand-accent/20">TITAN</div>
                )}
                 {'rank' in item && item.rank && (
                     <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-300 backdrop-blur-sm border border-white/10">{item.rank}</div>
                )}

                {/* Name Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/80 to-transparent pt-6 pb-2 px-1">
                    <p className={cn(
                        "font-bold text-center text-gray-100 truncate leading-tight drop-shadow-md",
                        type === 'spellcaster' ? "text-xs md:text-sm" : "text-[10px]"
                    )}>
                        {item.name}
                    </p>
                </div>
            </div>
            {(label && type === 'spellcaster') && (
                 <div className="text-[9px] font-bold text-brand-primary uppercase tracking-widest opacity-0 group-hover/slot:opacity-100 transition-opacity">
                     {label}
                 </div>
            )}
        </div>
    );
}
