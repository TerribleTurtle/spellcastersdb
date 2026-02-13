"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Save, Check } from "lucide-react";
import { DeckNameInput } from "../deck-drawer/DeckNameInput";
import { cn } from "@/lib/utils";
import { Deck, SlotType } from "@/types/deck";
import { ActiveDeckTray } from "../../shared/ui/ActiveDeckTray";
import { useDeckValidation } from "@/components/deck-builder/hooks/domain/useDeckValidation";
import { UnifiedEntity } from "@/types/api";
import { DeckActionToolbar } from "../../shared/ui/DeckActionToolbar";

interface DeckDrawerProps {
  deck: Deck;
  onSelect?: (item: UnifiedEntity, pos?: {x:number, y:number}) => void;
  // New props for Team/Stacked mode
  variant?: "fixed" | "static";
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  className?: string;
  
  // Slot Identity (for Store Connection)
  slotIndex?: number;
  
  // Legacy/Manual Control
  forceActive?: boolean; // Highlight as active deck
  onActivate?: () => void; // Called when clicked/interacted with
  onRename?: (name: string) => void;
  // Actions
  isSaved?: boolean;
  onSave?: () => void;
  onClear?: () => void;
  onLibraryOpen?: () => void;
  onImport?: () => void;
  onShare?: () => void;
  onExportToSolo?: () => void;
  hideGlobalActions?: boolean;
}

import { useDeckStore } from "@/store/index";
import { useShallow } from "zustand/react/shallow";

const ActionToolbar = DeckActionToolbar;

export function DeckDrawer({ 
    deck, 
    onSelect,
    variant = "fixed",
    isExpanded: controlledExpanded,
    onToggle: controlledOnToggle,
    className,
    slotIndex,
    forceActive: controlledActive,
    onActivate: controlledOnActivate,
    onRename,
    isSaved,
    onSave,
    onClear,
    onLibraryOpen,
    onImport,
    onShare,
    onExportToSolo,
    hideGlobalActions
}: DeckDrawerProps) {
  // Store Connection
  const { activeSlot, setActiveSlot } = useDeckStore(
      useShallow(state => ({
          activeSlot: state.activeSlot,
          setActiveSlot: state.setActiveSlot
      }))
  );

  const isStoreActive = slotIndex !== undefined && activeSlot === slotIndex;
  // Prefer controlled prop if present (Solo mode), fallback to store
  const forceActive = controlledActive ?? isStoreActive;

  const handleActivate = () => {
      // Always call controlled handler if present
      if (controlledOnActivate) controlledOnActivate();
      // If connected to a slot, update store
      if (slotIndex !== undefined) setActiveSlot(slotIndex);
  }

  // Internal state for uncontrolled usage
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const isExpanded = controlledExpanded ?? internalExpanded;
  const validation = useDeckValidation(deck);

// Internal state effect removed

  // Toggle expansion
  const toggle = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering onActivate if header is clicked
    if (isEditing) return; // Don't toggle if editing

    const newState = !isExpanded;
    if (controlledOnToggle) {
        controlledOnToggle(newState);
    } else {
        setInternalExpanded(newState);
    }
    // Also activate when opening
    if (newState && handleActivate) {
        handleActivate();
    }
  };

