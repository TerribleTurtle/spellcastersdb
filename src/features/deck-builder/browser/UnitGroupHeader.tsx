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
  onToggle,
}: UnitGroupHeaderProps) {
  return (
    <div
      onClick={onToggle}
      className="px-4 h-8 bg-surface-main/95 backdrop-blur-sm sticky top-0 z-10 cursor-pointer group select-none flex items-center"
    >
      <h2 className="text-purple-400 font-bold text-xs uppercase tracking-widest flex items-center justify-between max-w-site-shell mx-auto w-full">
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
