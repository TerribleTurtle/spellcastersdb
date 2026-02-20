import { useFocusTrap } from "@/hooks/useFocusTrap";

interface ImportConflictModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  onSaveAndImport: () => void;
}

export function ImportConflictModal({
  onCancel,
  onConfirm,
  onSaveAndImport,
}: ImportConflictModalProps) {
  const modalRef = useFocusTrap(true, onCancel);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-conflict-title"
        className="bg-surface-card border border-brand-primary/50 rounded-lg p-6 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200"
      >
        <h3
          id="import-conflict-title"
          className="text-xl font-bold text-text-primary mb-2"
        >
          Unsaved Deck Changes
        </h3>
        <p className="text-sm text-text-muted leading-relaxed mb-6">
          You have an active deck in your workspace. Would you like to save it
          before loading the shared deck?
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm font-bold text-text-dimmed hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded text-sm font-bold text-status-danger-text hover:bg-status-danger-muted border border-transparent hover:border-status-danger-border transition-colors"
          >
            Discard & Load
          </button>
          <button
            onClick={onSaveAndImport}
            className="px-6 py-2 rounded text-sm font-bold bg-brand-primary text-brand-dark hover:bg-brand-primary/80 shadow-lg shadow-brand-primary/20 transition-all hover:scale-105"
          >
            Save & Load
          </button>
        </div>
      </div>
    </div>
  );
}
