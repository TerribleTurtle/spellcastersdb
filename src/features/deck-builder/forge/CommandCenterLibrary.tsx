import { SoloForgeList } from "./lists/SoloForgeList";
import { TeamForgeList } from "./lists/TeamForgeList";

interface CommandCenterLibraryProps {
  mode: string;
  isImporting: boolean;
  selectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
}

export function CommandCenterLibrary({
  mode,
  isImporting,
  selectionMode,
  selectedIds,
  onToggleSelection,
}: CommandCenterLibraryProps) {
  return (
    <div className="md:col-span-9 flex flex-col bg-black/20 overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-white/5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
          {mode === "TEAM" && !isImporting ? "Saved Teams" : "Saved Decks"}
        </h3>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        {/* Main List */}
        {mode === "TEAM" && !isImporting ? (
          <TeamForgeList
            justSaved={false}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelection}
          />
        ) : (
          <SoloForgeList
            isTeamMode={isImporting}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelection}
          />
        )}
      </div>
    </div>
  );
}
