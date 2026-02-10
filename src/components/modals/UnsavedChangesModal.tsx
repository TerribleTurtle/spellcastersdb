
import React from 'react';
import { AlertCircle, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn is available here or adjust path

export interface UnsavedChangesModalProps {
  type: "LOAD_TEAM" | "LOAD_DECK" | "IMPORT";
  onConfirm: () => void;
  onCancel: () => void;
  onSaveAndContinue: () => void;
  isNew: boolean;
}

export function UnsavedChangesModal({
  type,
  onConfirm,
  onCancel,
  onSaveAndContinue,
  isNew,
}: UnsavedChangesModalProps) {
  const title = type === "IMPORT" ? "Overwrite Slot?" : "Unsaved Changes";
  const description =
    type === "IMPORT"
      ? "Importing this deck will overwrite the current slot. You have unsaved changes in your team that will be affected."
      : `You have unsaved changes. Loading a new ${type === "LOAD_TEAM" ? "team" : "deck"} will discard them.`;

  const confirmLabel =
    type === "IMPORT"
      ? "Overwrite"
      : isNew
        ? "Discard Changes"
        : "Discard & Load";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-card border border-white/10 rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-4">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center mb-2">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {!isNew && (
            <button
              onClick={onSaveAndContinue}
              className="w-full py-2.5 rounded bg-brand-primary text-white hover:bg-brand-primary/80 font-bold shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Update & Continue
            </button>
          )}

          <button
            onClick={onConfirm}
            className={cn(
              "w-full py-2.5 rounded font-bold transition-all flex items-center justify-center gap-2",
              isNew
                ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300"
            )}
          >
            <Trash2 size={16} />
            {confirmLabel}
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded text-gray-400 hover:text-white hover:bg-white/5 font-bold transition-all text-xs uppercase tracking-wider mt-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
