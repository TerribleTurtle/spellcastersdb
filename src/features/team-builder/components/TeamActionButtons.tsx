"use client";

import { Edit, Save } from "lucide-react";

import { cn } from "@/lib/utils";

interface TeamActionButtonsProps {
  onBack?: () => void;
  isReadOnly?: boolean;
  onSave?: () => void;
  existingId?: string | null;
  onEditDeck: (index: number) => void;
}

export function TeamActionButtons({
  onBack,
  isReadOnly,
  onSave,
  existingId,
  onEditDeck,
}: TeamActionButtonsProps) {
  return (
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
          {onSave && (
            <button
              onClick={onSave}
              className="px-6 md:px-8 py-3 bg-brand-primary text-white font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-brand-primary/90 hover:scale-105 transition-all flex items-center gap-2 text-xs md:text-sm"
            >
              <Save size={16} />
              Save
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
            {isReadOnly ? "Edit Decks" : "Edit Decks"}
          </button>
        </>
      )}
    </div>
  );
}