// Name handlers moved to DeckNameInput

  // Unit count
  const unitCount = deck.slots.filter(s => s.unit && s.index < 4).length;
  const hasTitan = deck.slots.some(s => s.allowedTypes.includes(SlotType.Titan) && s.unit);
  const totalCount = (deck.spellcaster ? 1 : 0) + unitCount + (hasTitan ? 1 : 0);

  // Base classes based on variant
  const containerClasses = cn(
    "bg-surface-main border-t border-brand-primary/20 shadow-2xl transition-all duration-300 ease-in-out flex flex-col pointer-events-auto relative",
    variant === "fixed" && "fixed bottom-0 left-0 right-0 z-40 pb-[max(16px,env(safe-area-inset-bottom))]",
    variant === "static" && "w-full border-x border-b border-white/5 first:border-t",
    isExpanded ? "h-[200px] md:h-auto" : "h-[48px] md:h-auto", // consistent small height for collapsed, auto on desktop
    forceActive && "border-brand-primary shadow-[0_-4px_15px_rgba(var(--color-brand-primary),0.1)]",
    className
  );

  return (
    <div 
      className={containerClasses}
      onClick={handleActivate} // Activate on any click
    >
      {/* Active Tint Overlay */}
      {forceActive && (
          <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none" />
      )}

      {/* Handle / Header */}
      <div 
        className={cn(
            "h-14 w-full flex items-center justify-between px-4 shrink-0 transition-colors cursor-pointer select-none",
            forceActive ? "bg-brand-primary/10" : "hover:bg-white/5"
        )}
        onClick={(e) => {
            // Desktop: Only Activate. Mobile: Toggle.
            if (window.innerWidth >= 768) {
                handleActivate();
            } else {
                toggle(e);
            }
        }}
      >
        {/* Left: Check/Status or just Deck Name */}
        <div className="flex items-center gap-3 max-w-[50%]">
            <div className={cn("w-3 h-3 rounded-full shrink-0", forceActive ? "bg-brand-primary" : "bg-gray-600")} />
            
            <DeckNameInput 
                name={deck.name || "Untitled"}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                onRename={onRename}
                onActivate={handleActivate}
                forceActive={forceActive}
            />
            
            {/* Header Save Action (Desktop/Mobile accessible) */}
            {onSave && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSave();
                    }}
                    className={cn(
                        "w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                         isSaved 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-surface-card hover:bg-brand-primary hover:text-white text-gray-400"
                    )}
                    title={isSaved ? "Saved" : "Save Deck"}
                >
                    {isSaved ? <Check size={14} /> : <Save size={14} />}
                </button>
            )}
        </div>

        {/* Center: Chevron/Count - HIDDEN ON DESKTOP */}
        <button 
            type="button"
            className="flex items-center gap-2 text-gray-400 hover:text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-primary md:hidden"
            onClick={(e) => { e.stopPropagation(); toggle(); }}
            aria-expanded={isExpanded}
            aria-controls="drawer-content"
            aria-label={isExpanded ? "Collapse deck drawer" : "Expand deck drawer"}
        >
            <span className="text-xs uppercase font-bold tracking-widest">
                {isExpanded ? "Collapse" : `${totalCount}/6 Cards`}
            </span>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        
        {/* Right: Validation Status OR Action Toolbar */}
        {/* On Desktop: Always show actions. On Mobile: Depends on Expanded. */}
        <div className={cn("hidden md:flex", "items-center gap-2")} onClick={(e) => e.stopPropagation()}>
             {/* Desktop Action Toolbar (Always Visible) */}
             <ActionToolbar 
                {...{onImport, onLibraryOpen, hideGlobalActions, onSave, isSaved, onShare, onClear, onExportToSolo}} 
             />
        </div>

        {/* Mobile: Conditional Render */}
        <div className="md:hidden" onClick={(e) => e.stopPropagation()}>
            {isExpanded ? (
               <ActionToolbar 
                  {...{onImport, onLibraryOpen, hideGlobalActions, onSave, isSaved, onShare, onClear, onExportToSolo}} 
               />
            ) : (
                <div className="flex items-center gap-1">
                     {/* Validation Dots (Collapsed) */}
                     <div className="flex gap-1">
                         <div className={cn("w-2 h-2 rounded-full", deck.spellcaster ? "bg-brand-accent" : "bg-gray-700")} />
                         {deck.slots.slice(0, 4).map(s => (
                             <div key={s.index} className={cn("w-2 h-2 rounded-full", s.unit ? "bg-brand-primary" : "bg-gray-700")} />
                         ))}
                         <div className={cn("w-2 h-2 rounded-full", deck.slots[4]?.unit ? "bg-orange-500" : "bg-gray-700")} />
                     </div>
                </div>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative md:overflow-visible">
        <div className={cn(
            "absolute inset-0 transition-opacity duration-200",
            // Mobile: Conditional. Desktop: Always visible AND static positioning to allow growth
            isExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto",
            "md:relative md:inset-auto" 
        )}>
             <ActiveDeckTray 
                slots={deck.slots}
                spellcaster={deck.spellcaster}
                validation={validation}
                onSelect={(item, pos) => {
                    onSelect?.(item, pos);
                }}
                deckId={deck.id}
             />
        </div>
      </div>
    </div>
  );
}
