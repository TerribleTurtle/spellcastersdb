"use client";

import { memo, useState } from "react";

import { useDroppable } from "@dnd-kit/core";
import { Check, ChevronDown, ChevronUp, Save } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useAutoExpand } from "@/features/deck-builder/hooks/ui/useAutoExpand";
import { useDeckValidation } from "@/features/shared/hooks/useDeckValidation";
import { cn } from "@/lib/utils";
import { useDeckStore } from "@/store/index";
import { UnifiedEntity } from "@/types/api";
import { Deck, SlotType } from "@/types/deck";
import { DropData } from "@/types/dnd";
import { EntityCategory } from "@/types/enums";

import { ActiveDeckTray } from "../ui/ActiveDeckTray";
import { DeckActionToolbar } from "../ui/DeckActionToolbar";
import { DeckNameInput } from "./DeckNameInput";

interface DeckDrawerProps {
  deck: Deck;
  onSelect?: (
    item: UnifiedEntity | undefined,
    pos?: { x: number; y: number },
    slotIndex?: number
  ) => void;
  variant?: "fixed" | "static";
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  className?: string;
  slotIndex?: number;
  forceActive?: boolean;
  onActivate?: () => void;
  onRename?: (name: string) => void;
  isSaved?: boolean;
  onSave?: () => void;
  onClear?: () => void;
  onLibraryOpen?: (category?: EntityCategory) => void;
  onImport?: () => void;
  onShare?: () => void;
  onExportToSolo?: () => void;
  hideGlobalActions?: boolean;
  idSuffix?: string;
  activeBorderClassName?: string; // Kept for backwards compatibility or specific simple overrides
  activeTheme?: {
    overlay?: string;
    header?: string;
    dot?: string;
    border?: string; // Can replace activeBorderClassName
  };
  tintClassName?: string;
}

const ActionToolbar = DeckActionToolbar;

