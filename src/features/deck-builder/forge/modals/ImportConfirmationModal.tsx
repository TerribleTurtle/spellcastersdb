import React from "react";
import { AlertTriangle, Upload } from "lucide-react";
import { createPortal } from "react-dom";

interface ImportConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ImportConfirmationModal({ isOpen, onClose, onConfirm }: ImportConfirmationModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-250 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-title"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <div className="p-2 bg-amber-400/10 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <h3 id="import-title" className="text-lg font-bold text-white">Import Library</h3>
          </div>
          
          <p className="text-gray-300 text-sm leading-relaxed">
            Importing a backup file will <strong className="text-white">append</strong> the decks and teams to your current library. 
            Existing items will <strong className="text-white">not</strong> be deleted or overwritten.
          </p>
          
          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded text-xs text-blue-200">
             Tip: If you want a clean import, please clear your library first.
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all"
            >
              <Upload size={16} />
              Confirm Import
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
