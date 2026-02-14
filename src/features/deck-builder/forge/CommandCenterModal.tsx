"use client";

import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { SoloForgeList } from "./lists/SoloForgeList";
import { TeamForgeList } from "./lists/TeamForgeList";

import { useFocusTrap } from "@/hooks/useFocusTrap";

import { ImportConfirmationModal } from "./modals/ImportConfirmationModal";
import { ClearDataConfirmationModal } from "./modals/ClearDataConfirmationModal";
import { CheckSquare, Download, Upload, Trash2, X, Copy, Users } from "lucide-react";
import { useCommandCenter } from "@/features/deck-builder/hooks/ui/useCommandCenter";
import { useDeckStore } from "@/store/index";

export function CommandCenterModal() {
  const { 
      // State
      commandCenterOpen,
      closeCommandCenter,
      mode,
      isImporting,
      selectionMode,
      selectedIds,
      showImportConfirm, setShowImportConfirm,
      showClearDataConfirm, setShowClearDataConfirm,
      fileInputRef,
      
      // Methods
      toggleSelectionMode,
      toggleItemSelection,
      selectAll,
      deselectAll,
      handleMassDelete,
      handleExport,
      handleImportClick,
      handleImportFile,
      handleClearData
  } = useCommandCenter();
  
  // Hydration/Mounting handled by parent conditional rendering.
  // We still need closeCommandCenter for the focus trap.
  const modalRef = useFocusTrap(commandCenterOpen, closeCommandCenter);

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden"
      style={{ zIndex: 200 }} 
      onClick={closeCommandCenter}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-5xl h-[90vh] bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-950/50 shrink-0">
            <div className="flex items-center gap-3">
                <SettingsIcon mode={mode} isImporting={isImporting} />
                <h2 id="modal-title" className="text-lg font-bold uppercase tracking-wider text-white">
                    {isImporting ? "Import Deck" : "Deck Library"}
                </h2>
                
                {/* Selection Mode Indicator */}
                {selectionMode && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/20 border border-brand-primary/50 rounded-full">
                        <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                            {selectedIds.size} Selected
                        </span>
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-2">
                {/* Backup / Restore / Clear Actions (Only visible when NOT importing single deck) */}
                {!isImporting && !selectionMode && (
                    <div className="flex items-center gap-1 mr-2 border-r border-white/10 pr-2">
                        <button 
                             onClick={handleExport}
                             className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                             title="Export Backup"
                        >
                            <Download size={18} />
                        </button>
                         <button 
                             onClick={handleImportClick}
                             className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                             title="Import Backup"
                        >
                            <Upload size={18} />
                        </button>
                        <button 
                             onClick={() => setShowClearDataConfirm(true)}
                             className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors ml-1"
                             title="Delete All Data"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}

                {/* Mass Delete Actions */}
                {selectionMode && selectedIds.size > 0 && (
                     <div className="flex items-center gap-1 mr-2 animate-in fade-in slide-in-from-right-4 duration-200">
                        <button 
                             onClick={handleMassDelete}
                             className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 rounded transition-colors"
                        >
                            <Trash2 size={16} />
                            <span className="text-xs font-bold uppercase">Delete ({selectedIds.size})</span>
                        </button>
                    </div>
                )}

                {/* Selection Mode Toggle */}
                {!isImporting && (
                    <button 
                        onClick={toggleSelectionMode}
                        className={cn(
                            "p-2 rounded transition-colors mr-2",
                            selectionMode 
                                ? "text-brand-primary bg-brand-primary/10 ring-1 ring-brand-primary/50" 
                                : "text-gray-400 hover:text-white hover:bg-white/10"
                        )}
                        title={selectionMode ? "Cancel Selection" : "Select Items"}
                    >
                        {selectionMode ? <X size={20} /> : <CheckSquare size={20} />}
                    </button>
                )}

                <button 
                    onClick={closeCommandCenter} 
                    className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>



        {/* Body - Grid Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
            
            {/* Left Column: Controls (3 cols) */}
            <div className="md:col-span-3 p-6 space-y-6 border-r border-white/10 overflow-y-auto bg-gray-900/50">
                
                {/* Mode Switcher - Hide when importing */}
                {!isImporting && !selectionMode && (
                <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex flex-col gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Builder Mode</span>
                    
                    <div className="flex flex-col gap-2">
                         <button 
                            onClick={() => useDeckStore.getState().setMode("SOLO")}
                            className={cn(
                                "flex items-center justify-between py-3 px-4 text-xs font-bold uppercase rounded border transition-all",
                                mode === "SOLO" 
                                    ? "bg-brand-primary text-white border-brand-primary shadow-sm" 
                                    : "bg-black/40 text-gray-400 border-white/10 hover:text-white hover:border-white/30"
                            )}
                        >
                            <span>Solo Deck</span>
                            {mode === "SOLO" && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                        </button>
                        <button 
                            onClick={() => useDeckStore.getState().setMode("TEAM")}
                            className={cn(
                                "flex items-center justify-between py-3 px-4 text-xs font-bold uppercase rounded border transition-all",
                                mode === "TEAM"
                                    ? "bg-brand-primary text-white border-brand-primary shadow-sm" 
                                    : "bg-black/40 text-gray-400 border-white/10 hover:text-white hover:border-white/30"
                            )}
                        >
                            <span>Team Roster</span>
                             {mode === "TEAM" && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                        </button>
                    </div>
                </div>
                )}

                {/* Selection Controls */}
                {selectionMode && (
                     <div className="p-4 bg-brand-primary/5 rounded-lg border border-brand-primary/20 flex flex-col gap-3">
                         <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">Selection</span>
                         <button 
                            onClick={selectAll}
                            className="w-full py-2 text-xs font-bold text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                         >
                             Select All
                         </button>
                         <button 
                            onClick={deselectAll}
                            className="w-full py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                         >
                             Deselect All
                         </button>
                     </div>
                )}

                <div className="pt-4 text-[10px] text-gray-400 text-center leading-relaxed border-t border-white/5 mt-auto">
                    {selectionMode 
                        ? <p>Select items to delete them in bulk.</p>
                        : <p>Load a deck to edit it in the main workspace.</p>
                    }
                </div>
            </div>

            {/* Right Column: Library / Lists (9 cols) */}
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
                            onToggleSelect={toggleItemSelection}
                        />
                    ) : (
                        <SoloForgeList 
                            isTeamMode={isImporting}
                            selectionMode={selectionMode}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleItemSelection}
                        />
                    )}
                </div>
            </div>

        </div>

        {/* Footer with Close Button (Mobile Friendly) */}
        <div className="p-4 border-t border-white/10 bg-gray-950/50 shrink-0 md:hidden">
            <button
                onClick={closeCommandCenter}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <X size={20} />
                Close Library
            </button>
        </div>

        {/* Hidden File Input */}
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".json" 
            onChange={handleImportFile}
        />

        {/* Import Confirmation */}
        <ImportConfirmationModal 
            isOpen={showImportConfirm} 
            onClose={() => setShowImportConfirm(false)} 
            onConfirm={() => fileInputRef.current?.click()} 
        />

        {/* Clear Data Confirmation */}
        <ClearDataConfirmationModal 
            isOpen={showClearDataConfirm}
            onClose={() => setShowClearDataConfirm(false)}
            onConfirm={handleClearData}
        />
      </div>
    </div>,
    document.body
  );
}

function SettingsIcon({ mode, isImporting }: { mode: string, isImporting: boolean }) {
    if (isImporting) return <Copy size={20} className="text-brand-primary" />;
    if (mode === "TEAM") return <Users size={20} className="text-brand-accent" />;
    return <div className="w-5 h-5 rounded bg-brand-primary/20 border border-brand-primary/50 flex items-center justify-center text-[10px] font-bold text-brand-primary">S</div>;
}
