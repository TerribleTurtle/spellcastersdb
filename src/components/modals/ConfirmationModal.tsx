
import React from 'react';
import { Save, Layers } from 'lucide-react';

export interface ConfirmationModalProps {
  name: string;
  type: "COLLISION" | "UPDATE";
  onOverwrite: () => void;
  onCopy: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  name,
  type,
  onOverwrite,
  onCopy,
  onCancel,
}: ConfirmationModalProps) {
  const isUpdate = type === "UPDATE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-card border border-white/10 rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-4">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center mb-2">
            <Save size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">
            {isUpdate ? "Save Changes?" : "Deck Already Exists"}
          </h3>
          <p className="text-sm text-gray-400">
            {isUpdate ? (
              <>
                To deck{" "}
                <span className="text-white font-bold">&quot;{name}&quot;</span>
              </>
            ) : (
              <>
                A deck named{" "}
                <span className="text-white font-bold">&quot;{name}&quot;</span>{" "}
                already exists.
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2">
          <button
            onClick={onOverwrite}
            className="w-full py-2.5 rounded bg-brand-primary text-white hover:bg-brand-primary/80 font-bold shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {isUpdate ? "Overwrite Existing" : "Overwrite"}
          </button>

          <button
            onClick={onCopy}
            className="w-full py-2.5 rounded bg-surface-main border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-bold transition-all flex items-center justify-center gap-2"
          >
            <Layers size={16} />
            {isUpdate ? "Save as New Copy" : "Save as Copy"}
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
