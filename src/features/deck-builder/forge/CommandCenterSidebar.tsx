import { cn } from "@/lib/utils";

interface CommandCenterSidebarProps {
  mode: string;
  isImporting: boolean;
  selectionMode: boolean;
  onSetMode: (mode: "SOLO" | "TEAM") => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function CommandCenterSidebar({
  mode,
  isImporting,
  selectionMode,
  onSetMode,
  onSelectAll,
  onDeselectAll,
}: CommandCenterSidebarProps) {
  return (
    <div className="md:col-span-3 p-6 space-y-6 border-r border-white/10 overflow-y-auto bg-gray-900/50">
      {/* Mode Switcher - Hide when importing */}
      {!isImporting && !selectionMode && (
        <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Builder Mode
          </span>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onSetMode("SOLO")}
              data-testid="mode-switch-solo"
              className={cn(
                "flex items-center justify-between py-3 px-4 text-xs font-bold uppercase rounded border transition-all",
                mode === "SOLO"
                  ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                  : "bg-black/40 text-gray-400 border-white/10 hover:text-white hover:border-white/30"
              )}
            >
              <span>Solo Deck</span>
              {mode === "SOLO" && (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
            <button
              onClick={() => onSetMode("TEAM")}
              data-testid="mode-switch-team"
              className={cn(
                "flex items-center justify-between py-3 px-4 text-xs font-bold uppercase rounded border transition-all",
                mode === "TEAM"
                  ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                  : "bg-black/40 text-gray-400 border-white/10 hover:text-white hover:border-white/30"
              )}
            >
              <span>Team Roster</span>
              {mode === "TEAM" && (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Selection Controls */}
      {selectionMode && (
        <div className="p-4 bg-brand-primary/5 rounded-lg border border-brand-primary/20 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
            Selection
          </span>
          <button
            onClick={onSelectAll}
            className="w-full py-2 text-xs font-bold text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
          >
            Select All
          </button>
          <button
            onClick={onDeselectAll}
            className="w-full py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            Deselect All
          </button>
        </div>
      )}

      <div className="pt-4 text-[10px] text-gray-400 text-center leading-relaxed border-t border-white/5 mt-auto">
        {selectionMode ? (
          <p>Select items to delete them in bulk.</p>
        ) : (
          <p>Load a deck to edit it in the main workspace.</p>
        )}
      </div>
    </div>
  );
}
