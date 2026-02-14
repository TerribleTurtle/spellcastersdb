"use client";

import { cn } from "@/lib/utils";
import { SlotIndex } from "@/types/deck";

interface InspectorSlotButtonProps {
    index: SlotIndex;
    isOccupiedBySelf: boolean;
    onClick: () => void;
}

export function InspectorSlotButton({
    index,
    isOccupiedBySelf,
    onClick
}: InspectorSlotButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={isOccupiedBySelf}
            className={cn(
                "py-2 text-xs rounded transition-colors flex flex-col items-center justify-center",
                isOccupiedBySelf
                    ? "bg-white/10 border-white/5 text-gray-500 cursor-not-allowed"
                    : "bg-white/5 hover:bg-brand-secondary/50 border border-white/10 hover:border-brand-secondary text-white"
            )}
        >
            <span>Slot {index + 1}</span>
            {isOccupiedBySelf && (
                <span className="text-[9px] uppercase tracking-widest opacity-60">
                    Selected
                </span>
            )}
        </button>
    );
}
