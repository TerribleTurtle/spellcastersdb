import React, { useState } from "react";
import { createPortal } from "react-dom";

import { AlertTriangle, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/utils";
import { useDeckStore } from "@/store/index";
import { Deck } from "@/types/deck";

interface SaveDeckModalProps {
  deck: Deck;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export function SaveDeckModal({
  deck,
  isOpen,
  onClose,
  onSave,
  onOverwrite,
}: SaveDeckModalProps & { onOverwrite?: (name: string) => void }) {
  const modalRef = useFocusTrap(isOpen, onClose);
  const [name, setName] = useState(deck.name || "");
  const [error, setError] = useState<string | null>(null);
  const [showOverwrite, setShowOverwrite] = useState(false);

  const checkDeckNameAvailable = useDeckStore(
    (state) => state.checkDeckNameAvailable
  );

  const handleSaveAttempt = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Deck name cannot be empty");
      return;
    }

    const isAvailable = checkDeckNameAvailable(trimmedName);
    if (!isAvailable) {
      if (onOverwrite) {
        setError(`A deck named "${trimmedName}" already exists.`);
        setShowOverwrite(true);
      } else {
        setError("A deck with this name already exists in your library.");
      }
      return;
    }

    onSave(trimmedName);
    onClose();
  };

  const handleOverwrite = () => {
    if (onOverwrite) {
      onOverwrite(name.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-deck-title"
        className="w-full max-w-md bg-surface-card border border-border-default rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-default bg-surface-card">
          <h3
            id="save-deck-title"
            className="text-lg font-bold text-text-primary flex items-center gap-2"
          >
            <Save size={20} className="text-brand-primary" />
            {showOverwrite ? "Overwrite Deck?" : "Save Copy to Library"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Deck Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) {
                  setError(null);
                  setShowOverwrite(false);
                }
              }}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (showOverwrite ? handleOverwrite() : handleSaveAttempt())
              }
              className={cn(
                "bg-surface-inset border-border-default text-text-primary placeholder-gray-600 focus-visible:ring-brand-primary/50",
                error &&
                  "border-status-danger/50 focus-visible:ring-status-danger/50"
              )}
              placeholder="Enter deck name..."
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-2 text-status-danger-text text-sm mt-2 animate-in slide-in-from-top-1">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="text-sm text-text-muted bg-surface-card p-3 rounded-lg border border-border-subtle">
            {showOverwrite ? (
              <>
                This will <strong>overwrite</strong> the existing deck data for{" "}
                <strong>{name}</strong>.
              </>
            ) : (
              <>
                This will create a new copy of{" "}
                <strong>{deck.name || "this deck"}</strong> in your Solo
                Library.
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-default bg-surface-card flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          {showOverwrite ? (
            <Button
              onClick={handleOverwrite}
              className="bg-action-danger hover:bg-action-danger-hover text-text-primary"
            >
              <AlertTriangle size={16} className="mr-2" />
              Overwrite
            </Button>
          ) : (
            <Button onClick={handleSaveAttempt} disabled={!name.trim()}>
              <Save size={16} className="mr-2" />
              Save Copy
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
