import { Layers, Save } from "lucide-react";

import { useFocusTrap } from "@/hooks/useFocusTrap";

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
  const modalRef = useFocusTrap(true, onCancel);
  const isUpdate = type === "UPDATE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay backdrop-blur-sm p-(--padding-dialog) animate-in fade-in duration-(--duration-normal)">
      <div
        ref={modalRef}
        className="bg-surface-card border border-border-default rounded-lg shadow-2xl max-w-sm w-full p-(--padding-dialog) space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center mb-2">
            <Save size={24} />
          </div>
          <h3 id="modal-title" className="text-lg font-bold text-text-primary">
            {isUpdate ? "Save Changes?" : "Deck Already Exists"}
          </h3>
          <p className="text-sm text-text-muted">
            {isUpdate ? (
              <>
                To deck{" "}
                <span className="text-text-primary font-bold">
                  &quot;{name}&quot;
                </span>
              </>
            ) : (
              <>
                A deck named{" "}
                <span className="text-text-primary font-bold">
                  &quot;{name}&quot;
                </span>{" "}
                already exists.
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-2">
          <button
            onClick={onOverwrite}
            className="w-full py-2.5 rounded bg-brand-primary text-brand-dark hover:bg-brand-primary/80 font-bold shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {isUpdate ? "Overwrite Existing" : "Overwrite"}
          </button>

          <button
            onClick={onCopy}
            className="w-full py-2.5 rounded bg-surface-main border border-border-default text-text-secondary hover:text-text-primary hover:bg-surface-card font-bold transition-all flex items-center justify-center gap-2"
          >
            <Layers size={16} />
            {isUpdate ? "Save as New Copy" : "Save as Copy"}
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
