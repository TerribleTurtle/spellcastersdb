"use client";

import { useState } from "react";

import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface FilterSectionProps {
  title: string;
  options: string[] | readonly string[];
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
        aria-expanded={isExpanded}
        className="flex items-center justify-between w-full text-left group"
      >
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest group-hover:text-text-primary transition-colors">
          {title}
        </h3>
        {isExpanded ? (
          <ChevronUp size={14} className="text-text-dimmed" />
        ) : (
          <ChevronDown size={14} className="text-text-dimmed" />
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
                  aria-pressed={isSelected}
                  className={cn(
                    "flex items-center justify-center p-2.5 min-h-[44px] rounded border text-xs font-mono font-bold transition-all",
                    isSelected
                      ? "bg-brand-primary border-brand-primary text-text-primary"
                      : "bg-surface-card border-border-subtle text-text-secondary hover:border-brand-primary/30"
                  )}
                >
                  {option}
                </button>
              );
            }

            return (
              <button
                key={option}
                role="checkbox"
                aria-checked={isSelected}
                className="flex items-center gap-3 p-2 rounded hover:bg-surface-card cursor-pointer group transition-colors w-full text-left focus:outline-none focus:bg-surface-card"
                onClick={(e) => {
                  e.preventDefault();
                  onToggle(option);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onToggle(option);
                    }
                }}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors lg:w-4 lg:h-4 shrink-0",
                    isSelected
                      ? "bg-brand-primary border-brand-primary"
                      : "border-gray-600 group-hover:border-gray-400"
                  )}
                >
                  {isSelected && <Check size={10} className="text-text-primary" />}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    isSelected
                      ? "text-text-primary"
                      : "text-text-secondary group-hover:text-text-primary"
                  )}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
