"use client";

import { useEffect, useRef, useState } from "react";

import { Edit2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DeckNameInputProps {
  name: string;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onRename?: (name: string) => void;
  onActivate?: () => void;
  forceActive?: boolean;
}

export function DeckNameInput({
  name,
  isEditing,
  setIsEditing,
  onRename,
  onActivate,
  forceActive,
}: DeckNameInputProps) {
  const [editName, setEditName] = useState(name || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      // eslint-disable-next-line
      setEditName(name || "");
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isEditing, name]);

  const handleSave = () => {
    setIsEditing(false);
    if (onRename && editName.trim() !== "") {
      onRename(editName.trim());
    } else {
      setEditName(name || ""); // Reset if empty/cancelled
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditName(name || "");
    }
  };

  const handleNameClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (onRename) {
      setIsEditing(true);
      if (onActivate) onActivate();
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-inset border-brand-primary/50 text-sm font-bold text-text-primary uppercase w-full h-8"
        aria-label="Edit deck name"
      />
    );
  }

  return (
    <div
      className="flex items-center gap-2 group min-w-0"
      // Removed onClick, role, tabIndex, onKeyDown to allow click to bubble up to drawer header
    >
      <span
        className={cn(
          "text-sm font-bold uppercase tracking-wider truncate",
          forceActive ? "text-text-primary" : "text-text-muted"
        )}
      >
        {name || "Untitled"}
      </span>
      {onRename && (
        <button
          onClick={handleNameClick}
          className="flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-sm"
          aria-label="Rename deck"
          type="button"
        >
          <Edit2 size={14} />
        </button>
      )}
    </div>
  );
}
