



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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-card border border-brand-primary/50 rounded-lg p-6 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-white mb-2">
          Unsaved Deck Changes
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-6">
          You have an active deck in your workspace. Would you like to save it
          before loading the shared deck?
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm font-bold text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded text-sm font-bold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
          >
            Discard & Load
          </button>
          <button
            onClick={onSaveAndImport}
            className="px-6 py-2 rounded text-sm font-bold bg-brand-primary text-white hover:bg-brand-primary/80 shadow-lg shadow-brand-primary/20 transition-all hover:scale-105"
          >
            Save & Load
          </button>
        </div>
      </div>
    </div>
  );
}
