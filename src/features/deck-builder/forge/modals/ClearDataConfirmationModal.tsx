import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";

interface ClearDataConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClearDataConfirmationModal({ isOpen, onClose, onConfirm }: ClearDataConfirmationModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-250 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-gray-900 border border-red-500/30 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-data-title"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-red-500">
            <div className="p-2 bg-red-500/10 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <h3 id="clear-data-title" className="text-lg font-bold text-white">Clear All Data</h3>
          </div>
          
          <div className="space-y-3">
             <p className="text-gray-300 text-sm leading-relaxed">
                <strong className="text-red-400">WARNING:</strong> This action is <strong className="text-white">irreversible</strong>.
             </p>
             <p className="text-gray-300 text-sm leading-relaxed">
                You are about to permanently delete <strong className="text-white">ALL</strong> saved decks and teams from your browser&apos;s local storage.
             </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-2">
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
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded text-sm font-bold shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all"
            >
              <Trash2 size={16} />
              Yes, Delete Everything
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
