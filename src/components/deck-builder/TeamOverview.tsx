"use client";

import { copyToClipboard } from "@/lib/clipboard";

import { useState } from 'react';
import { Deck } from '@/types/deck';
import { UnifiedEntity } from '@/types/api';
import { getCardImageUrl, cn } from '@/lib/utils';
import { Link as LinkIcon, Check, CheckCircle2, AlertCircle, Save, Edit } from "lucide-react";

import { GameImage } from "@/components/ui/GameImage";
import { validateDeck } from '@/lib/deck-validation';

interface TeamOverviewProps {
  decks: [Deck, Deck, Deck];
  onEditDeck: (index: number) => void;
  teamName: string;
  onBack?: () => void;
  isReadOnly?: boolean;
  onSave?: () => void;
  existingId?: string | null;
}


export function TeamOverview({
  decks,
  onEditDeck,
  teamName,
  onBack,
  isReadOnly,
  onSave,
  existingId
}: TeamOverviewProps) {



  return (
    <div className="h-full flex flex-col bg-surface-main overflow-hidden">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col items-center justify-center p-4 bg-surface-main z-10 gap-2 shrink-0 border-b border-white/5 w-full relative">
           <div className="flex flex-col items-center gap-0.5 group text-center">
              <h1 className="text-lg md:text-2xl font-black text-white uppercase tracking-wider truncate max-w-3xl">
                  {teamName || "Untitled Team"}
              </h1>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                  Spellcasters Trinity
              </p>
           </div>
           
           <ShareTeamButton decks={decks} teamName={teamName} />
      </div>

      {/* Main Content - Scrollable List of Horizontal Decks */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 bg-black/20">
          <div className="max-w-5xl mx-auto w-full space-y-2">
              {decks.map((deck, index) => (
                  <TeamDeckRow 
                     key={index}
                     index={index}
                     deck={deck}
                     onEdit={() => onEditDeck(index)}
                     isReadOnly={isReadOnly}
                  />


              ))}
              

          </div>
      </div>
      
      {/* Footer Action */}
       <div className="p-4 border-t border-white/10 flex justify-center bg-surface-main shrink-0 gap-4">
           {onBack && (
               <button 
                   onClick={onBack} 
                   className={cn(
                       "px-4 md:px-8 py-3 font-black uppercase tracking-widest rounded-lg shadow-lg transition-all flex items-center gap-2 text-xs md:text-sm",
                       "bg-surface-card text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
                   )}
               >
                   {isReadOnly ? "Close" : "Return to Forge"}
               </button>
           )}

           {/* Case 1: Team Exists -> Open */}
           {existingId ? (
                <button 
                   onClick={() => onEditDeck(0)} 
                   className="px-6 md:px-10 py-3 bg-brand-primary text-white font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-brand-primary/90 hover:scale-105 transition-all flex items-center gap-2 text-xs md:text-sm"
               >
                   <Edit size={16} />
                   Open Team
               </button>
           ) : (
               /* Case 2: New Team -> Save OR Try */
               <>
                   {isReadOnly && onSave && (
                       <button 
                           onClick={onSave}
                           className="px-6 md:px-8 py-3 bg-brand-primary text-white font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-brand-primary/90 hover:scale-105 transition-all flex items-center gap-2 text-xs md:text-sm"
                       >
                           <Save size={16} />
                           Save to Collection
                       </button>
                   )}
   
                   <button 
                       onClick={() => onEditDeck(0)} 
                       className={cn(
                           "px-6 md:px-10 py-3 font-black uppercase tracking-widest rounded-lg shadow-lg transition-all flex items-center gap-2 text-xs md:text-sm",
                           isReadOnly 
                               ? "bg-surface-card text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white"
                               : "bg-brand-primary text-white hover:bg-brand-primary/90 hover:scale-105"
                       )}
                   >
                       <Edit size={16} />
                       {isReadOnly ? "Try in Forge" : "Edit Decks"}
                   </button>
               </>
           )}
       </div>



    </div>
  );
}


function TeamDeckRow({ index, deck, onEdit, isReadOnly }: { 
    index: number, 
    deck: Deck, 
    onEdit: () => void,
    isReadOnly?: boolean;
}) {

    const { isValid, errors } = validateDeck(deck);

    return (
        <div className="bg-surface-card border border-white/10 rounded-xl overflow-hidden hover:border-brand-primary/30 transition-all group">
            <div className="flex flex-col lg:flex-row h-full">
                
                {/* Header / Info Column */}
                <div 
                    className={cn(
                        "w-full lg:w-64 bg-black/20 border-b lg:border-b-0 lg:border-r border-white/5 p-3 md:p-4 flex flex-col justify-between relative overflow-hidden",
                        !isReadOnly && "cursor-pointer hover:bg-white/5 transition-colors"
                    )}
                    onClick={!isReadOnly ? onEdit : undefined}
                >

                    {deck.spellcaster && (
                        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                            <GameImage 
                                src={getCardImageUrl(deck.spellcaster)}
                                alt=""
                                fill
                                className="object-cover object-top"
                            />
                            <div className="absolute inset-0 bg-linear-to-r from-surface-card/90 to-transparent" />
                        </div>
                    )}

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary text-[10px] font-bold uppercase tracking-wider border border-brand-primary/20">
                                 Slot {index + 1}
                             </div>
                             {/* Validation Badge */}
                            <div 
                                    className={cn(
                                        "flex items-center justify-center w-5 h-5 rounded-full border-2",
                                        isValid ? "bg-green-500 text-white border-green-400" : "bg-red-500 text-white border-red-400"
                                    )}
                                    title={isValid ? "Deck Valid" : errors.join('\n')}
                            >
                                    {isValid ? <CheckCircle2 size={10} strokeWidth={3} /> : <AlertCircle size={10} strokeWidth={3} />}
                            </div>
                        </div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider truncate">
                            {deck.name || "Untitled Deck"}
                        </h3>
                        <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mt-1">
                            {deck.spellcaster?.name || "No Spellcaster"}
                        </p>
                    </div>

                    {!isReadOnly && (
                        <div className="mt-4 flex gap-2 relative z-10">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="w-full py-2 rounded bg-brand-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/80 transition-colors"
                            >
                                Edit
                            </button>
                        </div>
                    )}
                </div>


                {/* Deck Visuals - Horizontal Tray */}
                <div className="flex-1 p-2 lg:p-4 overflow-x-auto">
                    <div className="flex items-center gap-2 md:gap-4 min-w-max">
                        {/* Spellcaster */}
                        <VisualSlot item={deck.spellcaster} type="spellcaster" />
                        
                        {/* Separator */}
                        <div className="w-px h-16 bg-white/10 mx-2" />

                        {/* Units 0-3 */}
                        {deck.slots.slice(0, 4).map(s => (
                            <VisualSlot key={s.index} item={s.unit} type="unit" isEmpty={!s.unit} label={`Unit ${s.index + 1}`} />
                        ))}

                        {/* Separator */}
                        <div className="w-px h-16 bg-white/10 mx-2" />

                        {/* Titan */}
                        <VisualSlot item={deck.slots[4].unit} type="titan" isEmpty={!deck.slots[4].unit} label="Titan" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function VisualSlot({ item, type, isEmpty, label }: { item?: UnifiedEntity | null, type: 'spellcaster' | 'unit' | 'titan', isEmpty?: boolean, label?: string }) {
    if (isEmpty || !item) {
        return (
            <div className={cn(
                "rounded-lg border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-2",
                 type === 'spellcaster' 
                    ? "w-16 h-22 md:w-20 md:h-28 border-brand-primary/30" 
                    : "w-12 h-18 md:w-16 md:h-24"
            )}>
                {type === 'spellcaster' && <p className="text-[9px] uppercase font-bold text-gray-600 text-center px-1">Choose Spellcaster</p>}
                {label && <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">{label}</span>}
            </div>
        );
    }

    return (
        <div className="bg-transparent group">
        <div className={cn(
            "relative rounded-lg overflow-hidden border border-white/10 bg-gray-900 group shadow-lg",
             type === 'spellcaster' 
                ? "w-16 h-22 md:w-20 md:h-28 border-brand-primary shadow-brand-primary/20" 
                : "w-12 h-18 md:w-16 md:h-24"
        )}>
            <GameImage 
                src={getCardImageUrl(item)} 
                alt={item.name}
                fill
                className="object-cover object-top"
            />
            
            {/* Badges */}
            {item.category === 'Titan' && (
                 <div className="absolute top-1 left-1 bg-black/60 px-1 py-0.5 rounded text-[8px] font-mono text-brand-accent backdrop-blur-sm">TITAN</div>
            )}
             {'rank' in item && item.rank && (
                 <div className="absolute top-1 left-1 bg-black/60 px-1 py-0.5 rounded text-[8px] font-mono text-brand-accent backdrop-blur-sm">{item.rank}</div>
            )}

            {/* Name */}
            <div className="absolute bottom-0 inset-x-0 bg-surface-main/90 border-t border-white/10 py-1 px-0.5">
                <p className="text-[9px] font-bold text-center text-gray-200 truncate leading-tight">
                    {item.name}
                </p>
            </div>
        </div>
        </div>
    );
}

function ShareTeamButton({ decks, teamName }: { decks: [Deck, Deck, Deck], teamName: string }) {
    const [copied, setCopied] = useState(false);
    
    const handleShare = async () => {
        // Dynamically generate the URL with the team hash
        // We import encodeTeam dynamically to avoid circular deps if any, or just use standard import if at top level
        const { encodeTeam } = await import("@/lib/encoding");
        const hash = encodeTeam(decks, teamName);
        const url = `${window.location.origin}${window.location.pathname}?team=${hash}`;
        
        const success = await copyToClipboard(url);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button 
            onClick={handleShare}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider mt-2",
                copied 
                    ? "bg-green-500/20 border-green-500/50 text-green-400" 
                    : "bg-surface-card border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
            )}
        >
            {copied ? <Check size={14} /> : <LinkIcon size={14} />}
            {copied ? "Link Copied" : "Share Team"}
        </button>  
    );
}
