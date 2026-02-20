"use client";

import { ChevronDown, Crown, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useInspectorLogic } from "@/features/deck-builder/hooks/domain/useInspectorLogic";
import { cn } from "@/lib/utils";
import { DECK_SLOTS } from "@/services/config/constants";
import { useDeckStore } from "@/store/index";
import { UnifiedEntity } from "@/types/api";

import { InspectorActionButton } from "./details/InspectorActionButton";
import { InspectorSlotButton } from "./details/InspectorSlotButton";

interface InspectorControlsProps {
  item: UnifiedEntity;
  onClose?: () => void;
}

export function InspectorControls({ item, onClose }: InspectorControlsProps) {
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
    getStatus,
  } = useInspectorLogic({ item });

  if (isReadOnly) {
    if (onClose) {
      return (
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full py-6 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2"
        >
          <ChevronDown size={18} /> Close Inspector
        </Button>
      );
    }
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {isSpellcaster ? (
        <div className="flex flex-col gap-2">
          <InspectorActionButton
            onClick={() => {
              handleSelectSpellcaster();
              onClose?.();
            }}
            isSelected={isCurrentSpellcaster}
            className={cn(
              "w-full py-6 text-sm font-bold flex items-center justify-center gap-2"
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
          </InspectorActionButton>

          {onClose && (
            <Button onClick={onClose} variant="outline" className="w-full">
              <ChevronDown size={16} /> Close
            </Button>
          )}
        </div>
      ) : isTitan ? (
        <div className="flex gap-2">
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              aria-label="Close Inspector"
              className="px-4"
            >
              <ChevronDown size={20} />
            </Button>
          )}
          <InspectorActionButton
            onClick={() => {
              handleSelectTitan();
              onClose?.();
            }}
            isSelected={isTitanInDeck}
            className={cn(
              "flex-1 py-6 text-sm font-bold flex items-center justify-center gap-2",
              isTitanInDeck && "opacity-50"
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
          </InspectorActionButton>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
            <Button onClick={onClose} variant="outline" className="w-full">
              <ChevronDown size={16} /> Close
            </Button>
          )}
        </>
      )}
    </div>
  );
}
