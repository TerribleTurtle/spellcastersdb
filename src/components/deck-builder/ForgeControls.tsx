import { useState, useRef } from "react";
import { Deck, DeckStats } from "@/types/deck";
import { CheckCircle2, AlertTriangle, Download, Trash2, Link as LinkIcon, Check, Save, Upload, Plus, Layers } from "lucide-react";
import { cn, getCardImageUrl } from "@/lib/utils";
import { encodeDeck } from "@/lib/encoding";

interface ForgeControlsProps {
    stats: DeckStats;
    validation: {
        isValid: boolean;
        errors: string[];
        reminder: string | null;
    };
    onClear: () => void;
    deck: Deck;
    savedDecks: Deck[];
    onSave: (name: string) => void;
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    onRename: (name: string) => void;
    onImport: (decks: Deck[]) => void;
    onDuplicate: (id: string) => void;
}

export function ForgeControls({ 
    stats, 
    validation, 
    onClear, 
    deck,
    savedDecks,
    onSave,
    onLoad,
    onDelete,
    onRename,
    onImport,
    onDuplicate
}: ForgeControlsProps) {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleShare = () => {
    // ... existing share logic
    const hash = encodeDeck(deck);
    const url = `${window.location.origin}${window.location.pathname}?d=${hash}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Clipboard write failed:", err);
      });
  };

  const handleExportAll = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedDecks, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", `all_decks.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const content = e.target?.result as string;
              const json = JSON.parse(content);
              const decks = Array.isArray(json) ? json : [json];
              // Basic validation check
              if (decks.some(d => !d.slots || !Array.isArray(d.slots))) {
                  alert("Invalid deck file format.");
                  return;
              }
              onImport(decks);
              alert(`Imported ${decks.length} deck(s)!`);
          } catch (err) {
              console.error(err);
              alert("Failed to parse deck file.");
          }
      };
      reader.readAsText(file);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

   const [showClearConfirm, setShowClearConfirm] = useState(false);
   const handleClearClick = () => {
       if (showClearConfirm) {
           onClear();
           setShowClearConfirm(false);
       } else {
           setShowClearConfirm(true);
           setTimeout(() => setShowClearConfirm(false), 3000); 
       }
   };

   const [justSaved, setJustSaved] = useState(false);
   const handleSave = () => {
       onSave(deck.name || "");
       setJustSaved(true);
       setTimeout(() => setJustSaved(false), 2000);
   };

   return (
    <div className="h-full bg-surface-main border-l border-white/10 flex flex-col w-full animate-in fade-in slide-in-from-left-4 duration-200">
       
       {/* TOP: Deck List (Scrollable) */}
       <div className="flex-1 overflow-y-auto border-b border-white/10 flex flex-col min-h-0">
           <div className="p-3 bg-surface-main/95 backdrop-blur sticky top-0 z-10 border-b border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Saved Decks ({savedDecks.length})</span>
                   <span className="text-[10px] text-gray-600 hidden sm:inline-block italic ml-2 border-l border-white/10 pl-2">
                       Saved locally to browser
                   </span>
               </div>
               <div className="flex gap-1">
                   <button 
                       onClick={handleImportClick}
                       className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                       title="Import Decks"
                   >
                       <Upload size={14} />
                   </button>
                   <button 
                       onClick={handleExportAll}
                       className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                       title="Export All Decks"
                   >
                       <Download size={14} />
                   </button>
               </div>
               <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept=".json"
                   onChange={handleFileChange}
               />
           </div>

           <div className="p-2 space-y-1">
               {savedDecks.length === 0 ? (
                   <div className="text-center py-8 text-gray-500 text-xs">
                       <p className="mb-2">No saved decks.</p>
                       <span className="text-[10px] text-gray-700 block mb-2">Decks are saved in your browser&apos;s local storage.</span>
                       <button onClick={handleImportClick} className="text-brand-primary hover:underline">Import from file</button>
                   </div>
               ) : (
                   savedDecks.map(d => (
                       <div 
                           key={d.id} 
                           onClick={() => onLoad(d.id!)}
                           className={cn(
                               "group flex items-center p-2 rounded cursor-pointer border transition-all relative overflow-hidden",
                               deck.id === d.id 
                                   ? "bg-brand-primary/10 border-brand-primary/50" 
                                   : "bg-surface-card border-white/5 hover:border-white/20 hover:bg-white/5"
                           )}
                       >
                           {/* Left: Avatar + Info */}
                           <div className="flex items-center gap-3 min-w-0 max-w-[40%] xl:max-w-[30%]">
                               {/* Icon */}
                               <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/20 bg-black shadow-sm">
                                   {d.spellcaster ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                       <img src={getCardImageUrl(d.spellcaster)} alt="" className="w-full h-full object-cover" />
                                   ) : (
                                       <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold text-[10px]">?</div>
                                   )}
                               </div>
                               
                               {/* Info */}
                               <div className="flex-1 min-w-0">
                                   <div className={cn(
                                       "font-bold truncate text-sm",
                                       deck.id === d.id ? "text-brand-primary" : "text-gray-200"
                                   )}>
                                       {d.name}
                                   </div>
                                   <div className="text-xs text-gray-500 truncate">
                                       {d.spellcaster?.name || "No Commander"}
                                   </div>
                               </div>
                           </div>

                           <div className="grow" />

                           {/* Right: Units + Actions */}
                           <div className="flex items-center gap-4 shrink-0">
                                {/* Unit Previews */}
                                <div className="hidden sm:flex items-center gap-1.5 mr-2">
                                    {d.slots.map((s, i) => (
                                        <div key={i} className={cn(
                                            "rounded bg-black/50 border overflow-hidden relative shadow-sm transition-transform hover:scale-110 hover:z-10 hover:border-white/40",
                                            s.allowedTypes.includes('TITAN') 
                                                ? "w-9 h-9 border-brand-primary/60 shadow-brand-primary/20 z-1" // Titan: Bigger, glowing border
                                                : "w-7 h-7 border-white/10"
                                        )}>
                                            {s.unit ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={getCardImageUrl(s.unit)} alt="" className="w-full h-full object-cover opacity-90 hover:opacity-100" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/5 text-[8px]">•</div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-40 xl:opacity-20 xl:group-hover:opacity-100 transition-opacity bg-surface-main/80 xl:bg-transparent rounded px-1">
                                     <button 
                                       onClick={(e) => {
                                           e.stopPropagation();
                                           const hash = encodeDeck(d);
                                           const url = `${window.location.origin}${window.location.pathname}?d=${hash}`;
                                           navigator.clipboard.writeText(url);
                                           // Could add toast here
                                       }}
                                       className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                       title="Copy Link"
                                   >
                                       <LinkIcon size={14} />
                                   </button>
                                   <button 
                                       onClick={(e) => {
                                           e.stopPropagation();
                                           onDuplicate(d.id!);
                                       }}
                                       className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                       title="Duplicate Deck"
                                   >
                                       <Layers size={14} />
                                   </button>
                                   <button 
                                       onClick={(e) => {
                                           e.stopPropagation();
                                           if (confirm(`Delete "${d.name}"?`)) onDelete(d.id!);
                                       }}
                                       className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                       title="Delete"
                                   >
                                       <Trash2 size={14} />
                                   </button>
                                </div>
                           </div>
                       </div>
                   ))
               )}
           </div>
       </div>

       {/* MIDDLE: Validation (Compact) */}
       <div className="shrink-0 bg-surface-main p-4 border-b border-white/10">
           <div className={cn(
               "rounded border px-3 py-2 flex items-center gap-3 transition-colors",
               stats.isValid ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
           )}>
                {stats.isValid ? <CheckCircle2 size={16} className="text-green-500 shrink-0" /> : <AlertTriangle size={16} className="text-red-500 shrink-0" />}
                <div className="flex-1 min-w-0">
                    <div className={cn("font-bold text-sm", stats.isValid ? "text-green-400" : "text-red-400")}>
                        {stats.isValid ? "Deck Valid" : "Invalid Deck"}
                    </div>
                    {!validation.isValid && (
                        <div className="text-[10px] text-red-300 truncate">
                            {validation.errors[0]} {validation.errors.length > 1 && `+${validation.errors.length - 1} more`}
                        </div>
                    )}
                </div>
           </div>
       </div>

       {/* BOTTOM: Current Deck Controls */}
       <div className="p-4 shrink-0 bg-surface-main space-y-3 pb-6">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Deck</span>
                <button 
                    onClick={() => onClear()} 
                    title="New Deck"
                    className="flex items-center gap-1 text-[10px] text-brand-secondary hover:text-white transition-colors font-bold uppercase"
                >
                    <Plus size={10} /> New
                </button>
            </div>

            {/* Name Input */}
            <input 
                  type="text" 
                  value={deck.name || ''}
                  onChange={(e) => onRename(e.target.value.slice(0, 50))} 
                  placeholder={deck.spellcaster ? `${deck.spellcaster.name} Deck` : "Name your deck..."}
                  className="w-full bg-surface-card border border-white/10 rounded px-3 py-3 text-lg font-bold text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary/50 transition-colors"
            />

            {/* Main Actions */}
            <div className="grid grid-cols-2 gap-3">
                 <button 
                     onClick={handleSave}
                     className={cn(
                         "flex items-center justify-center gap-2 py-3 rounded border transition-all text-sm font-bold shadow-lg",
                         justSaved 
                             ? "bg-green-500 border-green-400 text-white" 
                             : "bg-brand-primary border-brand-accent/50 text-white hover:bg-brand-primary/80 hover:scale-[1.02]"
                     )}
                 >
                     {justSaved ? <Check size={18} /> : <Save size={18} />}
                     {justSaved ? "Saved" : "Save"}
                 </button>

                 <button 
                     onClick={handleShare}
                     className={cn(
                         "flex items-center justify-center gap-2 py-3 rounded border transition-all text-sm font-bold",
                         copied 
                             ? "bg-green-500/20 border-green-500/50 text-green-400" 
                             : "bg-surface-card border-white/10 text-gray-300 hover:bg-white/5 hover:text-white"
                     )}
                 >
                    {copied ? <Check size={18} /> : <LinkIcon size={18} />} 
                    {copied ? "Copied" : "Share"}
                 </button>
            </div>
            
            {/* Clear (Small) */}
            <div className="flex justify-center pt-2">
                 <button 
                      onClick={handleClearClick}
                      className={cn(
                          "text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1",
                          showClearConfirm ? "text-red-400" : "text-gray-600 hover:text-red-400"
                      )}
                  >
                     <Trash2 size={10} /> {showClearConfirm ? "Confirm?" : "Clear Deck"}
                 </button>
            </div>
       </div>
    </div>
  );
}

