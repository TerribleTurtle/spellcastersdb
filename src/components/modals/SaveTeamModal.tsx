import React, { useState } from "react";

import { Save, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeckStore } from "@/store/index";

interface SaveTeamModalProps {
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export function SaveTeamModal({ teamName, isOpen, onClose, onSave }: SaveTeamModalProps) {
  const [name, setName] = useState(teamName || "");
  const [error, setError] = useState<string | null>(null);
  
  // We need a checkTeamNameAvailable selector/action if we want to validte
  // For now, let's just rely on basic validation or check savedTeams directly from store
  const savedTeams = useDeckStore(state => state.savedTeams);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Team name cannot be empty");
      return;
    }

    // Simple duplicate check
    const isDuplicate = savedTeams.some(t => t.name.toLowerCase() === trimmedName.toLowerCase());
    
    // Note: It's okay to overwrite or rename? 
    // Usually "Save Copy" implies unique name or we accept it.
    // Let's warn if duplicate.
    if (isDuplicate) {
       setError("A team with this name already exists.");
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
            Save Team Copy
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Team Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className={cn(
                "w-full bg-black/40 border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all",
                error 
                  ? "border-red-500/50 focus:ring-red-500/50" 
                  : "border-white/10 focus:ring-brand-primary/50 focus:border-brand-primary/50"
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
             This will create a new copy of <strong>{teamName || "this team"}</strong> in your Library.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold rounded-lg shadow-lg shadow-brand-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={16} />
            Save Copy
          </button>
        </div>
      </div>
    </div>
  );
}
