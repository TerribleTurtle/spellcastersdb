import { AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";

import { useFocusTrap } from "@/hooks/useFocusTrap";

export interface UnsavedChangesModalProps {
  isOpen: boolean;
  onDiscard: () => void;
  onCancel: () => void; // This will trigger "Return to Save"
  title?: string;
  description?: React.ReactNode;
}

export function UnsavedChangesModal({
  isOpen,
  onDiscard,
  onCancel,
  title = "Unsaved Changes",
  description = "You have unsaved changes. Do you want to save them before clearing?",
}: UnsavedChangesModalProps) {
  const modalRef = useFocusTrap(isOpen, onCancel);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-surface-card border border-border-default rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-modal-title"
      >
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-full bg-status-warning-border text-status-warning mx-auto flex items-center justify-center mb-2">
            <AlertTriangle size={24} />
          </div>
          <h3
            id="unsaved-modal-title"
            className="text-lg font-bold text-text-primary"
          >
            {title}
          </h3>
          <p className="text-sm text-text-muted">{description}</p>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2">
          {/* Return to Save (Primary Action - Safe) */}
          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded bg-brand-primary text-brand-dark hover:bg-brand-primary/90 font-bold shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Return to Save
          </button>

          {/* Clear Anyway (Destructive) */}
          <button
            onClick={onDiscard}
            className="w-full py-2.5 rounded bg-status-danger-muted text-status-danger hover:bg-status-danger-border border border-status-danger-border font-bold transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Clear Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
