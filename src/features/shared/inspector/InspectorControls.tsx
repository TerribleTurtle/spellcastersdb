"use client";

import { Crown, PlusCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedEntity } from "@/types/api";
import { DECK_SLOTS } from "@/services/config/constants";
import { InspectorSlotButton } from "./details/InspectorSlotButton";
import { useInspectorLogic } from "@/features/deck-builder/hooks/domain/useInspectorLogic";
import { useDeckStore } from "@/store/index";

interface InspectorControlsProps {
  item: UnifiedEntity;
  onClose?: () => void;
}

export function InspectorControls({
  item,
  onClose,
}: InspectorControlsProps) {
    const inspectorOptions = useDeckStore((state) => state.inspectorOptions);
    const isReadOnly = inspectorOptions?.isReadOnly;
  const {
      isSpellcaster,
      isCurrentSpellcaster,
      isTitan,
      isTitanInDeck,
      handleSelectSpellcaster,
      handleSelectTitan,
      handleSelectSlot,
      getStatus
  } = useInspectorLogic({ item });

  if (isReadOnly) {
      if (onClose) {
          return (
            <button 
                onClick={onClose}
                className="w-full py-3 bg-surface-card hover:bg-surface-hover border border-white/10 rounded-lg text-muted hover:text-white transition-colors font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            >
                <ChevronDown size={18} /> Close Inspector
            </button>
          );
      }
      return null;
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {isSpellcaster ? (
        <div className="flex flex-col gap-2">
            <button
            onClick={() => {
                handleSelectSpellcaster();
                onClose?.();
            }}
            disabled={isCurrentSpellcaster}
            className={cn(
                "w-full py-3 text-sm font-bold rounded flex items-center justify-center gap-2 transition-all duration-200",
                isCurrentSpellcaster
                ? "bg-white/10 text-gray-500 cursor-not-allowed border border-white/5"
                : "bg-surface-card hover:bg-brand-secondary/50 border border-white/10 hover:border-brand-secondary text-white"
            )}
            >
            {isCurrentSpellcaster ? (
                <>
                <Crown size={18} className="opacity-50" /> Selected
                </>
            ) : (
                <>
                <Crown size={18} /> Select Spellcaster
                </>
            )}
            </button>
            
             {onClose && (
                <button 
                    onClick={onClose}
                    className="w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-muted hover:text-white bg-surface-card hover:bg-surface-hover rounded border border-white/10 transition-colors"
                >
                    <ChevronDown size={16} /> Close
                </button>
            )}
        </div>
      ) : isTitan ? (
        <div className="flex gap-2">
            {onClose && (
                <button 
                    onClick={onClose}
                    aria-label="Close Inspector"
                    className="px-4 bg-surface-card hover:bg-surface-hover border border-white/10 rounded text-muted hover:text-white transition-colors"
                >
                    <ChevronDown size={20} />
                </button>
            )}
            <button
            onClick={() => {
                handleSelectTitan();
                onClose?.();
            }}
            disabled={isTitanInDeck}
            className={cn(
                "flex-1 py-3 text-sm font-bold rounded flex items-center justify-center gap-2 transition-all duration-200",
                isTitanInDeck
                ? "bg-white/10 text-gray-500 cursor-not-allowed border border-white/5"
                : "bg-surface-card hover:bg-brand-secondary/50 border border-white/10 hover:border-brand-secondary text-white"
            )}
            >
            {isTitanInDeck ? (
                <>
                <PlusCircle size={18} className="opacity-50" /> Selected
                </>
            ) : (
                <>
                <PlusCircle size={18} /> Select Titan
                </>
            )}
            </button>
        </div>
      ) : (
        <>
            <div className="grid grid-cols-4 gap-2">
            {DECK_SLOTS.map((idx) => {
                const status = getStatus(idx);
                const isOccupiedBySelf = status === "ALREADY_IN";

                return (
                <InspectorSlotButton
                    key={idx}
                    index={idx}
                    isOccupiedBySelf={isOccupiedBySelf}
                    onClick={() => {
                        handleSelectSlot(idx);
                        onClose?.();
                    }}
                />
                );
            })}
            </div>
            {onClose && (
                <button 
                    onClick={onClose}
                    className="w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-muted hover:text-white bg-surface-card hover:bg-surface-hover rounded border border-white/10 transition-colors"
                >
                    <ChevronDown size={16} /> Close
                </button>
            )}
        </>
      )}
    </div>
  );
}

