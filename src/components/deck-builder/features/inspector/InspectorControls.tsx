"use client";

import { Crown, PlusCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedEntity } from "@/types/api";
import { DECK_SLOTS } from "@/services/config/constants";
import { InspectorSlotButton } from "./details/InspectorSlotButton";
import { useInspectorLogic } from "@/components/deck-builder/hooks/domain/useInspectorLogic";
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
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2"
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
                "w-full py-3 font-bold rounded flex items-center justify-center gap-2 transition-colors duration-200",
                isCurrentSpellcaster
                ? "bg-white/10 text-gray-400 cursor-not-allowed border border-white/5"
                : "bg-brand-primary hover:bg-brand-primary/80 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            )}
            >
            {isCurrentSpellcaster ? (
                <>
                <Crown size={20} className="opacity-50" /> Selected
                </>
            ) : (
                <>
                <Crown size={20} /> Select
                </>
            )}
            </button>
            
             {onClose && (
                <button 
                    onClick={onClose}
                    className="w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
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
                    className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-400 hover:text-white transition-colors"
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
                "flex-1 py-3 font-bold rounded flex items-center justify-center gap-2 transition-colors duration-200",
                isTitanInDeck
                ? "bg-white/10 text-gray-400 cursor-not-allowed border border-white/5"
                : "bg-brand-primary hover:bg-brand-primary/80 text-white"
            )}
            >
            {isTitanInDeck ? (
                <>
                <PlusCircle size={18} className="opacity-50" /> Selected
                </>
            ) : (
                <>
                <PlusCircle size={18} /> Select
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
                    className="w-full py-2 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
                >
                    <ChevronDown size={16} /> Close
                </button>
            )}
        </>
      )}
    </div>
  );
}

