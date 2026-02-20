import { AlertTriangle, Trash2 } from "lucide-react";

import { useFocusTrap } from "@/hooks/useFocusTrap";

export interface DeleteConfirmationModalProps {
  title?: string;
  description?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}

export function DeleteConfirmationModal({
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  onConfirm,
  onCancel,
  confirmText = "Delete",
}: DeleteConfirmationModalProps) {
  const modalRef = useFocusTrap(true, onCancel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-surface-card border border-border-default rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-full bg-status-danger-muted text-status-danger mx-auto flex items-center justify-center mb-2 border border-status-danger-border">
            <AlertTriangle size={24} />
          </div>
          <h3 id="modal-title" className="text-lg font-bold text-text-primary">
            {title}
          </h3>
          <p className="text-sm text-text-muted">{description}</p>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2">
          <button
            onClick={onConfirm}
            className="w-full py-2.5 rounded bg-status-danger text-text-primary hover:bg-status-danger/90 font-bold shadow-lg shadow-status-danger/20 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            {confirmText}
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-card font-bold transition-all text-xs uppercase tracking-wider mt-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
