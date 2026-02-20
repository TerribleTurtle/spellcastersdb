import { Check, CopyPlus, Eraser, Import, Save, Share2 } from "lucide-react";

import { LibraryButton } from "@/components/ui/LibraryButton";
import { Button } from "@/components/ui/button";
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
        <Button
          onClick={onImport}
          variant="ghost"
          data-testid="toolbar-import-btn"
          className="h-auto flex items-center gap-1.5 px-3 py-1.5 bg-surface-card border border-border-default hover:bg-surface-card text-text-secondary hover:text-text-primary rounded text-xs font-bold uppercase tracking-wider transition-all focus-visible:ring-2 focus-visible:ring-brand-primary"
          title="Import Deck"
          aria-label="Import Deck"
        >
          <Import size={16} />
          <span className="hidden md:inline">Import</span>
        </Button>
      )}

      {/* Library Action */}
      {onLibraryOpen && !hideGlobalActions && (
        <LibraryButton
          onClick={onLibraryOpen}
          data-testid="toolbar-library-btn"
        />
      )}

      {/* Save Action */}
      {onSave && !hideGlobalActions && (
        <Button
          onClick={onSave}
          data-testid="toolbar-save-btn"
          className={cn(
            "h-auto flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all focus-visible:ring-2 focus-visible:ring-brand-primary",
            isSaved
              ? "bg-status-success-muted text-status-success-text cursor-default hover:bg-status-success-border"
              : "bg-brand-primary text-brand-dark hover:bg-brand-primary/90 shadow-brand-primary/20 shadow-lg"
          )}
          title={isSaved ? "Deck Saved" : "Save Deck"}
          aria-label={isSaved ? "Deck Saved" : "Save Deck"}
        >
          {isSaved ? <Check size={16} /> : <Save size={16} />}
          <span className="hidden md:inline">{isSaved ? "Saved" : "Save"}</span>
        </Button>
      )}

      {/* Share Action */}
      {onShare && !hideGlobalActions && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onShare}
          className="text-text-muted hover:text-brand-accent hover:bg-brand-accent/10 rounded transition-colors focus-visible:ring-2 focus-visible:ring-brand-accent h-9 w-9"
          title="Share"
          aria-label="Share"
        >
          <Share2 size={18} />
        </Button>
      )}

      {/* Clear Action */}
      {onClear && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          data-testid="toolbar-clear-btn"
          className="text-text-muted hover:text-status-danger-text hover:bg-status-danger-muted rounded transition-colors focus-visible:ring-2 focus-visible:ring-red-500 h-9 w-9"
          title="Clear Deck"
          aria-label="Clear Deck"
        >
          <Eraser size={18} />
        </Button>
      )}

      {/* Export to Solo Action */}
      {onExportToSolo && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onExportToSolo}
          className="text-text-muted hover:text-brand-accent hover:bg-brand-accent/10 rounded transition-colors focus-visible:ring-2 focus-visible:ring-brand-accent h-9 w-9"
          title="Save Copy to Solo Library"
          aria-label="Save Copy to Solo Library"
        >
          <CopyPlus size={18} />
        </Button>
      )}
    </div>
  );
}
