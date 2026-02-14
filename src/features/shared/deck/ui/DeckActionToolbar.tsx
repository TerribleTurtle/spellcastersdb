import { Import, Library, Check, Save, Share2, Eraser, CopyPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeckActionToolbarProps {
  onImport?: () => void;
  onLibraryOpen?: () => void;
  hideGlobalActions?: boolean;
  onSave?: () => void;
  isSaved?: boolean;
  onShare?: () => void;
  onClear?: () => void;
  onExportToSolo?: () => void;
}

export function DeckActionToolbar({
  onImport,
  onLibraryOpen,
  hideGlobalActions,
  onSave,
  isSaved,
  onShare,
  onClear,
  onExportToSolo,
}: DeckActionToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Import Action */}
      {onImport && (
        <button
          onClick={onImport}
          data-testid="toolbar-import-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-card border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white rounded text-xs font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary"
          title="Import Deck"
          aria-label="Import Deck"
        >
          <Import size={16} />
          <span className="hidden md:inline">Import</span>
        </button>
      )}

      {/* Library Action */}
      {onLibraryOpen && !hideGlobalActions && (
        <button
          onClick={onLibraryOpen}
          data-testid="toolbar-library-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-card border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white rounded text-xs font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary"
          title="Open Deck Library"
          aria-label="Open Deck Library"
        >
          <Library size={16} />
          <span className="hidden md:inline">Library</span>
        </button>
      )}

      {/* Save Action */}
      {onSave && !hideGlobalActions && (
        <button
          onClick={onSave}
          data-testid="toolbar-save-btn"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary",
            isSaved
              ? "bg-green-500/10 text-green-400 cursor-default"
              : "bg-brand-primary text-white hover:bg-brand-primary/90 shadow-brand-primary/20 shadow-lg"
          )}
          title={isSaved ? "Deck Saved" : "Save Deck"}
          aria-label={isSaved ? "Deck Saved" : "Save Deck"}
        >
          {isSaved ? <Check size={16} /> : <Save size={16} />}
          <span className="hidden md:inline">{isSaved ? "Saved" : "Save"}</span>
        </button>
      )}

      {/* Share Action */}
      {onShare && !hideGlobalActions && (
        <button
          onClick={onShare}
          className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
          title="Share"
          aria-label="Share"
        >
          <Share2 size={18} />
        </button>
      )}

      {/* Clear Action */}
      {onClear && (
        <button
          onClick={onClear}
          data-testid="toolbar-clear-btn"
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Clear Deck"
          aria-label="Clear Deck"
        >
          <Eraser size={18} />
        </button>
      )}

      {/* Export to Solo Action */}
      {onExportToSolo && (
        <button
          onClick={onExportToSolo}
          className="p-2 text-gray-400 hover:text-brand-accent hover:bg-brand-accent/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent"
          title="Save Copy to Solo Library"
          aria-label="Save Copy to Solo Library"
        >
          <CopyPlus size={18} />
        </button>
      )}
    </div>
  );
}
