import React from "react";

import { ChevronDown, ChevronRight } from "lucide-react";

interface UnitGroupHeaderProps {
  title: string;
  count: number;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const UnitGroupHeader = React.memo(function UnitGroupHeader({
  title,
  count,
  isCollapsed,
  onToggle
}: UnitGroupHeaderProps) {
  return (
    <div 
        onClick={onToggle}
        className="px-4 pt-6 pb-2 bg-surface-main/95 backdrop-blur-sm sticky top-0 z-10 cursor-pointer group select-none"
    >
      <h2 className="text-purple-400 font-bold text-sm uppercase tracking-widest border-b border-border-subtle pb-1 flex items-center justify-between max-w-[1920px] mx-auto">
        <span>
            {title}{" "}
            <span className="text-text-secondary text-xs ml-2">({count})</span>
        </span>
        <span className="text-text-dimmed group-hover:text-text-primary transition-colors">
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </span>
      </h2>
    </div>
  );
});
