import {
  CheckSquare,
  Copy,
  Download,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface CommandCenterHeaderProps {
  mode: string;
  isImporting: boolean;
  selectionMode: boolean;
  selectedCount: number;
  onExport: () => void;
  onImportClick: () => void;
  onClearDataClick: () => void;
  onMassDelete: () => void;
  onToggleSelectionMode: () => void;
  onClose: () => void;
}

export function CommandCenterHeader({
  mode,
  isImporting,
  selectionMode,
  selectedCount,
  onExport,
  onImportClick,
  onClearDataClick,
  onMassDelete,
  onToggleSelectionMode,
  onClose,
}: CommandCenterHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border-default bg-surface-deck/50 shrink-0">
      <div className="flex items-center gap-3">
        <SettingsIcon mode={mode} isImporting={isImporting} />
        <h2
          id="modal-title"
          className="text-lg font-bold uppercase tracking-wider text-text-primary"
        >
          {isImporting ? "Import Deck" : "Deck Library"}
        </h2>

        {/* Selection Mode Indicator */}
        {selectionMode && (
          <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/20 border border-brand-primary/50 rounded-full">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
              {selectedCount} Selected
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Backup / Restore / Clear Actions (Only visible when NOT importing single deck) */}
        {!isImporting && !selectionMode && (
          <div className="flex items-center gap-1 mr-2 border-r border-border-default pr-2">
            <button
              onClick={onExport}
              data-testid="export-data-btn"
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded transition-colors"
              title="Export Backup"
            >
              <Download size={18} />
            </button>
            <button
              onClick={onImportClick}
              data-testid="import-data-btn"
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded transition-colors"
              title="Import Backup"
            >
              <Upload size={18} />
            </button>
            <button
              onClick={onClearDataClick}
              data-testid="clear-data-btn"
              className="p-2 text-status-danger-text/70 hover:text-status-danger-text hover:bg-status-danger-muted rounded transition-colors ml-1"
              title="Delete All Data"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}

        {/* Mass Delete Actions */}
        {selectionMode && selectedCount > 0 && (
          <div className="flex items-center gap-1 mr-2 animate-in fade-in slide-in-from-right-4 duration-200">
            <button
              onClick={onMassDelete}
              className="flex items-center gap-2 px-3 py-1.5 bg-status-danger-muted hover:bg-status-danger-border text-status-danger-text border border-red-500/50 rounded transition-colors"
            >
              <Trash2 size={16} />
              <span className="text-xs font-bold uppercase">
                Delete ({selectedCount})
              </span>
            </button>
          </div>
        )}

        {/* Selection Mode Toggle */}
        {!isImporting && (
          <button
            onClick={onToggleSelectionMode}
            className={cn(
              "p-2 rounded transition-colors mr-2",
              selectionMode
                ? "text-brand-primary bg-brand-primary/10 ring-1 ring-brand-primary/50"
                : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
            )}
            title={selectionMode ? "Cancel Selection" : "Select Items"}
          >
            {selectionMode ? <X size={20} /> : <CheckSquare size={20} />}
          </button>
        )}

        <button
          onClick={onClose}
          className="p-3 -mr-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

function SettingsIcon({
  mode,
  isImporting,
}: {
  mode: string;
  isImporting: boolean;
}) {
  if (isImporting) return <Copy size={20} className="text-brand-primary" />;
  if (mode === "TEAM") return <Users size={20} className="text-brand-accent" />;
  return (
    <div className="w-5 h-5 rounded bg-brand-primary/20 border border-brand-primary/50 flex items-center justify-center text-[10px] font-bold text-brand-primary">
      S
    </div>
  );
}
