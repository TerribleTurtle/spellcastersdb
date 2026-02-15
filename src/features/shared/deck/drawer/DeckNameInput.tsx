"use client";

import { useState, useRef, useEffect } from "react";
import { Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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
    forceActive
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
                className="bg-black/40 border-brand-primary/50 text-sm font-bold text-white uppercase w-full h-8"
                aria-label="Edit deck name"
             />
        );
    }

    return (
        <div 
            className="flex items-center gap-2 group min-w-0" 
            onClick={handleNameClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNameClick(e);
                }
            }}
            aria-label={`Edit deck name: ${name || "Untitled"}`}
        >
            <span className={cn(
                "text-sm font-bold uppercase tracking-wider truncate", 
                forceActive ? "text-white" : "text-gray-400"
            )}>
                {name || "Untitled"}
            </span>
            {onRename && (
                <Edit2 size={14} className="text-gray-400 hover:text-white transition-colors shrink-0" />
            )}
        </div>
    );
}
