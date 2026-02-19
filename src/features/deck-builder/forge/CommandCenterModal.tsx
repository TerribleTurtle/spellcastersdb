"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useCommandCenter } from "@/features/deck-builder/hooks/ui/useCommandCenter";
import { useDeckStore } from "@/store/index";

import { ImportConfirmationModal } from "./modals/ImportConfirmationModal";
import { ClearDataConfirmationModal } from "./modals/ClearDataConfirmationModal";

import { CommandCenterHeader } from "./CommandCenterHeader";
import { CommandCenterSidebar } from "./CommandCenterSidebar";
import { CommandCenterLibrary } from "./CommandCenterLibrary";

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
  
  const setMode = useDeckStore((state) => state.setMode);

  // Hydration/Mounting handled by parent conditional rendering.
  // We still need closeCommandCenter for the focus trap.
  const modalRef = useFocusTrap(commandCenterOpen, closeCommandCenter);

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-overlay-heavy backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden"
      style={{ zIndex: 200 }} 
      onClick={closeCommandCenter}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-5xl h-[90vh] bg-surface-main border border-border-default rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <CommandCenterHeader 
            mode={mode}
            isImporting={isImporting}
            selectionMode={selectionMode}
            selectedCount={selectedIds.size}
            onExport={handleExport}
            onImportClick={handleImportClick}
            onClearDataClick={() => setShowClearDataConfirm(true)}
            onMassDelete={handleMassDelete}
            onToggleSelectionMode={toggleSelectionMode}
            onClose={closeCommandCenter}
        />

        {/* Body - Grid Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
            
            <CommandCenterSidebar 
                mode={mode}
                isImporting={isImporting}
                selectionMode={selectionMode}
                onSetMode={setMode}
                onSelectAll={selectAll}
                onDeselectAll={deselectAll}
            />

            <CommandCenterLibrary 
                mode={mode}
                isImporting={isImporting}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                onToggleSelection={toggleItemSelection}
            />

        </div>

        {/* Footer with Close Button (Mobile Friendly) */}
        <div className="p-4 border-t border-border-default bg-surface-deck/50 shrink-0 md:hidden">
            <button
                onClick={closeCommandCenter}
                className="w-full py-3 bg-surface-hover hover:bg-surface-hover text-text-primary font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
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
