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
            data-testid={`inspector-slot-btn-${index}`}
            disabled={isOccupiedBySelf}
            className={cn(
                "py-2 text-xs rounded transition-colors flex flex-col items-center justify-center",
                isOccupiedBySelf
                    ? "bg-surface-hover border-border-subtle text-text-dimmed cursor-not-allowed"
                    : "bg-surface-card hover:bg-brand-secondary/50 border border-border-default hover:border-brand-secondary text-text-primary"
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
