import React, { useState } from "react";
import { Deck } from "@/types/deck";
import { Save, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeckStore } from "@/store/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SaveDeckModalProps {
  deck: Deck;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export function SaveDeckModal({ deck, isOpen, onClose, onSave }: SaveDeckModalProps) {
  const [name, setName] = useState(deck.name || "");
  const [error, setError] = useState<string | null>(null);
  
  const checkDeckNameAvailable = useDeckStore(state => state.checkDeckNameAvailable);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Deck name cannot be empty");
      return;
    }

    const isAvailable = checkDeckNameAvailable(trimmedName);
    if (!isAvailable) {
      setError("A deck with this name already exists in your library.");
      return;
    }

    onSave(trimmedName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-surface-card border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Save size={20} className="text-brand-primary" />
            Save Copy to Library
          </h3>
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Deck Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className={cn(
                "bg-black/40 border-white/10 text-white placeholder-gray-600 focus-visible:ring-brand-primary/50",
                error && "border-red-500/50 focus-visible:ring-red-500/50"
              )}
              placeholder="Enter deck name..."
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm mt-2 animate-in slide-in-from-top-1">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
             This will create a new copy of <strong>{deck.name || "this deck"}</strong> in your Solo Library.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
          >
            <Save size={16} className="mr-2" />
            Save Copy
          </Button>
        </div>
      </div>
    </div>
  );
}