export const DeckDrawer = memo(function DeckDrawer({
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
  hideGlobalActions,
  idSuffix,
  activeBorderClassName,
  activeTheme,
  tintClassName,
}: DeckDrawerProps) {
  // Store Connection
  const { activeSlot, setActiveSlot, pendingSwapCard } = useDeckStore(
    useShallow((state) => ({
      activeSlot: state.activeSlot,
      setActiveSlot: state.setActiveSlot,
      pendingSwapCard: state.pendingSwapCard,
    }))
  );

  const isStoreActive = slotIndex !== undefined && activeSlot === slotIndex;
  // Prefer controlled prop if present (Solo mode), fallback to store
  const forceActive = controlledActive ?? isStoreActive;

  // Swap Mode Logic - Scoped to this deck if it is active (or if we are in solo mode/no slotIndex)
  // If slotIndex is undefined, we assume Solo Mode (or single deck context), so we glow if swap is pending.
  // If slotIndex IS defined (Team Mode), we only glow if THIS slot is the active one.
  const isSwapTarget =
    !!pendingSwapCard && (slotIndex === undefined || activeSlot === slotIndex);

  const handleActivate = () => {
    // Always call controlled handler if present
    if (controlledOnActivate) controlledOnActivate();
    // If connected to a slot, update store
    if (slotIndex !== undefined) setActiveSlot(slotIndex);
  };

  // Internal state
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isExpanded = controlledExpanded ?? internalExpanded;
  const validation = useDeckValidation(deck);

  // AUTO-EXPAND LOGIC
  const baseHeaderId = `deck-header-${deck.id}`;
  const headerId = idSuffix ? `${baseHeaderId}-${idSuffix}` : baseHeaderId;

  const dropData: DropData = {
    type: "DECK_HEADER",
    deckId: deck.id,
  };

  const { isOver, setNodeRef } = useDroppable({
    id: headerId, // Unique ID for header
    data: dropData,
  });

  useAutoExpand(
    isOver && !isExpanded,
    () => {
      // Expand
      if (controlledOnToggle) controlledOnToggle(true);
      else setInternalExpanded(true);

      // Activate
      handleActivate();
    },
    500
  ); // 500ms delay

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

  // Unit count
  const unitCount = deck.slots.filter((s) => s.unit && s.index < 4).length;
  const hasTitan = deck.slots.some(
    (s) => s.allowedTypes.includes(SlotType.Titan) && s.unit
  );
  const totalCount =
    (deck.spellcaster ? 1 : 0) + unitCount + (hasTitan ? 1 : 0);

  // Base classes based on variant
  const containerClasses = cn(
    "bg-[var(--color-surface-deck)] border-t border-brand-primary/20 shadow-2xl transition-all duration-300 ease-in-out flex flex-col pointer-events-auto relative overflow-hidden",
    variant === "fixed" &&
      "fixed bottom-0 left-0 right-0 z-40 pb-[max(16px,env(safe-area-inset-bottom))]",
    variant === "static" &&
      "w-full border-x border-b border-border-subtle first:border-t",
    isExpanded ? "h-auto" : "h-[48px]", // consistent small height for collapsed
    // Order of precedence: activeTheme.border -> activeBorderClassName -> default brand
    forceActive &&
      (activeTheme?.border ||
        activeBorderClassName ||
        "border-brand-primary shadow-[0_-4px_15px_rgba(var(--color-brand-primary),0.1)]"),
    className
  );

  return (
    <div
      className={containerClasses}
      onClick={handleActivate}
      data-testid={
        slotIndex !== undefined ? `deck-drawer-${slotIndex}` : "deck-drawer"
      }
    >
      {/* Permanent Theme Tint (Color Coding) */}
      {tintClassName && (
        <div
          className={cn("absolute inset-0 pointer-events-none", tintClassName)}
        />
      )}

      {/* Active Tint Overlay */}
      {forceActive && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none mix-blend-overlay",
            activeTheme?.overlay || "bg-brand-primary/15"
          )}
        />
      )}

      {/* Hover Feedback Overlay for Dragging */}
      {isOver && !isExpanded && (
        <div className="absolute inset-0 border-2 border-brand-primary/50 bg-brand-primary/10 z-50 pointer-events-none animate-pulse rounded-t-xl" />
      )}

      {/* Drop Target Feedback (Active Drag over Header) */}
      {isOver && (
        <div className="absolute inset-0 border-2 border-brand-primary/50 bg-brand-primary/10 z-30 pointer-events-none animate-pulse rounded-t-xl" />
      )}

      {/* Handle / Header */}
      <div
        ref={setNodeRef} // Make header droppable
        data-testid="deck-drawer-header"
        className={cn(
          "h-14 w-full flex items-center justify-between px-4 shrink-0 transition-colors cursor-pointer select-none relative z-40",
          forceActive
            ? activeTheme?.header || "bg-brand-primary/20"
            : "bg-surface-card hover:bg-surface-hover"
          // isOver && "bg-brand-primary/20" // Handled by overlay above now
        )}
        onClick={(e) => {
          // Smart Click Logic for Team Drawer (Desktop)
          // Behavior:
          // 1. Closed -> Open & Activate
          // 2. Open & Inactive -> Activate (Keep Open)
          // 3. Open & Active -> Close

          if (window.innerWidth >= 1280) {
            if (!isExpanded) {
              // Case 1: Closed -> Open & Activate
              toggle(e); // toggle handles calling onActivate internally when opening
            } else if (forceActive) {
              // Case 3: Open & Active -> Close
              toggle(e);
            } else {
              // Case 2: Open & Inactive -> Just Activate
              handleActivate();
            }
          } else {
            // Mobile: Simple Toggle
            toggle(e);
          }
        }}
      >
        {/* Left: Check/Status or just Deck Name */}
        <div className="flex items-center gap-3 max-w-[50%]">
          <div
            className={cn(
              "w-3 h-3 rounded-full shrink-0",
              forceActive
                ? activeTheme?.dot || "bg-brand-primary"
                : "bg-surface-raised"
            )}
          />

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
                  ? "bg-status-success-muted text-status-success"
                  : "bg-surface-card hover:bg-brand-primary hover:text-text-primary text-text-muted"
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
          className="xl:hidden flex items-center justify-center text-text-muted hover:text-text-primary rounded p-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          aria-expanded={isExpanded}
          aria-controls="drawer-content"
          aria-label={
            isExpanded ? "Collapse deck drawer" : "Expand deck drawer"
          }
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {/* Right: Validation Status OR Action Toolbar */}
        {/* On Desktop: Always show actions. On Mobile: Depends on Expanded. */}
        <div
          className={cn("hidden xl:flex", "items-center gap-2")}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Desktop Toggle Button - Only show if NOT static */}
          {variant !== "static" && (
            <button
              type="button"
              className="flex items-center gap-2 text-text-muted hover:text-text-primary rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              onClick={(e) => {
                e.stopPropagation();
                toggle();
              }}
              aria-label={
                isExpanded ? "Collapse deck drawer" : "Expand deck drawer"
              }
            >
              {!isExpanded && (
                <span className="text-xs uppercase font-bold tracking-widest">
                  {`${totalCount}/6 Cards`}
                </span>
              )}
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
          {/* Action Toolbar */}
          <ActionToolbar
            {...{
              onImport,
              onLibraryOpen,
              hideGlobalActions,
              onSave,
              isSaved,
              onShare,
              onClear,
              onExportToSolo,
            }}
          />
        </div>

        {/* Mobile: Conditional Render */}
        <div className="xl:hidden" onClick={(e) => e.stopPropagation()}>
          {isExpanded ? (
            <ActionToolbar
              {...{
                onImport,
                onLibraryOpen,
                hideGlobalActions,
                onSave,
                isSaved,
                onShare,
                onClear,
                onExportToSolo,
              }}
            />
          ) : (
            <div className="flex items-center gap-1">
              {/* Validation Dots (Collapsed) */}
              <div className="flex gap-1">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    deck.spellcaster ? "bg-brand-accent" : "bg-surface-hover"
                  )}
                />
                {deck.slots.slice(0, 4).map((s) => (
                  <div
                    key={s.index}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      s.unit ? "bg-brand-primary" : "bg-surface-hover"
                    )}
                  />
                ))}
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    deck.slots[4]?.unit
                      ? "bg-slot-titan-dot"
                      : "bg-surface-hover"
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 overflow-hidden relative",
          isExpanded && "xl:overflow-visible"
        )}
      >
        <div
          id="drawer-content"
          className={cn(
            "transition-opacity duration-200",
            // Mobile: Relative when expanded to push height, Absolute when collapsed to hide
            isExpanded
              ? "relative opacity-100 pointer-events-auto"
              : "absolute inset-0 opacity-0 pointer-events-none"
          )}
        >
          <ActiveDeckTray
            slots={deck.slots}
            spellcaster={deck.spellcaster}
            validation={validation}
            onSelect={(item, pos, slotIndex) => {
              handleActivate(); // Critical: Ensure this deck is active context before opening inspector
              onSelect?.(item, pos, slotIndex);
            }}
            deckId={deck.id}
            idSuffix={idSuffix}
            isSwapMode={isSwapTarget}
          />
        </div>
      </div>
    </div>
  );
});
