import React, { useState } from "react";
import { Save, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeckStore } from "@/store/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SaveTeamModalProps {
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
}

import { createPortal } from "react-dom";

export function SaveTeamModal({ teamName, isOpen, onClose, onSave, onOverwrite }: SaveTeamModalProps & { onOverwrite?: (name: string) => void }) {
  const [name, setName] = useState(teamName || "");
  const [error, setError] = useState<string | null>(null);
  const [showOverwrite, setShowOverwrite] = useState(false);
  
  const savedTeams = useDeckStore(state => state.savedTeams);

  const handleSaveAttempt = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Team name cannot be empty");
      return;
    }

    // Simple duplicate check
    const isDuplicate = savedTeams.some(t => t.name.toLowerCase() === trimmedName.toLowerCase());
    
    if (isDuplicate) {
       if (onOverwrite) {
           setError(`A team named "${trimmedName}" already exists.`);
           setShowOverwrite(true);
       } else {
           setError("A team with this name already exists.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-surface-card border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Save size={20} className="text-brand-primary" />
            {showOverwrite ? "Overwrite Team?" : "Save Team Copy"}
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
              Team Name
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
              onKeyDown={(e) => e.key === "Enter" && (showOverwrite ? handleOverwrite() : handleSaveAttempt())}
              className={cn(
                "bg-black/40 border-white/10 text-white placeholder-gray-600 focus-visible:ring-brand-primary/50",
                error && "border-red-500/50 focus-visible:ring-red-500/50"
              )}
              placeholder="Enter team name..."
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
             {showOverwrite
                ? <>This will <strong>overwrite</strong> the existing team data for <strong>{name}</strong>.</>
                : <>This will create a new copy of <strong>{teamName || "this team"}</strong> in your Library.</>
             }
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

          {showOverwrite ? (
              <Button
                onClick={handleOverwrite}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <AlertTriangle size={16} className="mr-2" />
                Overwrite
              </Button>
          ) : (
              <Button
                onClick={handleSaveAttempt}
                disabled={!name.trim()}
              >
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
