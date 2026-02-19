import React from "react";
import { createPortal } from "react-dom";

import { AlertTriangle, Trash2 } from "lucide-react";

import { useFocusTrap } from "@/hooks/useFocusTrap";

interface ClearDataConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClearDataConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: ClearDataConfirmationModalProps) {
  const modalRef = useFocusTrap(isOpen, onClose);
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-250 flex items-center justify-center p-4 bg-surface-overlay backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-surface-main border border-red-500/30 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-data-title"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-status-danger">
            <div className="p-2 bg-status-danger-muted rounded-full">
              <AlertTriangle size={24} />
            </div>
            <h3
              id="clear-data-title"
              className="text-lg font-bold text-text-primary"
            >
              Delete All Data
            </h3>
          </div>

          <div className="space-y-3">
            <p className="text-text-secondary text-sm leading-relaxed">
              <strong className="text-status-danger-text">WARNING:</strong> This
              action is{" "}
              <strong className="text-text-primary">irreversible</strong>.
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">
              You are about to permanently delete{" "}
              <strong className="text-text-primary">ALL</strong> saved decks and
              teams from your browser&apos;s local storage.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle mt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded text-sm font-bold text-text-muted hover:text-text-primary hover:bg-surface-card transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-action-danger-hover text-text-primary rounded text-sm font-bold shadow-lg shadow-action-danger-hover/20 hover:bg-action-danger transition-all"
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
