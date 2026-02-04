"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  isGrid?: boolean;
}

export function FilterSection({
  title,
  options,
  selected,
  onToggle,
  isGrid = false,
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left group"
      >
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
          {title}
        </h3>
        {isExpanded ? (
          <ChevronUp size={14} className="text-gray-600" />
        ) : (
          <ChevronDown size={14} className="text-gray-600" />
        )}
      </button>

      {isExpanded && (
        <div
          className={cn(
            "space-y-1",
            isGrid && "grid grid-cols-4 gap-2 space-y-0"
          )}
        >
          {options.map((option) => {
            const isSelected = selected.includes(option);

            if (isGrid) {
              return (
                <button
                  key={option}
                  onClick={() => onToggle(option)}
                  className={cn(
                    "flex items-center justify-center p-2 rounded border text-xs font-mono font-bold transition-all",
                    isSelected
                      ? "bg-brand-primary border-brand-primary text-white"
                      : "bg-surface-card border-white/5 text-gray-400 hover:border-brand-primary/30"
                  )}
                >
                  {option}
                </button>
              );
            }

            return (
              <label
                key={option}
                className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer group transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  onToggle(option);
                }}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-brand-primary border-brand-primary"
                      : "border-gray-600 group-hover:border-gray-400"
                  )}
                >
                  {isSelected && <Check size={10} className="text-white" />}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    isSelected
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-300"
                  )}
                >
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
