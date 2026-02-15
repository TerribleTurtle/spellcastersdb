"use client";

import { useState } from "react";
import { MoreHorizontal, Layers, Link as LinkIcon, Trash2, Edit2, Download } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { createPortal } from "react-dom";
import { useToast } from "@/hooks/useToast";

export function ItemMenu({
  onDuplicate,
  onDelete,
  onCopyLink,
  onRename,
  onExport,
  type,
}: {
  onDuplicate?: () => void;
  onDelete: () => void;
  onCopyLink?: () => void;
  onRename?: () => void;
  onExport?: () => void;
  type: "DECK" | "TEAM";
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToast();

  // Derived labels
  const duplicateLabel = type === "TEAM" ? "Duplicate Team" : "Duplicate Deck";
  const shareLabel = type === "TEAM" ? "Share Team" : "Share Deck";

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors outline-none focus:ring-2 focus:ring-brand-primary active:scale-95 duration-200"
            aria-label="Open menu"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 z-9999 bg-surface-card border border-white/10 shadow-xl p-1 text-gray-200"
        >
          {onDuplicate && (
            <DropdownMenuItem onClick={onDuplicate} className="cursor-pointer">
              <Layers size={14} className="mr-2" />
              <span>{duplicateLabel}</span>
            </DropdownMenuItem>
          )}

          {onCopyLink && (
            <DropdownMenuItem 
                onClick={() => {
                    onCopyLink();
                    showToast("Link copied to clipboard");
                }} 
                className="cursor-pointer"
            >
              <LinkIcon size={14} className="mr-2" />
              <span>{shareLabel}</span>
            </DropdownMenuItem>
          )}

          {onExport && (
            <DropdownMenuItem onClick={onExport} className="cursor-pointer">
              <Download size={14} className="mr-2" />
              <span>Export JSON</span>
            </DropdownMenuItem>
          )}

          {onRename && (
            <DropdownMenuItem onClick={onRename} className="cursor-pointer">
              <Edit2 size={14} className="mr-2" />
              <span>Rename</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
          >
            <Trash2 size={14} className="mr-2" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showDeleteConfirm &&
        typeof document !== "undefined" &&
        createPortal(
          <DeleteConfirmationModal
            type={type}
            onConfirm={() => {
              onDelete();
              setShowDeleteConfirm(false);
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />,
          document.body
        )}
    </>
  );
}

function DeleteConfirmationModal({
  type,
  onConfirm,
  onCancel,
}: {
  type: "DECK" | "TEAM";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
    >
      <div
        className="bg-surface-card border border-white/10 rounded-lg shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 mx-auto flex items-center justify-center mb-2">
            <Trash2 size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">
            Delete {type === "TEAM" ? "Team" : "Deck"}?
          </h3>
          <p className="text-sm text-gray-400">
            Are you sure you want to delete this{" "}
            {type === "TEAM" ? "team" : "deck"}? This action cannot be undone.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded bg-surface-main border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-bold transition-all text-xs uppercase tracking-wider"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="w-full py-2.5 rounded bg-red-500 text-white hover:bg-red-600 font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
